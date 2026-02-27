# TraceDonate API Documentation

Complete API reference with examples for all endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Victim Endpoints](#victim-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Donation Endpoints](#donation-endpoints)
- [Error Responses](#error-responses)

---

## Authentication

Base URL: `http://localhost:8000/api/v1`

All protected endpoints require the `Authorization: Bearer <token>` header.

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "DONOR"
}
```

**Valid Roles**:
- `DONOR`: Can make donations
- `VICTIM`: Can create donation requests
- `ADMIN`: Can manage requests
- `NGO`: Future role

**Response (201 Created)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "DONOR",
  "is_verified": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **409 Conflict** - Email already registered:
```json
{
  "detail": "Email already registered"
}
```

- **400 Bad Request** - Invalid role:
```json
{
  "detail": "Invalid role. Must be one of: DONOR, VICTIM, ADMIN, NGO"
}
```

---

### Login User

Authenticate and get JWT token.

**Endpoint**: `POST /auth/login`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJET05PUiIsImV4cCI6MTY0Mzc2NDE5MH0.ABC123XYZ",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DONOR",
    "is_verified": false,
    "created_at": "2026-02-26T10:30:00Z"
  }
}
```

**Error Responses**:

- **401 Unauthorized** - Invalid credentials:
```json
{
  "detail": "Invalid credentials"
}
```

---

### Get Current User

Retrieve authenticated user information.

**Endpoint**: `GET /auth/me`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "DONOR",
  "is_verified": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **401 Unauthorized** - Invalid/expired token:
```json
{
  "detail": "Invalid or expired token"
}
```

---

## Victim Endpoints

All victim endpoints require `Authorization: Bearer <token>` with VICTIM role.

### Create Victim Request

Submit a new donation request.

**Endpoint**: `POST /victim/request`

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support for life support. He suffered a severe accident and is in critical condition.",
  "required_amount": 75000
}
```

**Urgency Auto-Classification**:
The system analyzes keywords and auto-assigns urgency level:
- `CRITICAL` if keywords like: ICU, ventilator, emergency, life support
- `HIGH` if keywords like: surgery, cancer, accident, trauma
- `MEDIUM` if keywords like: treatment, repair, medication
- `LOW` for others

**Response (201 Created)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support for life support. He suffered a severe accident and is in critical condition.",
  "required_amount": 75000,
  "collected_amount": 0,
  "urgency_level": "CRITICAL",
  "status": "PENDING",
  "is_pinned": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **403 Forbidden** - User is not a victim:
```json
{
  "detail": "Only victims can access this resource"
}
```

- **400 Bad Request** - Invalid data:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 5 characters",
      "type": "value_error.string.min_length"
    }
  ]
}
```

---

### Get My Requests

Retrieve all requests created by current victim.

**Endpoint**: `GET /victim/request`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10)

**Example**: `GET /victim/request?skip=0&limit=10`

**Response (200 OK)**:
```json
{
  "total": 2,
  "requests": [
    {
      "id": 1,
      "victim_id": 2,
      "title": "Emergency ICU Treatment",
      "description": "My father needs urgent ICU ventilator support...",
      "required_amount": 75000,
      "collected_amount": 25000,
      "urgency_level": "CRITICAL",
      "status": "APPROVED",
      "is_pinned": true,
      "created_at": "2026-02-26T10:30:00Z"
    },
    {
      "id": 2,
      "victim_id": 2,
      "title": "Surgery for Cancer Treatment",
      "description": "Need funds for cancer surgery...",
      "required_amount": 100000,
      "collected_amount": 0,
      "urgency_level": "HIGH",
      "status": "PENDING",
      "is_pinned": false,
      "created_at": "2026-02-26T11:15:00Z"
    }
  ]
}
```

---

### Get Request Details

Get specific request information.

**Endpoint**: `GET /victim/request/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support...",
  "required_amount": 75000,
  "collected_amount": 25000,
  "urgency_level": "CRITICAL",
  "status": "APPROVED",
  "is_pinned": true,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **404 Not Found** - Request not found:
```json
{
  "detail": "Request not found"
}
```

---

### Update Request

Update pending request details.

**Endpoint**: `PUT /victim/request/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description with more details...",
  "required_amount": 100000
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Updated Title",
  "description": "Updated description with more details...",
  "required_amount": 100000,
  "collected_amount": 25000,
  "urgency_level": "CRITICAL",
  "status": "PENDING",
  "is_pinned": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **400 Bad Request** - Request not pending:
```json
{
  "detail": "Can only update pending requests"
}
```

---

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` with ADMIN role.

### Get All Requests

List all victim requests with optional filtering.

**Endpoint**: `GET /admin/requests`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status_filter`: Filter by status (PENDING, APPROVED, REJECTED, COMPLETED)
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 20)

**Examples**:
```
GET /admin/requests
GET /admin/requests?status_filter=PENDING
GET /admin/requests?status_filter=CRITICAL&skip=0&limit=5
```

**Response (200 OK)**:
```json
{
  "total": 15,
  "requests": [
    {
      "id": 1,
      "victim_id": 2,
      "title": "Emergency ICU Treatment",
      "description": "My father needs urgent ICU ventilator support...",
      "required_amount": 75000,
      "collected_amount": 25000,
      "urgency_level": "CRITICAL",
      "status": "APPROVED",
      "is_pinned": true,
      "created_at": "2026-02-26T10:30:00Z"
    }
  ]
}
```

**Ordering**:
- Pinned requests appear first
- Then ordered by creation date (newest first)

---

### Approve Request

Approve a pending victim request.

