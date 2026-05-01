# Task 1: Authentication & User Management Integration

## Overview
Connect the frontend authentication flow to the backend auth system, implement proper user management for all roles (distributor, salesman, retailer), and replace all hardcoded/mock user data with real API-driven data.

## Current State
- Frontend has a login page (`/login`) that calls `/auth/login` but uses hardcoded tenant ID
- Auth token stored in localStorage as `vendorlock_token`
- `AuthProvider.tsx` provides basic route protection
- No registration UI exists despite backend having `/auth/register`
- Backend auth falls back to mock auth with `dev-user-id` when Supabase fails
- Backend logout is a stub (stateless JWT, no Redis blocklist)
- Retailer onboarding, salesman management all return stub data

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| POST | `/api/v1/auth/login` | Functional (mock fallback) | Wire frontend properly |
| POST | `/api/v1/auth/register` | Functional (mock fallback) | Build registration UI |
| GET | `/api/v1/auth/me` | Functional | Wire to AuthProvider |
| POST | `/api/v1/auth/logout` | Stub | Implement token blocklist or confirm stateless design |
| POST | `/api/v1/retailer/` | Stub | Implement full onboarding |
| GET | `/api/v1/retailer/{id}` | Stub (hardcoded) | Implement DB fetch |
| GET | `/api/v1/retailer/{id}/ledger` | Stub | Implement ledger query |
| PATCH | `/api/v1/retailer/{id}/credit-limit` | Stub | Implement DB update + audit |
| GET | `/api/v1/salesman/` | Stub | Implement DB query |
| GET | `/api/v1/salesman/{id}/reliability` | Stub (hardcoded) | Compute from beat_checkins |
| GET | `/api/v1/salesman/{id}/beat-history` | Stub | Query beat_checkins |
| POST | `/api/v1/salesman/` | Stub | Implement creation |
| GET | `/api/v1/distributor/profile` | Functional (fallback) | Wire to frontend |
| GET | `/api/v1/distributor/salesmen` | Functional (fallback) | Wire to frontend |

## Tasks

### 1.1 Fix API Base URL Mismatch
- Fix the discrepancy between `.env.local` (`localhost:8000`) and `api-client.ts` default (`localhost:8001`)
- Standardize to a single port across all configs
- Verify all API calls use consistent base URL

### 1.2 Implement Full Authentication Flow
- Update login page to accept tenant ID as input (not hardcoded)
- Wire `getMe()` to AuthProvider for session validation on route changes
- Implement proper token refresh or expiry handling
- Add "Remember Me" option with secure token persistence
- Build registration page (`/register`) calling `/auth/register` with role selection (distributor, salesman)
- Implement logout that properly clears token and calls `/auth/logout`
- Add password reset flow (if backend supports, otherwise add TODO)

### 1.3 Implement Retailer Onboarding
- Build retailer onboarding form UI (name, mobile, GSTIN, address, pincode, telegram_chat_id)
- Connect form to `POST /retailer/` endpoint
- Implement initial trust score assignment (50/100) on creation
- Add Telegram welcome message trigger on successful onboarding
- Build retailer profile page showing details from `GET /retailer/{id}`
- Implement retailer ledger view calling `GET /retailer/{id}/ledger`
- Build credit limit update UI calling `PATCH /retailer/{id}/credit-limit` with audit log

### 1.4 Implement Salesman Management
- Build salesman list page calling `GET /salesman/` (replacing empty list stub)
- Build add salesman form calling `POST /salesman/` (name, route, user_id, telegram_chat_id)
- Implement salesman reliability score page calling `GET /salesman/{id}/reliability` — compute from actual beat_checkins and order logs instead of hardcoded data
- Build salesman beat history view calling `GET /salesman/{id}/beat-history`
- Wire `GET /distributor/salesmen` to the BeatIntelligencePanel (currently uses mock data)

### 1.5 Replace Mock Data in Distributor Dashboard
- Replace hardcoded KPI cards (847 retailers, 2,341 orders, Rs.4.2L outstanding) with real data from `GET /distributor/dashboard/summary`
- Replace hardcoded retailer names with actual data from `GET /distributor/retailers`
- Replace mock alert data with real data from `GET /risk-alerts/`
- Replace mock order data with real data from `GET /orders/`
- Remove silent fallbacks to mock data — show loading states and error messages instead

### 1.6 Implement Tenant-Aware Session Management
- Store tenant_id in auth context (currently hardcoded as "default" in webhook)
- Update all API calls to include tenant context (via JWT claim or header)
- Implement chat_id-to-tenant mapping for Telegram webhook resolution

## Acceptance Criteria
- User can register, login, and logout with proper session management
- Retailer onboarding creates real DB records and triggers welcome message
- Salesman CRUD operations work end-to-end
- Distributor dashboard shows real data, no hardcoded values
- No API calls fall back to mock data — proper loading/error states everywhere
- Auth token is properly validated on every protected route
- All user management endpoints return real data from PostgreSQL

## Dependencies
- Supabase Auth working (or confirmed local fallback is acceptable for MVP)
- PostgreSQL `users`, `tenants`, `retailers`, `salesmen` tables populated with seed data
- Redis available for JWT blocklist (if implementing proper logout)
