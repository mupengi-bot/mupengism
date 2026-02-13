#!/usr/bin/env node
/**
 * dm-watcher.js — Instagram DM 실시간 감지 데몬
 * 
 * Chrome 인스타 탭의 title 변화를 CDP로 감지.
 * "(N)" 패턴 → 새 DM → 자동 응답 트리거.
 * 
 * 토큰 소모: 0 (브라우저 스냅샷 안 함)
 * API 호출: 새 DM 감지시에만
 * 
 * 사용법:
 *   node dm-watcher.js                  — 감지만 (콘솔 출력)
 *   node dm-watcher.js --webhook <url>  — 감지시 webhook POST
 *   node dm-watcher.js --auto-reply     — 자동 응답 (OpenClaw 세션으로 전달)
 */

const http = require('http');
const WebSocket = require('ws');
const { execSync, exec } = require('child_process');
const path = require('path');

const BROWSER_PORT = process.env.BROWSER_PORT || '18800';
const CHECK_INTERVAL = 15000; // 15초마다 v2.js check (API 1회, 토큰 0)
const CLI_PATH = path.join(__dirname, 'v2.js');
const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://127.0.0.1:18890';

const args = process.argv.slice(2);
const AUTO_REPLY = args.includes('--auto-reply');
const WEBHOOK_IDX = args.indexOf('--webhook');
const WEBHOOK_URL = WEBHOOK_IDX >= 0 ? args[WEBHOOK_IDX + 1] : null;

let lastUnreadCount = 0;
let processing = false;
let ws = null;

// ─── CDP 연결 ───

