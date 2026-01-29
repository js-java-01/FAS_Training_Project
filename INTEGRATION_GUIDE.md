# RBAC Module Integration Guide

## Quick Start

This guide will help you integrate the RBAC module into your existing application in under 30 minutes.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Integration](#backend-integration)
3. [Frontend Integration](#frontend-integration)
4. [Testing Integration](#testing-integration)
5. [Production Checklist](#production-checklist)

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Existing Spring Boot or React application

## Backend Integration

### Step 1: Add Dependencies

Add to your `pom.xml`:

```xml
<dependencies>
    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### Step 2: Copy RBAC Module Files

Copy these directories to your project:

```
src/main/java/com/yourpackage/
├── entity/
│   ├── Role.java
│   ├── Permission.java
│   ├── RoleHierarchy.java
│   ├── User.java
│   └── AuditLog.java
├── repository/
│   ├── RoleRepository.java
│   ├── PermissionRepository.java
│   ├── UserRepository.java
│   └── AuditLogRepository.java
├── service/
│   ├── RoleService.java
│   ├── PermissionService.java
│   ├── UserService.java
│   └── AuthService.java
├── controller/
│   ├── AuthController.java
│   ├── RoleController.java
│   ├── PermissionController.java
│   └── UserController.java
├── security/
│   ├── JwtUtil.java
│   ├── UserDetailsImpl.java
│   ├── UserDetailsServiceImpl.java
│   └── JwtAuthenticationFilter.java
├── config/
│   ├── SecurityConfig.java
│   └── DataInitializer.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── UserDTO.java
│   ├── RoleDTO.java
│   └── PermissionDTO.java
└── exception/
    ├── ResourceNotFoundException.java
    ├── BadRequestException.java
    └── GlobalExceptionHandler.java
```

### Step 3: Configure Application Properties

Add to `application.properties`:

```properties
# JWT Configuration
jwt.secret=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_AT_LEAST_64_CHARACTERS_LONG
jwt.expiration=86400000

# Enable Method Security
spring.security.enabled=true
```

### Step 4: Enable Method Security

Update your main application class:

```java
@SpringBootApplication
@EnableMethodSecurity(prePostEnabled = true)
public class YourApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourApplication.class, args);
    }
}
```

### Step 5: Protect Your Endpoints

Add security annotations to your controllers:

```java
@RestController
@RequestMapping("/api/your-resource")
public class YourResourceController {

    @PreAuthorize("hasAuthority('YOUR_RESOURCE_READ')")
    @GetMapping
    public ResponseEntity<List<YourResourceDTO>> getAll() {
        // Your logic
    }

    @PreAuthorize("hasAuthority('YOUR_RESOURCE_CREATE')")
    @PostMapping
    public ResponseEntity<YourResourceDTO> create(@RequestBody YourResourceDTO dto) {
        // Your logic
    }

    @PreAuthorize("hasAuthority('YOUR_RESOURCE_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<YourResourceDTO> update(
            @PathVariable UUID id,
            @RequestBody YourResourceDTO dto) {
        // Your logic
    }

    @PreAuthorize("hasAuthority('YOUR_RESOURCE_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        // Your logic
    }
}
```

### Step 6: Create Custom Permissions

Add your application-specific permissions:

```java
@Component
public class CustomPermissionsInitializer implements CommandLineRunner {

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {
        createPermissionIfNotExists(
            "COURSE_CREATE",
            "Create courses",
            "COURSE",
            "CREATE"
        );
        createPermissionIfNotExists(
            "COURSE_READ",
            "View courses",
            "COURSE",
            "READ"
        );
        // Add more permissions...
    }

    private void createPermissionIfNotExists(
            String name,
            String description,
            String resource,
            String action) {
        if (!permissionRepository.existsByName(name)) {
            Permission permission = new Permission();
            permission.setName(name);
            permission.setDescription(description);
            permission.setResource(resource);
            permission.setAction(action);
            permissionRepository.save(permission);
        }
    }
}
```

## Frontend Integration

### Step 1: Install Dependencies

```bash
cd frontend
npm install axios react-router-dom
npm install --save-dev @types/react @types/react-dom
```

### Step 2: Convert to TypeScript (if not already)

Rename files from `.jsx` to `.tsx` and `.js` to `.ts`.

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 3: Copy RBAC Frontend Files

Copy these directories:

```
src/
├── api/
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── roleApi.ts
│   └── userApi.ts
├── contexts/
│   └── AuthContext.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   └── PermissionGate.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useRoleHierarchy.ts
└── types/
    ├── auth.ts
    ├── role.ts
    └── user.ts
```

### Step 4: Create Type Definitions

Create `src/types/auth.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLevel: number;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}
```

### Step 5: Wrap Your App with AuthProvider

Update `App.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Your routes and components */}
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### Step 6: Protect Your Routes

```typescript
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermission="ROLE_READ">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute requiredPermission="COURSE_READ">
            <CourseList />
          </ProtectedRoute>
        }
      />

      {/* More routes */}
    </Routes>
  );
}
```

### Step 7: Use Permission Gates in Components

