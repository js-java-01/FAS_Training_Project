# Permission Debugging Guide

## Current Issue
Menu items are loading but permission checks return `false` because the user object doesn't have permissions.

## Step-by-Step Fix

### Step 1: Clear Browser Cache
The old login data (before the backend fix) is cached in localStorage without permissions.

**Open browser console (F12) and run:**
```javascript
localStorage.clear();
location.reload();
```

### Step 2: Restart Backend
Make sure the backend is running the updated code with the new eager-loading query.

**In terminal:**
```bash
# Stop existing backend
pkill -f "spring-boot:run"

# Start backend with new code
./mvnw spring-boot:run
```

Wait 30-40 seconds for it to start fully.

### Step 3: Re-Login
1. Go to http://localhost:5173
2. Login with:
   - Email: `admin@example.com`
   - Password: `password123`

### Step 4: Check Console Logs

#### Expected Backend Logs (in terminal)
You should see during login:
```
=== AUTH SERVICE DEBUG ===
User: admin@example.com
Role: ADMIN
Authorities count: 14
Permissions: [USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, ROLE_CREATE, ROLE_READ, ROLE_UPDATE, ROLE_DELETE, MENU_CREATE, MENU_READ, MENU_UPDATE, MENU_DELETE, MENU_ITEM_CREATE, MENU_ITEM_READ]
Permissions count: 14
```

#### Expected Frontend Logs (in browser console)
After login, you should see:
```
=== LOGIN RESPONSE ===
Full response: {token: "...", type: "Bearer", email: "admin@example.com", ...}
Permissions: Array(14) ['USER_CREATE', 'USER_READ', ...]
Permissions count: 14

=== USER PERMISSIONS ===
Full user object: {token: "...", permissions: Array(14), ...}
User email: admin@example.com
Role: ADMIN
Permissions: Array(14)
Permission count: 14
Permissions is Array? true
First 5 permissions: ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE']
Has USER_READ? true
Has ROLE_READ? true

=== MENU DEBUG ===
Menu 1: Main Menu - Items: 1
  - Dashboard (/dashboard) - Permission: none
Menu 2: Administration - Items: 2
  - Role Management (/roles) - Permission: ROLE_READ
  - User Management (/users) - Permission: USER_READ

Permission check: ROLE_READ = true ✅
Permission check: USER_READ = true ✅
```

### Step 5: Verify Sidebar
The sidebar should now show all 3 menu items:
- 📊 Dashboard
- 🔐 Role Management
- 👥 User Management

## Troubleshooting

### If Permissions Count is 0 in Login Response

**Problem:** Backend isn't loading permissions properly.

**Check:**
1. Is the backend using the new `findByEmailWithRoleAndPermissions` method?
2. Look at backend console for the "AUTH SERVICE DEBUG" output
3. If authorities count is 0, the role doesn't have permissions assigned

**Solution:**
```bash
# Restart backend to re-initialize data
pkill -f "spring-boot:run"
./mvnw spring-boot:run
```

The `DataInitializer` should assign all 14 permissions to ADMIN role on startup.

### If hasPermission Returns False Despite Having Permissions

**Problem:** Permissions array format mismatch or type issue.

**Check in browser console:**
```javascript
// Get the stored user
const user = JSON.parse(localStorage.getItem('user'));
console.log('Stored permissions:', user.permissions);
console.log('Type:', typeof user.permissions);
console.log('Is Array?', Array.isArray(user.permissions));

// Test includes
console.log('Has USER_READ?', user.permissions.includes('USER_READ'));
```

**If permissions is an object instead of array:**
The backend is returning permissions as a Set, which might serialize to an object.

**Solution:** Check the LoginResponse DTO - it should use `List<String>` or ensure proper JSON serialization.

### If Backend Won't Start

**Check Java installation:**
```bash
java -version
```

**If Java is not installed:** You'll need to install JDK 17 or higher.

### If Frontend Shows "User Permissions Missing"

**Problem:** User object is null or doesn't have permissions field.

**Check:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User keys:', Object.keys(user));
console.log('Has permissions key?', 'permissions' in user);
```

**Solution:** Clear localStorage and re-login.

## Quick Verification Script

**Run this in browser console after login:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
const checks = {
  'User exists': !!user,
  'Has permissions': !!user?.permissions,
  'Permissions is array': Array.isArray(user?.permissions),
  'Permission count': user?.permissions?.length || 0,
  'Has USER_READ': user?.permissions?.includes('USER_READ'),
  'Has ROLE_READ': user?.permissions?.includes('ROLE_READ'),
};
console.table(checks);
```

**Expected Output:**
```
User exists          : true
Has permissions      : true
Permissions is array : true
Permission count     : 14
Has USER_READ       : true
Has ROLE_READ       : true
```

## Summary of Changes Made

### Backend
1. ✅ Added `findByEmailWithRoleAndPermissions` to UserRepository
2. ✅ Updated UserDetailsServiceImpl to use eager loading
3. ✅ Added debug logging to AuthService

### Frontend
1. ✅ Added debug logging to AuthContext (login response)
2. ✅ Added debug logging to hasPermission function
3. ✅ Added detailed logging to Sidebar component

## What Should Happen

When everything works:
1. User logs in
2. Backend loads user + role + permissions in one query
3. Backend returns LoginResponse with 14 permissions
4. Frontend stores response in localStorage
5. Sidebar loads and checks permissions
6. All permission checks pass
7. All 3 menu items show in sidebar

## Next Steps

1. **Clear localStorage** and **re-login**
2. Check the console logs match the expected output above
3. If still not working, share the exact console output from both:
   - Backend terminal (AUTH SERVICE DEBUG section)
   - Browser console (LOGIN RESPONSE and USER PERMISSIONS sections)
