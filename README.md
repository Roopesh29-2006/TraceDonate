# TraceDonate Backend API

A production-ready FastAPI backend for a transparent charity donation tracking platform with JWT authentication, PostgreSQL, and role-based access control.

## 🎯 Project Overview

TraceDonate is a transparent donation platform that connects donors with victims in need. The platform provides:

- **Transparent Tracking**: Each donation gets a unique trace token (TRACE-XXXXXXXX) for tracking
- **Role-Based Access**: 4 user roles - Donor, Victim, Admin, and NGO
- **Urgency Classification**: AI-powered keyword analysis for automatic urgency levels
- **Admin Controls**: Approve/reject requests, pin urgent cases
- **Proof Stories**: Victims can upload media and stories showing donation usage
- **Secure Authentication**: JWT-based security with bcrypt password hashing

## 📋 Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (PyJWT) with bcrypt
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **Python**: 3.11+

## 📁 Project Structure

```
tracedonate-backend/
├── main.py                    # FastAPI app entry point
├── database.py               # SQLAlchemy setup and session management
├── config.py                 # Configuration and environment variables
├── requirements.txt          # Dependencies
├── .env.example             # Environment variables template
│
├── models/                  # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── user.py             # User model with roles
│   ├── victim_request.py   # Victim donation requests
│   ├── donation.py         # Donation tracking
│   └── proof_story.py      # Proof/media uploads
│
├── schemas/                # Pydantic validation schemas
│   ├── __init__.py
│   ├── user_schema.py      # User request/response schemas
│   ├── victim_request_schema.py
│   └── donation_schema.py
│
├── routes/                 # API endpoint routes
│   ├── __init__.py
│   ├── auth_routes.py      # Authentication endpoints
│   ├── victim_routes.py    # Victim endpoints
│   ├── admin_routes.py     # Admin endpoints
│   └── donation_routes.py  # Donation endpoints
│
├── auth/                   # Authentication modules
│   ├── __init__.py
│   ├── jwt_handler.py      # JWT token creation/verification
│   ├── password_handler.py # bcrypt password operations
│   └── auth_dependencies.py # Route dependencies
│
├── services/               # Business logic services
│   ├── __init__.py
│   ├── urgency_classifier.py # AI urgency classification
│   └── trace_token_generator.py # Trace token generation
│
└── utils/                  # Utilities and constants
    ├── __init__.py
    └── constants.py        # Application constants
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 12+
- pip or poetry

### Installation

1. **Clone the repository**
```bash
cd tracedonate-backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tracedonate
JWT_SECRET_KEY=your-super-secret-key-change-this
DEBUG=False
```

5. **Create PostgreSQL database**
```bash
createdb tracedonate
```

6. **Run the application**
```bash
python main.py
```

Server will start at `http://localhost:8000`

## 📚 API Documentation

### Swagger UI Documentation
- **URL**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "DONOR"  // DONOR, VICTIM, ADMIN, NGO
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DONOR",
    "is_verified": true,
    "created_at": "2026-02-26T10:30:00Z"
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Victim Endpoints

#### Create Donation Request
```http
POST /api/v1/victim/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Emergency Medical Surgery",
  "description": "Need urgent ICU ventilator support for life support",
  "required_amount": 50000
}
```

**Note**: Urgency is automatically classified based on keywords in title/description.

#### Get My Requests
```http
GET /api/v1/victim/request?skip=0&limit=10
Authorization: Bearer <token>
```

#### Get Request Details
```http
GET /api/v1/victim/request/{request_id}
Authorization: Bearer <token>
```

#### Update Request (Pending Only)
```http
PUT /api/v1/victim/request/{request_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "required_amount": 75000
}
```

### Admin Endpoints

#### Get All Requests
```http
GET /api/v1/admin/requests?status_filter=PENDING&skip=0&limit=20
Authorization: Bearer <token>  // Admin token required
```

#### Approve Request
```http
POST /api/v1/admin/approve/{request_id}
Authorization: Bearer <token>
```

#### Reject Request
```http
POST /api/v1/admin/reject/{request_id}
Authorization: Bearer <token>
```

#### Pin Request (Appears at Top)
```http
POST /api/v1/admin/pin/{request_id}
Authorization: Bearer <token>
```

#### Unpin Request
```http
POST /api/v1/admin/unpin/{request_id}
Authorization: Bearer <token>
```

### Donation Endpoints

#### Create Donation
```http
POST /api/v1/donation/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "request_id": 1,
  "amount": 5000,
  "payment_id": "PAY123456789"
}
```

**Response includes trace token**:
```json
{
  "id": 1,
  "donor_id": 1,
  "request_id": 1,
  "amount": 5000,
  "trace_token": "TRACE-A7F9B2C1",
  "payment_id": "PAY123456789",
  "status": "COMPLETED",
  "created_at": "2026-02-26T10:30:00Z"
}
```

#### Track Donation by Trace Token
```http
GET /api/v1/donation/track/TRACE-A7F9B2C1
```

**Response with proof stories**:
```json
{
  "trace_token": "TRACE-A7F9B2C1",
  "donor_name": "John Doe",
  "request_title": "Emergency Medical Surgery",
  "amount": 5000,
  "status": "COMPLETED",
  "created_at": "2026-02-26T10:30:00Z",
  "proof_stories": [
    {
      "description": "Treatment completed successfully",
      "media_url": "https://example.com/media/story1.jpg",
      "created_at": "2026-02-27T10:30:00Z"
    }
  ]
}
```

