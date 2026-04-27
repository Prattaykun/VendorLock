# PDF Parser API Endpoints

> This document details the endpoints related to **PDF Parser**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/pdf/parse-invoice`
**Parse invoice PDF to extract batch/expiry/SKU data**

Upload invoice PDF or image. OCR extracts:
- SKU names, quantities, unit prices
- Batch numbers
- Expiry dates (validated — must be future)
- Invoice date, supplier GSTIN

Extracted data is confirmed with the user before committing to ledger.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request
`multipart/form-data` (File Upload)

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/pdf/parse-scheme`
**Parse scheme PDF for rules extraction (Agent 3 RAG)**

Upload a brand scheme PDF. Uses RAG (pdfplumber + embeddings) to extract scheme rules.
Extracted rules are fed to Agent 3 leakage detection.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request
`multipart/form-data` (File Upload)

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/pdf/extraction-status/{job_id}`
**Check PDF extraction job status**

Poll the status of an async PDF extraction job.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
