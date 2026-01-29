# Troubleshooting Guide

## FIXED: Login Error "An unexpected error occurred: null"

**✅ This issue has been fixed!** The problem was missing `application.properties` configuration.

The `application.properties` file has been updated with all required settings including:
- Database configuration
- JWT secret key
- Server configuration

**To apply the fix:** Restart your backend server with `./mvnw spring-boot:run`

See `QUICK_START.md` for complete setup instructions.

---

## Other Common Issues

### Login Error: Backend not running

This error occurs when the backend isn't running. Here's how to fix it:

### Solution 1: Start the Backend

The backend Spring Boot application must be running before you can login.

**Start the backend:**
```bash
# From the project root directory
./mvnw spring-boot:run

# OR if you have Maven installed
mvn spring-boot:run
```

The backend will start on `http://localhost:8080` and automatically:
- Initialize the H2 in-memory database
- Create all tables
- Insert sample data (users, roles, permissions)

**You should see logs like:**
```
Initializing database with sample data...
Initialized 18 permissions
Initialized 2 roles: ADMIN and STUDENT
Initialized 3 users (admin@example.com, student@example.com, jane.smith@example.com)
Initialized 3 menus with menu items
Database initialization completed successfully!
```

### Solution 2: Check Backend is Running

Make sure the backend is accessible:

```bash
curl http://localhost:8080/api/auth/login
```

You should get a 400 error (bad request) not a connection error.

### Solution 3: Check CORS Configuration

If the backend is running but you still get errors, check the browser console for CORS errors.

The backend CORS configuration allows:
- `http://localhost:3000` (default Vite dev server)
- `http://localhost:5173` (alternative Vite port)

If your frontend is on a different port, update `SecurityConfig.java`:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:YOUR_PORT"  // Add your port
));
```

### Solution 4: Check Database Connection

The application uses H2 in-memory database by default.

**Access H2 Console:**
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:rbacdb`
- Username: `sa`
- Password: (leave blank)

**Check if users exist:**
```sql
SELECT * FROM users;
```

You should see 3 users:
1. admin@example.com
2. student@example.com
3. jane.smith@example.com

### Solution 5: Verify Application Properties

Check `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration (H2 - In-Memory)
spring.datasource.url=jdbc:h2:mem:rbacdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT Configuration
jwt.secret=YOUR_SECRET_KEY_MUST_BE_AT_LEAST_256_BITS_LONG_FOR_HS256_ALGORITHM
jwt.expiration=86400000
```

### Solution 6: Check Frontend API URL

Check `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

If you don't have a `.env` file, create one from `.env.example`:
```bash
cd frontend
cp .env.example .env
```

### Solution 7: Clear Browser Data

Sometimes cached data causes issues:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear localStorage
4. Clear sessionStorage
5. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Solution 8: Check Network Request

Open browser DevTools > Network tab and try logging in again.

**Look for the login request:**
- URL should be: `http://localhost:8080/api/auth/login`
- Method: POST
- Status: Should be 200 (success) or 401 (unauthorized)

**Common status codes:**
- **0 or ERR_CONNECTION_REFUSED**: Backend not running
- **401**: Wrong credentials (but backend is working)
- **403**: CORS issue
- **500**: Backend error (check backend logs)

### Default Test Credentials

**Admin User:**
- Email: `admin@example.com`
- Password: `password123`
- Has all permissions

**Student User:**
- Email: `student@example.com`
- Password: `password123`
- Has READ-only permissions

## Other Common Issues

### Issue: "Port 8080 already in use"

Another application is using port 8080.

**Solution:**
```bash
# Kill the process using port 8080
# On Linux/Mac:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# OR change the port in application.properties:
server.port=8081
```

### Issue: Frontend won't start

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "Cannot find module" errors in frontend

**Solution:**
Make sure all dependencies are installed:
```bash
cd frontend
npm install react react-dom react-router-dom axios
npm install -D @types/react @types/react-dom
```

### Issue: Permissions not working

**Solution:**
1. Check the user has the required permission in the database
2. Re-login to get fresh JWT token with updated permissions
3. Check browser console for permission errors

### Getting Help

If none of these solutions work:

1. **Check backend logs** - Look for exceptions or errors
2. **Check browser console** - Look for JavaScript errors
3. **Check Network tab** - See what requests are failing
4. **Verify all services are running:**
   - Backend: http://localhost:8080
   - Frontend: http://localhost:3000

## Quick Start Checklist

- [ ] Backend is running (`./mvnw spring-boot:run`)
- [ ] Database is initialized (check logs)
- [ ] Frontend is running (`npm run dev`)
- [ ] Can access backend at http://localhost:8080
- [ ] Can access frontend at http://localhost:3000
- [ ] No CORS errors in browser console
- [ ] Using correct credentials (admin@example.com / password123)
