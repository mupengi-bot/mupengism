#!/usr/bin/env node
/**
 * insta-cli v2.1 — Instagram DM via Internal API
 * 
 * 브라우저 스냅샷 0회. CDP 쿠키 추출 → API 직접 호출.
 * 
 * v2.1 변경사항:
 * - CDP 쿠키 추출 안정화 (에러 핸들링 강화)
 * - Network.enable 불필요 — Storage.getCookies 사용
 * - reply 명령어: API 전송 시도 → 실패시 browser fallback 안내
 * - check-notify 통합 (--notify 옵션)
 */

const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const { program } = require('commander');

const BROWSER_PORT = process.env.BROWSER_PORT || '18800';
const IG_APP_ID = '936619743392459';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ─── Cookie extraction via CDP ───

async function getPageTarget() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${BROWSER_PORT}/json`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data);
          const ig = pages.find(p => p.type === 'page' && p.url?.includes('instagram.com/direct/')) ||
                     pages.find(p => p.type === 'page' && p.url?.includes('instagram.com') && !p.url?.includes('/accounts/login'));
          if (ig) resolve(ig.webSocketDebuggerUrl);
          else reject(new Error('Instagram 탭이 없습니다. 브라우저에서 Instagram을 열어주세요.'));
        } catch (e) {
          reject(new Error(`CDP JSON 파싱 실패: ${e.message}`));
        }
      });
    });
    req.on('error', (e) => reject(new Error(`CDP 연결 실패 (포트 ${BROWSER_PORT}): ${e.message}`)));
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('CDP 연결 타임아웃')); });
  });
}

async function extractCookies() {
  const wsUrl = await getPageTarget();
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timeout = setTimeout(() => { ws.close(); reject(new Error('CDP WebSocket 타임아웃 (5초)')); }, 5000);
    let msgId = 0;
    
    ws.on('open', () => {
      // Storage.getCookies는 Network.enable 없이 작동
      ws.send(JSON.stringify({
        id: ++msgId,
        method: 'Storage.getCookies',
        params: { browserContextId: undefined }
      }));
    });
    
    ws.on('message', (msg) => {
      try {
        const resp = JSON.parse(msg.toString());
        
        // 에러 응답 체크
        if (resp.error) {
          // Storage.getCookies 실패시 Network.getCookies로 폴백
          if (resp.id === 1) {
            ws.send(JSON.stringify({ id: ++msgId, method: 'Network.enable', params: {} }));
            return;
          }
          if (resp.id === 2) {
            ws.send(JSON.stringify({
              id: ++msgId,
              method: 'Network.getCookies',
              params: { urls: ['https://www.instagram.com'] }
            }));
            return;
          }
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`CDP 에러: ${JSON.stringify(resp.error)}`));
          return;
        }
        
        // Network.enable 성공 → getCookies 호출
        if (resp.id === 2 && !resp.result?.cookies) {
          ws.send(JSON.stringify({
            id: ++msgId,
            method: 'Network.getCookies',
            params: { urls: ['https://www.instagram.com'] }
          }));
          return;
        }
        
        // 쿠키가 있는 응답 처리
        const cookies = resp.result?.cookies;
        if (cookies && Array.isArray(cookies)) {
          clearTimeout(timeout);
          
          // Instagram 관련 쿠키만 필터링
          const igCookies = cookies.filter(c => 
            c.domain?.includes('instagram.com') || c.domain?.includes('.instagram.com')
          );
          
          if (igCookies.length === 0) {
            ws.close();
            reject(new Error('Instagram 쿠키가 없습니다. 로그인 상태를 확인해주세요.'));
            return;
          }
          
          const cookieStr = igCookies.map(c => `${c.name}=${c.value}`).join('; ');
          const csrftoken = igCookies.find(c => c.name === 'csrftoken')?.value;
          const userId = igCookies.find(c => c.name === 'ds_user_id')?.value;
          
          if (!csrftoken) {
            ws.close();
            reject(new Error('csrftoken 쿠키를 찾을 수 없습니다.'));
            return;
          }
          
          ws.close();
          resolve({ cookieStr, csrftoken, userId });
        }
      } catch (e) {
        // JSON 파싱 에러는 무시 (CDP 이벤트일 수 있음)
      }
    });
    
    ws.on('error', (e) => { clearTimeout(timeout); reject(new Error(`WebSocket 에러: ${e.message}`)); });
  });
}

// ─── Instagram API helpers ───

function igRequest(path, { cookies, method = 'GET', body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.instagram.com',
      path,
      method,
      headers: {
        'Cookie': cookies.cookieStr,
        'X-CSRFToken': cookies.csrftoken,
        'X-IG-App-ID': IG_APP_ID,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Instagram-AJAX': '1',
        'User-Agent': UA,
        'Accept': '*/*',
        'Referer': 'https://www.instagram.com/direct/inbox/',
        'Origin': 'https://www.instagram.com',
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data.substring(0, 500) });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('API 요청 타임아웃')); });
    if (body) req.write(body);
    req.end();
  });
}

// ─── Commands ───

async function cmdInbox(opts) {
  const cookies = await extractCookies();
  const limit = opts.limit || 15;
  const resp = await igRequest(
    `/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=${limit}&thread_message_limit=1`,
    { cookies }
  );
  
  if (resp.status !== 200 || !resp.data?.inbox) {
    console.log(JSON.stringify({ error: 'API 실패', status: resp.status, detail: resp.raw?.substring(0, 200) }));
    process.exit(1);
    return;
  }
  
  const threads = resp.data.inbox.threads.map(t => ({
    threadId: t.thread_id,
    username: t.users?.[0]?.username || (t.is_group ? `group_${t.thread_id}` : 'unknown'),
    fullName: t.users?.[0]?.full_name || t.thread_title || '',
    lastMessage: t.last_permanent_item?.text?.substring(0, 80) || t.last_permanent_item?.item_type || '',
    lastMessageFrom: t.last_permanent_item?.user_id == cookies.userId ? 'me' : 'them',
    timestamp: new Date(t.last_permanent_item?.timestamp / 1000).toISOString(),
    unread: t.read_state !== 0,
    isGroup: t.is_group
  }));
  
  console.log(JSON.stringify(threads, null, 2));
}

async function cmdUnread() {
  const cookies = await extractCookies();
  const resp = await igRequest(
    '/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=20&thread_message_limit=1',
    { cookies }
  );
  
  if (resp.status !== 200 || !resp.data?.inbox) {
    console.log(JSON.stringify({ error: 'API 실패', status: resp.status }));
    process.exit(1);
    return;
  }
  
  const unread = resp.data.inbox.threads
    .filter(t => t.read_state !== 0)
    .map(t => ({
      threadId: t.thread_id,
      username: t.users?.[0]?.username || 'unknown',
      fullName: t.users?.[0]?.full_name || '',
      lastMessage: t.last_permanent_item?.text?.substring(0, 100) || t.last_permanent_item?.item_type || '',
      lastMessageFrom: t.last_permanent_item?.user_id == cookies.userId ? 'me' : 'them',
      timestamp: new Date(t.last_permanent_item?.timestamp / 1000).toISOString()
    }));
  
  console.log(JSON.stringify(unread, null, 2));
}

async function cmdCheck() {
  const cookies = await extractCookies();
  const resp = await igRequest(
    '/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=20&thread_message_limit=1',
    { cookies }
  );
  
  if (resp.status !== 200 || !resp.data?.inbox) {
    console.log(JSON.stringify({ error: true }));
    process.exit(1);
    return;
  }
  
  const unreadThreads = resp.data.inbox.threads.filter(t => t.read_state !== 0);
  const unreadFromOthers = unreadThreads.filter(t => 
    t.last_permanent_item?.user_id != cookies.userId
  );
  
  console.log(JSON.stringify({
    unreadCount: unreadThreads.length,
    newMessages: unreadFromOthers.length,
    users: unreadFromOthers.map(t => t.users?.[0]?.username || 'unknown')
  }));
}

async function cmdRead(username, opts) {
  const cookies = await extractCookies();
  const limit = opts.limit || 10;
  
  const inboxResp = await igRequest(
    '/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=20&thread_message_limit=1',
    { cookies }
  );
  
  if (inboxResp.status !== 200 || !inboxResp.data?.inbox) {
    console.log(JSON.stringify({ error: 'inbox API 실패' }));
    process.exit(1);
    return;
  }
  
  const thread = inboxResp.data.inbox.threads.find(t => 
    t.users?.some(u => u.username === username) ||
    t.thread_title?.toLowerCase().includes(username.toLowerCase())
  );
  
  if (!thread) {
    console.log(JSON.stringify({ error: `"${username}" 대화를 찾을 수 없음` }));
    process.exit(1);
    return;
  }
  
  const threadResp = await igRequest(
    `/api/v1/direct_v2/threads/${thread.thread_id}/?limit=${limit}`,
    { cookies }
  );
  
  if (threadResp.status !== 200 || !threadResp.data?.thread) {
    console.log(JSON.stringify({ error: 'thread API 실패', status: threadResp.status }));
    process.exit(1);
    return;
  }
  
  const userMap = {};
  threadResp.data.thread.users?.forEach(u => { userMap[u.pk] = u.username; });
  
  const messages = threadResp.data.thread.items.map(item => ({
    from: item.user_id == cookies.userId ? 'me' : (userMap[item.user_id] || username),
    text: item.text || `[${item.item_type}]`,
    type: item.item_type,
    timestamp: new Date(item.timestamp / 1000).toISOString()
  })).reverse();
  
  console.log(JSON.stringify({ threadId: thread.thread_id, username, messages }, null, 2));
}

async function cmdReply(username, message) {
  const cookies = await extractCookies();
  
  const inboxResp = await igRequest(
    '/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=20&thread_message_limit=1',
    { cookies }
  );
  
  if (inboxResp.status !== 200 || !inboxResp.data?.inbox) {
    console.log(JSON.stringify({ success: false, error: 'inbox API 실패' }));
    process.exit(1);
    return;
  }
  
  const thread = inboxResp.data.inbox.threads.find(t =>
    t.users?.some(u => u.username === username)
  );
  
  if (!thread) {
    console.log(JSON.stringify({ success: false, error: `"${username}" 대화를 찾을 수 없음` }));
    process.exit(1);
    return;
  }
  
  // API로 직접 전송 시도
  const body = new URLSearchParams({
    action: 'send_item',
    thread_ids: `[${thread.thread_id}]`,
    client_context: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
    text: message
  }).toString();
  
  const sendResp = await igRequest('/api/v1/direct_v2/threads/broadcast/text/', {
    cookies,
    method: 'POST',
    body
  });
  
  if (sendResp.status === 200 && sendResp.data?.status === 'ok') {
    console.log(JSON.stringify({ success: true, to: username, threadId: thread.thread_id }));
  } else {
    // API 실패 — browser fallback 안내
    console.log(JSON.stringify({
      success: false,
      method: 'use_browser',
      to: username,
      threadId: thread.thread_id,
      threadUrl: `https://www.instagram.com/direct/t/${thread.thread_id}/`,
      message,
      apiStatus: sendResp.status,
      apiError: sendResp.data?.message || sendResp.raw?.substring(0, 100),
      instruction: 'API 전송 실패. browser tool로 threadUrl 접속 후 메시지 입력+전송 필요.'
    }));
    process.exit(1);
  }
}

// ─── CLI ───

program
  .name('insta-cli')
  .description('Instagram DM CLI v2.1 — Internal API, zero browser snapshots')
  .version('2.1.0');

program.command('inbox').description('전체 DM 목록').option('-l, --limit <n>', '스레드 수', '15').action(cmdInbox);
program.command('unread').description('읽지 않은 DM만').action(cmdUnread);
program.command('check').description('unread 개수만 (cron용)').action(cmdCheck);
program.command('read <username>').description('특정 대화 읽기').option('-l, --limit <n>', '메시지 수', '10').action(cmdRead);
program.command('reply <username> <message>').description('답장 보내기').action(cmdReply);

program.parse();
