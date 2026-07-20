# Gentlemen Cricket Ground - Admin Authentication & Reset Guide

We have implemented a secure, isolated admin portal featuring username/password logins and a WhatsApp-based OTP recovery stream targeting a pre-configured mobile number.

---

## 🏗️ Architecture & Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Frontend UI)
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant WA as WhatsApp API (Console/Twilio/Meta)

    Note over Admin, API: Standard Login Flow
    Admin->>API: POST /admin/auth/login { username, password }
    API->>DB: Look up Admin & verify password (bcrypt)
    API-->>Admin: Success { token, admin }

    Note over Admin, API: Forgotten Credentials Reset Flow
    Admin->>API: POST /admin/auth/forgot-request { username }
    API->>DB: Find Admin, retrieve registered mobileNumber
    API->>API: Generate 6-digit OTP
    API->>DB: Save hashed OTP & 5-minute expiry in DB
    API->>WA: Send OTP to Admin's mobile number
    API-->>Admin: Success { message: "OTP sent", maskedMobileNumber }

    Admin->>API: POST /admin/auth/reset { username, otp, newUsername, newPassword }
    API->>DB: Verify OTP code (not expired)
    alt OTP Valid
        API->>DB: Delete OTP record
        API->>DB: Update Admin username and/or passwordHash
        API-->>Admin: Success { message: "Account updated" }
    else OTP Invalid
        API-->>Admin: Error: Invalid or expired OTP
    ```
```

---

## 🚀 Default Credentials & Auto-Seeding

To ensure a seamless, developer-ready environment, the database automatically seeds a default administrator account on container startup if no administrator is found in the database.

These variables are defined in your **[backend/.env](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/.env)** file:
```env
ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=adminpassword
ADMIN_DEFAULT_MOBILE=+918208425394
```

---

## 📁 File Structure

The admin authentication setup consists of the following key files:

### Backend Controllers & Services
- **[backend/src/modules/admin-auth/admin-auth.service.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/admin-auth/admin-auth.service.ts)**: Handles logins, credentials hashing (`bcryptjs`), OTP generation, and account modifications.
- **[backend/src/modules/admin-auth/admin-auth.controller.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/admin-auth/admin-auth.controller.ts)**: Declares routes `/login`, `/forgot-request`, `/reset`, and `/me`.
- **[backend/src/modules/admin-auth/admin-auth.guard.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/admin-auth/admin-auth.guard.ts)**: Guard protecting access by enforcing the `isAdmin: true` claim.
- **[backend/src/modules/admin-auth/admin-auth.module.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/admin-auth/admin-auth.module.ts)**: Bundler registering dependencies.
- **[backend/src/modules/admin-auth/dto/admin-auth.dto.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/admin-auth/dto/admin-auth.dto.ts)**: Data Transfer Objects.

### Database Updates
- **[backend/prisma/schema.prisma](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/prisma/schema.prisma)**: Added the `Admin` model.
- **[backend/src/prisma/prisma.service.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/prisma/prisma.service.ts)**: Added checks on initialization to trigger `seedAdmin()` automatically.

### Frontend Views
- **[frontend/src/App.tsx](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/frontend/src/App.tsx)**: Embedded Admin Portal views (Login card, request reset, update credentials wizard, and Admin Dashboard).
- **[frontend/src/index.css](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/frontend/src/index.css)**: Appended styling tokens for administrative overlays, avatars, badges, and boxes.

---

## 🔍 How to Test in Terminal

You can run curl requests to verify admin endpoints.

### 1. Test Admin Login (Default)
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"adminpassword"}'
```
**Expected response**:
`{"token":"eyJhbGci...", "admin":{"id":"...","username":"admin","mobileNumber":"+918208425394",...}}`

### 2. Request OTP for Account Reset
```bash
curl -X POST http://localhost:3000/admin/auth/forgot-request \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```
**Expected response**:
`{"message":"OTP sent successfully...","maskedMobileNumber":"+91******5394"}`

Open backend terminal logs (`docker compose logs backend`) to capture the generated 6-digit verification code.

### 3. Verify OTP and Update Credentials
```bash
curl -X POST http://localhost:3000/admin/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "otp":"<OTP_FROM_LOGS>", "newUsername":"superadmin", "newPassword":"supersecurepassword"}'
```
**Expected response**:
`{"message":"Admin credentials reset successfully"}`
