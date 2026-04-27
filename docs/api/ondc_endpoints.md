# ONDC API Endpoints

> This document details the endpoints related to **ONDC**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/ondc/on_search`
**ONDC on_search callback**

ONDC on_search — returns catalog items. Mock in MVP.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
object
```

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/ondc/on_select`
**ONDC on_select callback**

ONDC on_select — confirms item selection.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
object
```

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/ondc/on_init`
**ONDC on_init callback**

ONDC on_init — order initialization.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
object
```

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/ondc/on_confirm`
**ONDC on_confirm callback**

ONDC on_confirm — order confirmed.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
object
```

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/ondc/status`
**ONDC integration status**

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