async function findInstagramTab() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${BROWSER_PORT}/json`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data);
          const ig = pages.find(p => p.type === 'page' && p.url?.includes('instagram.com'));
          resolve(ig || null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function getTitleViaCDP(wsUrl) {
  return new Promise((resolve, reject) => {
    const conn = new WebSocket(wsUrl);
    const timeout = setTimeout(() => { conn.close(); resolve(null); }, 3000);
    
    conn.on('open', () => {
      conn.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: 'document.title' }
      }));
    });
    
    conn.on('message', (msg) => {
      try {
        const resp = JSON.parse(msg.toString());
        if (resp.id === 1) {
          clearTimeout(timeout);
          conn.close();
          resolve(resp.result?.result?.value || null);
        }
      } catch {}
    });
    
    conn.on('error', () => { clearTimeout(timeout); resolve(null); });
  });
}

// ─── 알림 처리 ───

function parseUnreadFromTitle(title) {
  if (!title) return 0;
  const match = title.match(/^\((\d+)\)/);
  return match ? parseInt(match[1]) : 0;
}

async function handleNewDM() {
  if (processing) return;
  processing = true;
  
  const fs = require('fs');
  const alertFile = path.join(__dirname, 'dm-alert.json');
  
  try {
    // v2.js unread로 상세 정보 확인
    const result = execSync(`node "${CLI_PATH}" unread`, { timeout: 15000, encoding: 'utf8' });
    const threads = JSON.parse(result);
    
    const timestamp = new Date().toISOString();
    
    // 상대방이 보낸 것만 (내가 보낸 건 무시)
    const newDMs = threads.filter(t => t.lastMessageFrom === 'them');
    
    if (newDMs.length === 0) {
      console.log(`[${timestamp}] title 변했지만 새 DM 아님 (내가 보낸 거)`);
      processing = false;
      return;
    }
    
    console.log(`[${timestamp}] 📩 새 DM ${newDMs.length}건!`);
    
    // 각 DM의 최근 메시지 3개씩 읽기
    const dmDetails = [];
    for (const dm of newDMs) {
      try {
        const readResult = execSync(`node "${CLI_PATH}" read "${dm.username}" -l 3`, { timeout: 15000, encoding: 'utf8' });
        const detail = JSON.parse(readResult);
        dmDetails.push({
          username: dm.username,
          fullName: dm.fullName,
          threadId: detail.threadId,
          messages: detail.messages
        });
        console.log(`  → ${dm.username}: "${dm.lastMessage?.substring(0, 50)}"`);
      } catch (e) {
        console.error(`  → ${dm.username}: 읽기 실패 - ${e.message}`);
        dmDetails.push({ username: dm.username, fullName: dm.fullName, error: e.message });
      }
    }
    
    // dm-alert.json에 메시지 내용 포함해서 기록
    const alert = {
      timestamp,
      newMessages: newDMs.length,
      dms: dmDetails,
      handled: false
    };
    fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
    console.log(`[auto-reply] dm-alert.json 기록 완료 (${dmDetails.length}건)`);
    
    // Discord DM으로 알림 → OpenClaw 세션 자동 활성화
    const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
    const DISCORD_USER_ID = process.env.OWNER_DISCORD_ID || '';
    
    if (DISCORD_TOKEN) {
      const https = require('https');
      const userList = newDMs.map(d => d.username).join(', ');
      const msgPreview = dmDetails.map(d => {
        const lastMsg = d.messages?.[d.messages.length - 1];
        return `${d.username}: "${(lastMsg?.text || '').substring(0, 50)}"`;
      }).join('\n');
      
      // 1) DM 채널 열기
      const createDM = (token, userId) => new Promise((resolve, reject) => {
        const body = JSON.stringify({ recipient_id: userId });
        const req = https.request({
          hostname: 'discord.com',
          path: '/api/v10/users/@me/channels',
          method: 'POST',
          headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(d); } });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
      
      // 2) 메시지 전송
      const sendMsg = (token, channelId, content) => new Promise((resolve, reject) => {
        const body = JSON.stringify({ content });
        const req = https.request({
          hostname: 'discord.com',
          path: `/api/v10/channels/${channelId}/messages`,
          method: 'POST',
          headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(d); } });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
      
      try {
        const dm = await createDM(DISCORD_TOKEN, DISCORD_USER_ID);
        const alertMsg = `📩 인스타 새 DM ${newDMs.length}건\n${msgPreview}\n\ndm-alert.json 확인하고 답장해줘. 보안 위협이면 답장하지 말고 형님한테 알려.`;
        await sendMsg(DISCORD_TOKEN, dm.id, alertMsg);
        console.log(`[discord] 알림 전송 완료 → channel ${dm.id}`);
      } catch (e) {
        console.error(`[discord 에러] ${e.message || e}`);
      }
    } else {
      console.log(`[alert] DISCORD_TOKEN 없음. dm-alert.json만 기록.`);
    }
    
  } catch (e) {
    console.error(`[에러] ${e.message}`);
  }
  
  processing = false;
}

// ─── 메인 루프 (v2.js check 기반) ───

let lastSeenUsers = new Set(); // 이미 알림 보낸 유저 추적

async function watchLoop() {
  console.log(`[${new Date().toISOString()}] 🔍 v2.js check 기반 감시 시작`);
  console.log(`  모드: ${AUTO_REPLY ? '자동 응답' : '감지만'}`);
  console.log(`  체크 간격: ${CHECK_INTERVAL/1000}초`);
  console.log('');
  
  const poll = async () => {
    try {
      const result = execSync(`node "${CLI_PATH}" check`, { timeout: 15000, encoding: 'utf8' });
      const info = JSON.parse(result);
      
      if (info.newMessages > 0) {
        // 새 유저가 있는지 확인 (이미 알림 보낸 유저는 스킵)
        const newUsers = info.users.filter(u => !lastSeenUsers.has(u));
        
        if (newUsers.length > 0) {
          console.log(`[${new Date().toISOString()}] 📩 새 DM! from: ${newUsers.join(', ')}`);
          newUsers.forEach(u => lastSeenUsers.add(u));
          await handleNewDM();
        }
      } else {
        // DM 없으면 추적 리셋
        lastSeenUsers.clear();
      }
    } catch (e) {
      console.error(`[${new Date().toISOString()}] check 에러: ${e.message?.substring(0, 100)}`);
    }
    
    setTimeout(poll, CHECK_INTERVAL);
  };
  
  poll();
}

// ─── 시작 ───

console.log('🐧 Instagram DM Watcher v1.0');
console.log(`  auto-reply: ${AUTO_REPLY}`);
console.log(`  webhook: ${WEBHOOK_URL || 'none'}`);
console.log('');

watchLoop();
