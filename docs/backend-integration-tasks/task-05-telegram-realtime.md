# Task 5: Telegram Webhook Integration & Real-Time Communication

## Overview
Implement the complete Telegram bot integration for order capture, payment logging, MYSCORE queries, and the confirm/dispute callback flow. Build the real-time communication bridge between Telegram messages and the dashboard, including the dual-confirmation payment safeguard and salesman collection tracking.

## Current State
- `POST /webhook/telegram/` is functional — routes to Agent 1, handles MYSCORE, /start, CONFIRM/DISPUTE callbacks
- `POST /webhook/telegram/set-webhook` is functional for registering webhook URL
- Agent 1 (Trade Capture) is fully implemented for multilingual parsing
- Backend uses `"default"` tenant ID hardcoded in webhook handler
- No frontend UI for monitoring Telegram message flow or bot status
- No real-time updates on dashboard (all data is fetched once on mount)
- No WebSocket or polling mechanism for live data
- Payment dual-confirmation safeguard not implemented (retailer receives "X received, reply YES/DISPUTE")

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| POST | `/api/v1/webhook/telegram/` | Functional | Enhance with tenant resolution |
| POST | `/api/v1/webhook/telegram/set-webhook` | Functional | Add webhook status UI |
| POST | `/api/v1/orders/{id}/confirm` | Functional | Wire Telegram CONFIRM callback |
| POST | `/api/v1/orders/{id}/dispute` | Functional | Wire Telegram DISPUTE callback |
| GET | `/api/v1/trust-score/query/myscore` | Stub | Fix retailer lookup by chat_id |
| POST | `/api/v1/agent/parse-message` | Functional | Use for message testing |

## Tasks

### 5.1 Implement Telegram Bot Setup & Configuration UI
- Build bot configuration page in distributor settings:
  - Bot token input field (from BotFather)
  - Webhook URL display and status
  - "Set Webhook" button calling `POST /webhook/telegram/set-webhook`
  - Webhook status indicator (active/inactive/last update time)
  - Test message button to verify bot responsiveness
- Store bot token securely (encrypted or via environment variable)
- Show bot username and avatar after successful connection

### 5.2 Implement Tenant Resolution for Telegram Webhook
- Fix hardcoded `"default"` tenant in webhook handler:
  - Create `telegram_chat_bindings` table mapping telegram_chat_id to tenant_id and user_id
  - On incoming webhook, resolve tenant from chat_id
  - Fall back to default tenant only if no binding found (with warning log)
- Build chat binding management UI:
  - List all linked Telegram chats per tenant
  - Show chat type (retailer, salesman, distributor)
  - Add/remove chat bindings manually
  - Show unlinked chats pending binding

### 5.3 Implement Order Confirmation Flow via Telegram
- When Agent 1 parses an order, send confirmation message back to retailer via Telegram:
  - Format: "Order confirmed: [items] | Total: Rs.X | Payment: [credit/cash] | Reply CONFIRM or DISPUTE"
- Handle CONFIRM callback:
  - Call `PATCH /orders/{id}/confirm` backend
  - Send confirmation reply: "Order confirmed. Will be dispatched by [time]."
  - Update order status in database
- Handle DISPUTE callback:
  - Prompt retailer for dispute reason
  - Call `PATCH /orders/{id}/dispute` with reason
  - Send acknowledgement: "Dispute noted. Our team will review."
  - Flag order for distributor review on dashboard
- Show pending confirmations count on dashboard

### 5.4 Implement Payment Dual-Confirmation Safeguard
- When a salesman logs a cash collection via Telegram:
  - Send confirmation message to retailer: "Rs.X received from you by [salesman name]. Reply YES or DISPUTE."
- Handle YES response:
  - Mark collection as confirmed
  - Update retailer outstanding balance
  - Log to audit trail
- Handle DISPUTE response:
  - Flag collection as disputed
  - Notify distributor immediately
  - Create risk alert with CRITICAL severity
  - Hold collection record until resolved
- Build disputed collections view on dashboard showing:
  - Collection amount
  - Salesman name
  - Retailer name
  - Dispute timestamp
  - Resolution status

### 5.5 Implement MYSCORE Query via Telegram
- Fix `GET /trust-score/query/myscore` to look up retailer by telegram_chat_id
- When retailer sends "MYSCORE" via Telegram:
  - Fetch trust score, tier, and trend
  - Format response: "Your Trust Score: X/100 (Tier Y) | Trend: [UP/DOWN/STABLE] | Payment discipline: X% | Tip: [personalized improvement suggestion]"
