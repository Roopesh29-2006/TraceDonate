# Quick Start Guide

Get TraceDonate backend running in 5 minutes!

## Prerequisites

- Python 3.11+
- PostgreSQL 12+ (or Docker)
- Git

## Option 1: Local Setup (Without Docker)

### 1. Clone & Setup

```bash
cd tracedonate-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create PostgreSQL Database

```bash
# Create database
createdb tracedonate

# Or using psql
psql -U postgres
CREATE DATABASE tracedonate;
\q
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tracedonate
JWT_SECRET_KEY=your-secret-key-change-this
DEBUG=False
```

### 4. Run the Application

```bash
python main.py
```

Server running at: **http://localhost:8000**

---

## Option 2: Docker Setup (Recommended)

### 1. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- FastAPI server on port 8000

### 2. Check Status

```bash
docker-compose logs -f api
```

Server running at: **http://localhost:8000**

### 3. Stop Services

```bash
docker-compose down
```

---

## First Steps

### 1. Open API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### 2. Check Health

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "app": "TraceDonate API",
  "version": "1.0.0"
}
```

### 3. Register a User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Donor",
    "email": "donor@example.com",
    "password": "Test@123456",
    "role": "DONOR"
  }'
```

### 4. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@example.com",
    "password": "Test@123456"
  }'
```

Copy the `access_token` from response.

### 5. Use the Token

```bash
TOKEN="<access_token_here>"

curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Commands

### Create Database Tables

Tables are auto-created on first run. To reset:

```bash
# In Python shell
python
>>> from database import engine, Base
>>> from models import User, VictimRequest, Donation, ProofStory
>>> Base.metadata.drop_all(bind=engine)  # Drop all tables
>>> Base.metadata.create_all(bind=engine)  # Recreate
>>> exit()
```

### View Logs

```bash
# Local
tail -f logs/*.log  # If logging configured

# Docker
docker-compose logs -f api
docker-compose logs -f postgres
```

### Database Access

```bash
# Local PostgreSQL
psql -U user -d tracedonate

# Docker PostgreSQL
docker-compose exec postgres psql -U tracedonate -d tracedonate
```

---

## Troubleshooting

### Port Already in Use

If port 8000 is taken:
```bash
# Change in main.py or run with:
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Database Connection Error

Check `.env`:
```bash
# Test connection:
psql postgresql://user:password@localhost:5432/tracedonate
```

### Tables Not Created

```bash
python -c "from database import init_db; init_db(); print('✓ Tables created')"
```

### JWT Token Expired

Tokens last 30 minutes by default. Login again to get a new token.

---

## Test Users

Create these for testing:

### Donor User
```json
{
  "name": "Alice Donor",
  "email": "alice@example.com",
  "password": "DonorPass@123",
  "role": "DONOR"
}
```

### Victim User
```json
{
  "name": "Bob Victim",
  "email": "bob@example.com",
  "password": "VictimPass@123",
  "role": "VICTIM"
}
```

### Admin User
```json
{
  "name": "Charlie Admin",
  "email": "charlie@example.com",
  "password": "AdminPass@123",
  "role": "ADMIN"
}
```

---

## Test Workflow

### 1. Register Both Users

```bash
# Register Donor
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Donor",
    "email": "alice@example.com",
    "password": "DonorPass@123",
    "role": "DONOR"
  }'

# Register Victim
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Victim",
    "email": "bob@example.com",
    "password": "VictimPass@123",
    "role": "VICTIM"
  }'
```

### 2. Login as Victim

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "VictimPass@123"
  }'
```

Save the `access_token`.

### 3. Create Request (as Victim)

```bash
VICTIM_TOKEN="<token_from_login>"

curl -X POST "http://localhost:8000/api/v1/victim/request" \
  -H "Authorization: Bearer $VICTIM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency ICU Treatment",
    "description": "Need urgent ventilator support for life support",
    "required_amount": 50000
  }'
```

Save the `request_id` (should be 1).

### 4. Login as Admin

```bash
# First register admin
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Admin",
    "email": "charlie@example.com",
    "password": "AdminPass@123",
    "role": "ADMIN"
  }'

# Then login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "charlie@example.com",
    "password": "AdminPass@123"
  }'
```

Save the `access_token`.

### 5. Approve Request (as Admin)

```bash
ADMIN_TOKEN="<admin_token_from_login>"

curl -X POST "http://localhost:8000/api/v1/admin/approve/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 6. Create Donation (as Donor)

```bash
DONOR_TOKEN="<donor_token_from_login>"

curl -X POST "http://localhost:8000/api/v1/donation/create" \
  -H "Authorization: Bearer $DONOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": 1,
    "amount": 5000,
    "payment_id": "PAY_TEST_123"
  }'
```

Save the `trace_token` (e.g., TRACE-A7F9B2C1).

### 7. Track Donation

```bash
curl -X GET "http://localhost:8000/api/v1/donation/track/TRACE-A7F9B2C1"
```

---

## Next Steps

1. Read [README.md](README.md) for detailed documentation
2. Check [APIDOCS.md](APIDOCS.md) for full API reference
3. Review code examples in [models/](models/), [routes/](routes/), [auth/](auth/)
4. Implement frontend integration with your React/Vue app

---

## Support

- **Issues**: Check error responses and logs
- **API Docs**: http://localhost:8000/api/docs
- **Code**: All well documented with docstrings

---

Last Updated: February 26, 2026