```typescript
import { PermissionGate } from './components/PermissionGate';
import { useAuth } from './hooks/useAuth';

function CourseList() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <h1>Courses</h1>

      {/* Conditionally render based on permission */}
      {hasPermission('COURSE_CREATE') && (
        <button onClick={handleCreate}>Create Course</button>
      )}

      {/* Or use PermissionGate component */}
      <PermissionGate permission="COURSE_DELETE">
        <button onClick={handleDelete}>Delete</button>
      </PermissionGate>

      {/* Course list */}
    </div>
  );
}
```

### Step 8: Create Custom Hooks

Create `src/hooks/usePermissions.ts`:

```typescript
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permissionName = `${resource}_${action}`;
    return hasPermission(permissionName);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
  };
};
```

## Testing Integration

### Backend Tests

Create integration tests:

```java
@SpringBootTest
@AutoConfigureMockMvc
class RBACIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    @WithMockUser(authorities = {"ROLE_READ"})
    void getRoles_WithPermission_ReturnsSuccess() throws Exception {
        mockMvc.perform(get("/api/roles"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {})
    void createRole_WithoutPermission_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void login_WithValidCredentials_ReturnsToken() throws Exception {
        String loginJson = """
            {
                "email": "admin@example.com",
                "password": "password123"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
```

### Frontend Tests

Create component tests:

```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to login when user is not authenticated', () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows content when user has required permission', () => {
    const mockUser = {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      roleLevel: 0,
      permissions: ['ROLE_READ'],
    };

    render(
      <AuthProvider initialUser={mockUser}>
        <ProtectedRoute requiredPermission="ROLE_READ">
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
```

## Production Checklist

Before deploying to production:

### Security

- [ ] Change JWT secret to a strong, random value
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains only
- [ ] Set secure cookie flags
- [ ] Enable CSRF protection
- [ ] Implement rate limiting
- [ ] Set up Web Application Firewall (WAF)

### Database

- [ ] Use PostgreSQL or MySQL (not H2)
- [ ] Enable SSL for database connections
- [ ] Set up regular backups
- [ ] Configure connection pooling
- [ ] Add database indexes

### Monitoring

- [ ] Set up application logging
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Add performance monitoring
- [ ] Set up health check endpoints
- [ ] Configure alerts for security events

### Documentation

- [ ] Document all custom permissions
- [ ] Create role assignment guidelines
- [ ] Document API endpoints
- [ ] Provide user guides

### Testing

- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Perform security penetration testing
- [ ] Test role hierarchy
- [ ] Verify permission enforcement

## Common Integration Scenarios

### Scenario 1: Adding RBAC to Existing Entities

If you have existing entities (e.g., Course, Assignment):

1. **Create Permissions:**
```java
COURSE_CREATE, COURSE_READ, COURSE_UPDATE, COURSE_DELETE
ASSIGNMENT_CREATE, ASSIGNMENT_READ, ASSIGNMENT_UPDATE, ASSIGNMENT_DELETE
```

2. **Add to Controllers:**
```java
@PreAuthorize("hasAuthority('COURSE_CREATE')")
@PostMapping("/api/courses")
public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO dto) {
    // Implementation
}
```

3. **Update Frontend:**
```typescript
<PermissionGate permission="COURSE_CREATE">
  <CreateCourseButton />
</PermissionGate>
```

### Scenario 2: Multi-Tenant Applications

For multi-tenant setups:

1. **Add Tenant Context:**
```java
@PreAuthorize("hasAuthority('COURSE_READ') and @tenantService.canAccess(#courseId)")
public CourseDTO getCourse(UUID courseId) {
    // Implementation
}
```

2. **Custom Permission Evaluator:**
```java
@Component
public class TenantPermissionEvaluator {
    public boolean canAccess(Authentication auth, UUID resourceId) {
        // Check if user belongs to same tenant as resource
    }
}
```

### Scenario 3: Dynamic UI Based on Roles

```typescript
function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>

      {user.role === 'ADMIN' && <AdminDashboard />}
      {user.role === 'STUDENT' && <StudentDashboard />}
      {user.role === 'TEACHER' && <TeacherDashboard />}
    </div>
  );
}
```

## Troubleshooting

### Issue: 403 Forbidden on all requests

**Solution:**
- Check JWT token is being sent in Authorization header
- Verify token hasn't expired
- Check user has required permission
- Review SecurityConfig CORS settings

### Issue: Permissions not updating

**Solution:**
- Clear browser localStorage
- Re-login to get new token with updated permissions
- Check database for permission assignments

### Issue: Circular dependencies

**Solution:**
- Review @Autowired dependencies
- Use constructor injection instead of field injection
- Check for circular @PreAuthorize references

## Support

For integration issues:
- Review logs at `/logs/application.log`
- Check API documentation at `/swagger-ui.html`
- Review RBAC_MODULE.md for detailed documentation
- Test API with Postman collection

## Next Steps

After successful integration:
1. Customize roles for your application needs
2. Define application-specific permissions
3. Set up role hierarchy matching your organization
4. Create user onboarding flows
5. Implement audit log review processes
6. Set up monitoring and alerts

## Example Applications

See the included sample applications:
- `examples/e-learning-platform` - RBAC in education system
- `examples/project-management` - RBAC in project management
- `examples/healthcare-system` - RBAC in healthcare

## Additional Resources

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io/)
- [OWASP Security Guidelines](https://owasp.org/)
- [React Security Best Practices](https://react.dev/learn)
