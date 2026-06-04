# Data Flow & User Actions

```
                              ┌──────────────────────────────────────────────┐
                              │                  SIGN UP                     │
                              │         User registers / signs up            │
                              └──────────────────┬───────────────────────────┘
                                                 │
                                                 ▼
                                          ┌──────────┐
                                          │  users   │
                                          └────┬─────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
           ┌──────────────┐          ┌──────────────┐          ┌────────────────┐
           │   SELECTS A   │          │  CREATES A   │          │    ACTIONS     │
           │    PLAN       │          │    BOT       │          │ (delete, etc.) │
           └──────┬───────┘          └──────┬───────┘          └───────┬────────┘
                  │                         │                          │
                  ▼                         ▼                          ▼
          ┌──────────────┐          ┌──────────────┐           ┌──────────────┐
          │subscriptions │          │     bots     │           │  audit_logs  │
          │              │          │              │           │              │
          │ - on signup  │          │ - user       │           │ - user_id    │
          │   (free)     │          │   creates a  │           │ - action:    │
          │ - on upgrade │          │   new bot    │           │   "delete"   │
          │   (paid)     │          │              │           │ - resource:  │
          └──────┬───────┘          └──────┬───────┘           │   "bot"      │
                 │                         │                   └──────────────┘
                 │                         │
                 │                         ▼
                 │                 ┌────────────────────┐
                 │                 │   ADDS KNOWLEDGE   │
                 │                 │   SOURCE (file/    │
                 │                 │   text/URL/crawl)  │
                 │                 └────────┬───────────┘
                 │                          │
                 │                          ▼
                 │                  ┌──────────────────┐
                 │                  │knowledge_sources │
                 │                  │                  │
                 │                  │ - source_type    │
                 │                  │ - index_status:  │
                 │                  │   "pending"      │
                 │                  └────────┬─────────┘
                 │                           │
                 │                           ▼  (background job)
                 │                  ┌──────────────────┐
                 │                  │    CHUNKING +    │
                 │                  │   EMBEDDING      │
                 │                  └────────┬─────────┘
                 │                           │
                 │                           ▼
                 │                  ┌──────────────────┐
                 │                  │     chunks       │
                 │                  │                  │
                 │                  │ - embedded text  │
                 │                  │   chunks with    │
                 │                  │   vector + model │
                 │                  └────────┬─────────┘
                 │                           │
                 │                           ▼  (on complete)
                 │                  ┌──────────────────┐
                 │                  │knowledge_sources │
                 │                  │                  │
                 │                  │ - index_status:  │
                 │                  │   "completed"    │
                 │                  │ - indexed_at     │
                 │                  └──────────────────┘
                 │
                 │                ┌──────────────────────────┐
                 │                │   VISITOR INTERACTION    │
                 │                └──────────┬───────────────┘
                 │                           │
                 │          ┌────────────────┼──────────────────┐
                 │          │                │                  │
                 │          ▼                ▼                  ▼
                 │   ┌──────────────┐  ┌──────────┐   ┌──────────────────┐
                 │   │conversations │  │ messages │   │message_feedback  │
                 │   │              │  │          │   │                  │
                 │   │ - new        │  │ - each   │   │ - thumbs up/down │
                 │   │   visitor    │  │   message│   │ - comment        │
                 │   │   session    │  │   in convo│   └──────────────────┘
                 │   │ - bot_id,    │  │ - role:  │
                 │   │   session_id │  │   user/  │
                 │   └──────┬───────┘  │   bot    │
                 │          │          │ - tokens │
                 │          │          │ - latency│
                 │          │          │ - sources│
                 │          │          └──────┬───┘
                 │          │                 │
                 │          ▼                 ▼
                 │   ┌─────────────────────────────────────────┐
                 │   │        bot_analytics_daily              │
                 │   │                                         │
                 │   │ (upserted by cron/on-event)             │
                 │   │ per (bot_id, date):                     │
                 │   │   total_conversations++                 │
                 │   │   total_messages += n                   │
                 │   │   unique_visitors = COUNT(DISTINCT)     │
                 │   │   avg_messages_per_conv                 │
                 │   │   avg_confidence_score                  │
                 │   │   total_tokens_used += n                │
                 │   │   avg_latency_ms = AVG(...)             │
                 │   │   thumbs_up/down += n                   │
                 │   └─────────────────────────────────────────┘
                 │
                 ▼
          ┌──────────────────────┐
          │     BILLING FLOW     │
          │                      │
          │ 1. Plan seed data    │
          │    → plans (static)  │
          │                      │
          │ 2. User subscribes   │
          │    → subscriptions   │
          │                      │
          │ 3. Stripe webhook    │
          │    fires on payment  │
          │    → invoices        │
          │                      │
          │ 4. Subscription      │
          │    status updated    │
          │    → subscriptions   │
          └──────────────────────┘
```

## Action → Table Mapping

| Action | Tables Written |
|---|---|
| User signs up | `users` |
| User selects/upgrades plan | `subscriptions`, `audit_logs` |
| User creates a bot | `bots`, `audit_logs` |
| User deletes a bot | `bots` (soft), `audit_logs` |
| User adds knowledge source (file/text/URL) | `knowledge_sources` |
| Background job chunks & embeds | `chunks` (insert), `knowledge_sources` (update status) |
| Visitor starts a chat | `conversations` |
| Visitor sends a message | `messages` |
| Bot responds | `messages`, `conversations` (last_message_at, message_count++) |
| Visitor thumbs up/down | `message_feedback` |
| Cron / event aggregates stats | `bot_analytics_daily` (upsert) |
| Stripe payment succeeds | `invoices`, `subscriptions` (period/extend) |
| Admin action (any entity) | `audit_logs` |