#### Get My Donations
```http
GET /api/v1/donation/my-donations?skip=0&limit=10
Authorization: Bearer <token>
```

## 🔐 Security Features

### Password Security
- **Bcrypt Hashing**: Passwords hashed with 12 rounds of bcrypt
- **Salt Generation**: Unique salt for each password
- **Never Stored Plain**: Plain passwords never stored in database

### JWT Authentication
- **Token Format**: HS256 signed JWT tokens
- **Token Claims**: 
  - `sub` (user ID)
  - `email` (user email)
  - `role` (user role)
  - `exp` (expiration time)
- **Default Expiry**: 30 minutes (configurable)
- **Refresh Tokens**: Can be implemented for longer sessions

### Role-Based Access Control
- **DONOR**: Can make donations and track their donations
- **VICTIM**: Can create requests and manage their own requests
- **ADMIN**: Can approve/reject requests and pin urgent cases
- **NGO**: Future role for NGO management

### Secure Database
- **Parameterized Queries**: SQLAlchemy prevents SQL injection
- **Foreign Keys**: Enforced referential integrity
- **Indexes**: Optimized queries on frequently accessed columns

## 🤖 Urgency Classification System

The system automatically classifies urgency levels based on keywords:

### Critical Keywords (Weight: 3)
- ICU, ventilator, emergency, life support, critical, intensive care, life threatening, immediate, urgent surgery

### High Keywords (Weight: 2)
- surgery, cancer, accident, trauma, severe, hospitalization, severe injury, critical condition

### Medium Keywords (Weight: 1)
- treatment, repair, medication, therapy, procedure, medical care

### Low Keywords (Weight: 0.5)
- education, support, assistance, help, training, rehabilitation

**Classification Logic**:
1. Combine title and description
2. Count keyword matches with weights
3. Highest score determines urgency level
4. Default is LOW if no keywords match

## 🎫 Trace Token System

Each donation gets a unique trace token for transparent tracking:

**Format**: `TRACE-XXXXXXXX`
- **TRACE**: Fixed prefix
- **XXXXXXXX**: 8-character hex string (UUID-based)

**Example**: `TRACE-A7F9B2C1`

**Features**:
- Globally unique (using UUID4)
- Human-readable format
- Can be shared with donors for tracking
- Links to proof stories and updates

## 📊 Database Schema

### users table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('DONOR','VICTIM','ADMIN','NGO'),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### victim_requests table
```sql
CREATE TABLE victim_requests (
  id INTEGER PRIMARY KEY,
  victim_id INTEGER FOREIGN KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  required_amount FLOAT NOT NULL,
  collected_amount FLOAT DEFAULT 0,
  urgency_level ENUM('CRITICAL','HIGH','MEDIUM','LOW'),
  status ENUM('PENDING','APPROVED','REJECTED','COMPLETED'),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### donations table
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY,
  donor_id INTEGER FOREIGN KEY,
  request_id INTEGER FOREIGN KEY,
  amount FLOAT NOT NULL,
  trace_token VARCHAR(20) UNIQUE,
  payment_id VARCHAR(255),
  status ENUM('PENDING','COMPLETED','FAILED','REFUNDED'),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### proof_stories table
```sql
CREATE TABLE proof_stories (
  id INTEGER PRIMARY KEY,
  request_id INTEGER FOREIGN KEY,
  media_url VARCHAR(500),
  description VARCHAR(2000) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

All configuration is managed through environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tracedonate

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
APP_NAME=TraceDonate API
APP_VERSION=1.0.0
DEBUG=False

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

## 🧪 Testing API

### Using cURL

```bash
# Register
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "DONOR"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Using HTTPie

```bash
http POST http://localhost:8000/api/v1/auth/register \
  name="John Doe" \
  email="john@example.com" \
  password="SecurePass123!" \
  role="DONOR"
```

## 📈 Performance Considerations

1. **Database Indexing**: Indexes on email, user_id, request_id, trace_token
2. **Connection Pooling**: Configured for optimal database connections
3. **Pagination**: All list endpoints support skip/limit parameters
4. **Caching**: Settings cached using @lru_cache decorator

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (invalid data)
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate email, etc.)
- **500**: Server Error

## 🚀 Production Deployment

### Before Deploying:

1. **Change JWT Secret**: Generate a strong random key
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```

2. **Set DEBUG=False**: Disable debug mode

3. **Configure Database**: Use production PostgreSQL instance with backups

4. **SSL/HTTPS**: Deploy behind SSL proxy (nginx, Apache, etc.)

5. **Environment Variables**: Manage securely (AWS Secrets Manager, HashiCorp Vault, etc.)

6. **Rate Limiting**: Implement to prevent abuse

7. **CORS Configuration**: Set specific allowed origins

8. **Logging**: Configure structured logging for monitoring

### Deployment Options

- **Docker**: Package as Docker container
- **AWS**: EC2, ECS, Lambda with RDS
- **Azure**: App Service with SQL Database
- **DigitalOcean**: App Platform with Managed Database
- **Heroku**: Simple deployment with add-ons

## 📞 Support & Documentation

- **Issues**: Report bugs and feature requests
- **Documentation**: API docs at `/api/docs`
- **Testing**: All endpoints tested with example requests above

## 📄 License

This project is property of TraceDonate. All rights reserved.

## 👨‍💻 Author

Senior Backend Engineer - TraceDonate Team

---

**Last Updated**: February 26, 2026
