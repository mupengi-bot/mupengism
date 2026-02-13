---
name: hook-engine
description: 스킬 실행 전/후/에러 시 자동 트리거 훅 시스템
trigger: ["훅 설정", "hook", "자동 트리거", "후처리", "스킬 연결"]
tier: 0
author: 무펭이 🐧
registry: hooks/registry.md
log_path: memory/hooks/
events_path: events/
hook_types:
  pre:
    - source: mail
      action: security-scan
    - source: insta-post
      action: image-validate
    - source: release-discipline
      action: test-run
  post:
    - source: git-auto
      target: daily-report
    - source: insta-post
      target: content-published-event
    - source: competitor-watch
      target: market-update-event
    - source: tokenmeter
      condition: cost > 500
      target: notification-hub
    - source: think-tank
      target: insight-discovered-event
    - source: cardnews
      target: social-publisher
      approval: true
    - source: code-review
      condition: passed
      target: git-auto
    - source: self-eval
      target: growth-dashboard
  on_error:
    - source: any
      target: error-log
    - source: any
      target: notification-hub
      urgency: urgent
    - source: browser-dependent
      action: browser-recovery
  scheduled:
    - cron: "0 9 * * *"
      target: trend-radar
    - cron: "0 22 * * *"
      target: daily-report
    - cron: "0 9 * * 1"
      target: self-eval
    - cron: "0 9 * * 5"
      target: competitor-watch
---
