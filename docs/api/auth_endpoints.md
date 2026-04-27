# Auth API Endpoints

> This document details the endpoints related to **Auth**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/auth/login`
**User login**

Authenticate a user (distributor, salesman, retailer) and return a JWT.
Validates against Supabase Auth if available, otherwise uses local check.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    email*: string
    password*: string
    tenant_id*: string
}
```

### Response (Success)
```typescript
{
    access_token*: string
    token_type: string
    expires_in: integer
}
```

---

## `POST /api/v1/auth/register`
**Register a new distributor / user**

Register a new user. Creates entry in Supabase Auth + users table.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    email*: string
    password*: string
    full_name*: string
    tenant_id*: string
    role: string
}
```

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/auth/me`
**Get current authenticated user**

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/auth/logout`
**Invalidate session**

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
