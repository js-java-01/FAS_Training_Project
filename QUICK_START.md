# Quick Start Guide - Fix Menu Items Not Showing

## The Problem
Permissions array is empty `[]` in the frontend, causing menu items (User Management, Role Management) to be hidden.

## Root Cause
The backend code has been updated to properly load permissions, but **the backend needs to be restarted** for the changes to take effect.

## What Was Fixed

✅ **Backend Changes:**
- Added `findByEmailWithRoleAndPermissions` query to UserRepository (eager loads permissions)
- Updated UserDetailsServiceImpl to use the new query
- Added comprehensive debug logging to track permission loading
- Role.permissions already set to EAGER fetch

✅ **Frontend Changes:**
- Added debug logging to AuthContext (login response and permission checks)
- Added detailed logging to Sidebar component (menu loading and permission checks)

## Solution - 3 Steps to Fix

### Step 1: Restart Backend

**Stop any running backend:**
```bash
# Mac/Linux
pkill -f "spring-boot:run"

# Windows: Press Ctrl+C in the backend terminal
```

**Start with updated code:**
```bash
# Make mvnw executable (first time only on Mac/Linux)
chmod +x mvnw

# Start the backend
./mvnw spring-boot:run

# Windows use: mvnw.cmd spring-boot:run
```

**Wait for these messages:**
```
Initialized 28 permissions
Initialized 2 roles with permissions
Initialized 1 users
Initialized 2 menus with menu items
Started StarterProject2025Application in X.XXX seconds
```

The backend will be available at: `http://localhost:8080`

### Step 2: Clear Browser Cache

**Open browser console (F12) and run:**
```javascript
localStorage.clear();
location.reload();
```

This removes old login data that doesn't have permissions.

### Step 3: Login and Verify

Go to `http://localhost:5173` (or your frontend port)

**Login with:**
- Email: `admin@example.com`
- Password: `password123`

## Expected Console Output

### Backend Terminal (During Login)

You should see:
```
=== UserDetailsImpl.build DEBUG ===
User: admin@example.com
Role: ADMIN
Permissions count: 14

=== AUTH SERVICE DEBUG ===
User: admin@example.com
Role: ADMIN
Authorities count: 14
Permissions: [USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, ROLE_CREATE, ROLE_READ, ROLE_UPDATE, ROLE_DELETE, MENU_CREATE, MENU_READ, MENU_UPDATE, MENU_DELETE, MENU_ITEM_CREATE, MENU_ITEM_READ]
Permissions count: 14
```

### Browser Console (After Login)

You should see:
```
=== LOGIN RESPONSE ===
Permissions: Array(14) ['USER_CREATE', 'USER_READ', ...]
Permissions count: 14

=== USER PERMISSIONS ===
Permissions: Array(14)
Has USER_READ? true
Has ROLE_READ? true

=== MENU DEBUG ===
Menu 2: Administration - Items: 2
  - Role Management (/roles) - Permission: ROLE_READ
  - User Management (/users) - Permission: USER_READ

Permission check: ROLE_READ = true ✅
Permission check: USER_READ = true ✅
```

### Sidebar Display

All 3 menu items should now be visible:
- 📊 Dashboard
- 🔐 Role Management
- 👥 User Management

## Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

You should get a JSON response with a JWT token.

### Access H2 Database Console
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:rbacdb`
- Username: `sa`
- Password: (leave blank)

### Access Swagger UI
- URL: http://localhost:8080/swagger-ui.html

---

## Troubleshooting

### ❌ Permissions Count Still 0

**Problem:** Backend isn't loading permissions.

**Check backend console for:** `Permissions count: 0`

**Solution:** Database has old data without permissions. Force re-initialization:

1. Change in `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=create
```

2. Restart backend - this will recreate all tables and data

### ❌ "UserDetailsImpl.build DEBUG" Not Showing

**Problem:** Backend is running old code.

**Solution:** Clean and rebuild:
```bash
./mvnw clean package
./mvnw spring-boot:run
```

### ❌ Backend Won't Start

**Error:** "JAVA_HOME not defined"

**Solution:** Install JDK 17+
- Mac: `brew install openjdk@17`
- Ubuntu: `sudo apt install openjdk-17-jdk`
- Windows: Download from https://adoptium.net/

**Error:** "Port 8080 already in use"

**Solution:** Kill the process:
```bash
# Mac/Linux
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### ❌ Permission Checks Still Fail

**Verify localStorage has fresh data:**
```javascript
// Run in browser console
const user = JSON.parse(localStorage.getItem('user'));
console.table({
  'Has user': !!user,
  'Has permissions': !!user?.permissions,
  'Is array': Array.isArray(user?.permissions),
  'Count': user?.permissions?.length || 0,
  'Has USER_READ': user?.permissions?.includes('USER_READ'),
  'Has ROLE_READ': user?.permissions?.includes('ROLE_READ'),
});
```

**Expected output:**
```
Has user         : true
Has permissions  : true
Is array         : true
Count            : 14
Has USER_READ   : true
Has ROLE_READ   : true
```

If any are false, repeat Step 2 (clear localStorage) and Step 3 (re-login).

---

## Summary

The fix is complete in the code. You just need to:

1. ✅ **Restart backend** → New code loads permissions properly
2. ✅ **Clear localStorage** → Remove old cached data
3. ✅ **Login again** → Get fresh data with 14 permissions
4. ✅ **Verify** → All 3 menu items appear!

The backend now eagerly loads User → Role → Permissions in a single query, ensuring permissions are available when creating the JWT token response. 🎉