**Endpoint**: `POST /admin/approve/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request to approve

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support...",
  "required_amount": 75000,
  "collected_amount": 0,
  "urgency_level": "CRITICAL",
  "status": "APPROVED",
  "is_pinned": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Error Responses**:

- **404 Not Found** - Request not found:
```json
{
  "detail": "Request not found"
}
```

- **400 Bad Request** - Request already processed:
```json
{
  "detail": "Request is already REJECTED"
}
```

---

### Reject Request

Reject a pending victim request.

**Endpoint**: `POST /admin/reject/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request to reject

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support...",
  "required_amount": 75000,
  "collected_amount": 0,
  "urgency_level": "CRITICAL",
  "status": "REJECTED",
  "is_pinned": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

---

### Pin Request

Pin a request to appear at the top of the list.

**Endpoint**: `POST /admin/pin/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request to pin

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support...",
  "required_amount": 75000,
  "collected_amount": 0,
  "urgency_level": "CRITICAL",
  "status": "APPROVED",
  "is_pinned": true,
  "created_at": "2026-02-26T10:30:00Z"
}
```

---

### Unpin Request

Remove pin from a request.

**Endpoint**: `POST /admin/unpin/{request_id}`

**Path Parameters**:
- `request_id` (integer, required): ID of the request to unpin

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "victim_id": 2,
  "title": "Emergency ICU Treatment",
  "description": "My father needs urgent ICU ventilator support...",
  "required_amount": 75000,
  "collected_amount": 0,
  "urgency_level": "CRITICAL",
  "status": "APPROVED",
  "is_pinned": false,
  "created_at": "2026-02-26T10:30:00Z"
}
```

---

## Donation Endpoints

### Create Donation

Make a donation to an approved victim request.

**Endpoint**: `POST /donation/create`

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "request_id": 1,
  "amount": 5000,
  "payment_id": "PAY_123456789"
}
```

**Fields**:
- `request_id` (integer, required): ID of the victim request
- `amount` (float, required): Donation amount (must be > 0)
- `payment_id` (string, optional): Payment gateway reference ID

**Response (201 Created)**:
```json
{
  "id": 1,
  "donor_id": 1,
  "request_id": 1,
  "amount": 5000,
  "trace_token": "TRACE-A7F9B2C1",
  "payment_id": "PAY_123456789",
  "status": "COMPLETED",
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Special Behavior**:
- Trace token is auto-generated (format: `TRACE-XXXXXXXX`)
- If collected amount >= required amount, request status changes to COMPLETED
- Donation status is COMPLETED after creation

**Error Responses**:

- **404 Not Found** - Request not found:
```json
{
  "detail": "Victim request not found"
}
```

- **400 Bad Request** - Request not approved:
```json
{
  "detail": "Can only donate to approved requests"
}
```

---

### Track Donation

Track a donation using its trace token.

**Endpoint**: `GET /donation/track/{trace_token}`

**Path Parameters**:
- `trace_token` (string, required): Unique trace token (e.g., TRACE-A7F9B2C1)

**Example**: `GET /donation/track/TRACE-A7F9B2C1`

**Response (200 OK)**:
```json
{
  "trace_token": "TRACE-A7F9B2C1",
  "donor_name": "John Doe",
  "request_title": "Emergency ICU Treatment",
  "amount": 5000,
  "status": "COMPLETED",
  "created_at": "2026-02-26T10:30:00Z",
  "proof_stories": [
    {
      "description": "Patient recovering well after surgery",
      "media_url": "https://example.com/photos/story1.jpg",
      "created_at": "2026-02-27T14:20:00Z"
    },
    {
      "description": "Discharge day - thanks to all donors!",
      "media_url": "https://example.com/photos/story2.jpg",
      "created_at": "2026-02-28T09:15:00Z"
    }
  ]
}
```

**No Authentication Required** - Public endpoint for transparency

**Error Responses**:

- **404 Not Found** - Donation not found:
```json
{
  "detail": "Donation not found"
}
```

---

### Get My Donations

Retrieve all donations made by current user.

**Endpoint**: `GET /donation/my-donations`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10)

**Example**: `GET /donation/my-donations?skip=0&limit=5`

**Response (200 OK)**:
```json
{
  "total": 3,
  "donations": [
    {
      "id": 1,
      "donor_id": 1,
      "request_id": 1,
      "amount": 5000,
      "trace_token": "TRACE-A7F9B2C1",
      "payment_id": "PAY_123456789",
      "status": "COMPLETED",
      "created_at": "2026-02-26T10:30:00Z"
    },
    {
      "id": 2,
      "donor_id": 1,
      "request_id": 2,
      "amount": 10000,
      "trace_token": "TRACE-B8G9C3D2",
      "payment_id": "PAY_987654321",
      "status": "COMPLETED",
      "created_at": "2026-02-26T11:45:00Z"
    }
  ]
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Unexpected server error |

### Validation Error Format

For validation errors, a detailed array is returned:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

---

## Rate Limiting & Pagination

### Pagination

List endpoints support pagination via query parameters:

```
GET /api/v1/victim/request?skip=0&limit=10
GET /api/v1/admin/requests?skip=20&limit=10
GET /api/v1/donation/my-donations?skip=0&limit=5
```

**Parameters**:
- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 10, max: 100)

---

## Examples Using cURL

### Register a User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "role": "VICTIM"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass123!"
  }'
```

### Create Request (with token)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST "http://localhost:8000/api/v1/victim/request" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Medical Surgery",
    "description": "Need urgent ICU ventilator support",
    "required_amount": 50000
  }'
```

### Create Donation

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST "http://localhost:8000/api/v1/donation/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": 1,
    "amount": 5000,
    "payment_id": "PAY_123456789"
  }'
```

### Track Donation

```bash
curl -X GET "http://localhost:8000/api/v1/donation/track/TRACE-A7F9B2C1"
```

---

Last Updated: February 26, 2026