- Send formatted response back via Telegram Bot API
- Log the query in audit trail

### 5.6 Implement /start Command Handler
- When a new user sends /start to the bot:
  - Check if telegram_chat_id is already linked to a user
  - If linked: Send welcome back message with role-specific menu
  - If not linked: Send onboarding message asking for identification:
    - "Welcome to VendorLock! Please enter your registered mobile number or GSTIN to link your account."
  - Match input against retailers/salesmen/distributors tables
  - Send success/failure response
  - Create chat binding on successful match

### 5.7 Implement Telegram Message Monitoring Dashboard
- Build a real-time message feed panel on the distributor dashboard showing:
  - Recent incoming messages (last 50)
  - Message sender (retailer/salesman name)
  - Parsed intent (ORDER/PAYMENT/RETURN/DISPUTE/SCHEME_QUERY)
  - Confidence score from Agent 1
  - Processing status (parsed/confirmed/disputed/pending review)
  - Timestamp
- Add filter by intent type and sender
- Click on a message to see full parsing output from Agent 1
- Show low-confidence parses (below threshold) in a "Needs Review" section

### 5.8 Implement Multi-Language Message Display
- Show original message text in retailer's language (Hindi, Hinglish, Bhojpuri, Tamil, etc.)
- Show Agent 1's parsed English translation alongside
- Display confidence score for parsing accuracy
- Allow distributor to correct misparsed messages and re-submit

### 5.9 Implement Telegram Notification System
- Build notification templates for automated Telegram messages:
  - Order confirmation (to retailer)
  - Payment collection confirmation (to retailer)
  - Credit limit warning (to retailer when approaching limit)
  - Trust score change notification (to retailer)
  - Beat plan delivery (to salesman each morning)
  - Risk alert notification (to distributor)
  - Expiry warning (to distributor)
  - Scheme leakage alert (to distributor)
- Build notification settings page where distributor can:
  - Enable/disable each notification type
  - Set quiet hours (no notifications during specific hours)
  - Choose notification language (English/Hindi/bilingual)

### 5.10 Implement Real-Time Dashboard Updates
- Add polling mechanism (setInterval or SWR refresh) to dashboard data:
  - Refresh risk alerts every 30 seconds
  - Refresh orders every 60 seconds
  - Refresh trust scores every 5 minutes
  - Refresh beat plans every 10 minutes
- Replace "Live Telemetry: Establishing secure handshake..." with actual status:
  - "Last updated: [timestamp]"
  - "Connected to Telegram Bot: [bot username]"
  - "Messages processed today: [count]"
- Add WebSocket endpoint for real-time push (optional, polling is acceptable for MVP)
- Show notification toast (Sonner) when new critical alerts arrive

### 5.11 Implement Voice Note Handling
- When a voice note is received via Telegram:
  - Use Telegram's file download API to get the .ogg file
  - Convert to text using speech-to-text API (Gemini or Whisper)
  - Pass transcribed text to Agent 1 for parsing
  - Handle as regular message after transcription
- Show transcription confidence in message monitoring panel
- Flag low-confidence transcriptions for manual review

### 5.12 Implement Image/Invoice Handling via Telegram
- When an image is received via Telegram:
  - Download image from Telegram
  - Route to `POST /pdf/parse-invoice` for OCR processing
  - Extract order items, batch numbers, expiry dates
  - Send parsed result back to sender for confirmation
- Show image processing status in message monitoring panel
- Handle processing errors gracefully with retry option

## Acceptance Criteria
- Telegram bot can be configured and connected via UI
- Tenant resolution works correctly from telegram_chat_id
- Orders can be confirmed and disputed via Telegram callbacks
- Payment dual-confirmation works — retailer receives confirmation request
- MYSCORE query returns real trust score data via Telegram
- /start command handles new and returning users correctly
- Message monitoring panel shows real-time parsed messages
- Multi-language messages are displayed with English translations
- Notifications are sent via Telegram based on configured rules
- Dashboard updates in near-real-time via polling
- Voice notes are transcribed and processed
- Images are OCR'd and parsed for order/batch data

## Dependencies
- Task 1 and 2 completed (auth, orders, trust scores, retailers working)
- Telegram Bot API token from BotFather
- ngrok or similar tunnel for local webhook testing
- Speech-to-text API configured (Gemini or Whisper)
- OCR pipeline from Task 3 completed
