# RBAC Module Documentation

## Overview

This is a comprehensive, production-ready Role-Based Access Control (RBAC) module built with Spring Boot 3.x and React 18+ that can be integrated into any enterprise application.

## Architecture

### Role Hierarchy System

The RBAC module implements a flexible role hierarchy where permissions can be inherited:

```
SUPER_ADMIN (Level 0)
    ├── ADMIN (Level 1)
    │   └── STUDENT (Level 2)
    └── MANAGER (Level 1)
        └── USER (Level 2)
```

**Hierarchy Rules:**
- Higher-level roles inherit all permissions from lower-level roles
- SUPER_ADMIN has access to all system functions
- Custom hierarchies can be defined dynamically

## Core Components

### 1. Entity Model

#### Role Entity
```java
- id: UUID (Primary Key)
- name: String (Unique, e.g., "ADMIN", "STUDENT")
- description: String
- hierarchyLevel: Integer (0 = highest authority)
- isActive: Boolean
- permissions: Set<Permission> (Many-to-Many)
```

#### Permission Entity
```java
- id: UUID (Primary Key)
- name: String (Unique, e.g., "USER_CREATE")
- description: String
- resource: String (e.g., "USER", "ROLE")
- action: String (e.g., "CREATE", "READ", "UPDATE", "DELETE")
```

#### RoleHierarchy Entity
```java
- parentRole: Role (Higher authority)
- childRole: Role (Lower authority)
- hierarchyLevel: Integer
```

#### AuditLog Entity
```java
- entityType: String (ROLE, PERMISSION, USER)
- entityId: UUID
- action: String (CREATE, UPDATE, DELETE, ASSIGN)
- performedBy: UUID
- oldValue: JSON
- newValue: JSON
- performedAt: Timestamp
- ipAddress: String
```

### 2. Permission System

#### Granular Permissions

**User Management:**
- `USER_CREATE` - Create new users
- `USER_READ` - View user details
- `USER_UPDATE` - Modify user information
- `USER_DELETE` - Delete users
- `USER_ACTIVATE` - Activate/deactivate users

**Role Management:**
- `ROLE_CREATE` - Create new roles
- `ROLE_READ` - View roles
- `ROLE_UPDATE` - Modify roles
- `ROLE_DELETE` - Delete roles
- `ROLE_ASSIGN` - Assign roles to users

**Menu Management:**
- `MENU_CREATE` - Create menus
- `MENU_READ` - View menus
- `MENU_UPDATE` - Update menus
- `MENU_DELETE` - Delete menus
- `MENU_ITEM_CREATE` - Create menu items
- `MENU_ITEM_READ` - View menu items
- `MENU_ITEM_UPDATE` - Update menu items
- `MENU_ITEM_DELETE` - Delete menu items

#### Permission Mapping

Permissions are enforced at three levels:

1. **API Endpoint Level** (Spring Security)
```java
@PreAuthorize("hasAuthority('USER_CREATE')")
@PostMapping("/api/users")
public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request)
```

2. **Service Method Level**
```java
@PreAuthorize("hasAuthority('ROLE_UPDATE')")
public RoleDTO updateRole(UUID id, RoleDTO roleDTO)
```

3. **UI Component Level** (React)
```typescript
{hasPermission('USER_CREATE') && (
  <button onClick={handleCreateUser}>Create User</button>
)}
```

### 3. Role Hierarchy Implementation

#### Backend (Spring Security)

The system automatically includes parent role permissions:

```java
public Set<Permission> getEffectivePermissions(Role role) {
    Set<Permission> permissions = new HashSet<>(role.getPermissions());

    // Add permissions from child roles in hierarchy
    List<RoleHierarchy> childRoles = roleHierarchyRepository
        .findByParentRole(role);

    for (RoleHierarchy hierarchy : childRoles) {
        permissions.addAll(hierarchy.getChildRole().getPermissions());
    }

    return permissions;
}
```

#### Frontend (React Context)

```typescript
const hasPermission = (permission: string): boolean => {
  if (!user || !user.permissions) return false;

  // Check direct permission
  if (user.permissions.includes(permission)) return true;

  // Check inherited permissions through hierarchy
  return checkHierarchyPermissions(user.role, permission);
};
```

## API Endpoints

### Authentication

**POST /api/auth/login**
- Description: Authenticate user and receive JWT token
- Request Body:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN",
  "permissions": ["USER_CREATE", "USER_READ", ...]
}
```

### Role Management

**GET /api/roles**
- Description: Get all roles with pagination
- Authorization: Required (ROLE_READ)
- Query Parameters:
  - `page` (default: 0)
  - `size` (default: 20)
  - `sort` (e.g., "name,asc")
- Response:
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "ADMIN",
      "description": "Administrator role",
      "hierarchyLevel": 1,
      "permissionIds": ["uuid1", "uuid2"],
      "permissionNames": ["USER_CREATE", "USER_READ"],
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00"
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

**POST /api/roles**
- Description: Create new role
- Authorization: Required (ROLE_CREATE)
- Request Body:
```json
{
  "name": "MANAGER",
  "description": "Manager role with limited permissions",
  "hierarchyLevel": 1,
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**PUT /api/roles/{id}**
- Description: Update existing role
- Authorization: Required (ROLE_UPDATE)

**DELETE /api/roles/{id}**
- Description: Delete role
- Authorization: Required (ROLE_DELETE)

**POST /api/roles/{id}/activate**
- Description: Activate/deactivate role
- Authorization: Required (ROLE_UPDATE)

**GET /api/roles/{id}/hierarchy**
- Description: Get role hierarchy tree
- Authorization: Required (ROLE_READ)

**POST /api/roles/bulk-assign**
- Description: Assign roles to multiple users
- Authorization: Required (ROLE_ASSIGN)
- Request Body:
```json
{
  "roleId": "uuid",
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Permission Management

**GET /api/permissions**
- Description: Get all permissions
- Authorization: Required (ROLE_READ)
- Response: List of all available permissions

**GET /api/permissions/by-resource**
- Description: Get permissions grouped by resource
- Authorization: Required (ROLE_READ)

### User Management

**POST /api/users/{userId}/assign-role**
- Description: Assign role to user
- Authorization: Required (ROLE_ASSIGN)
- Request Body:
```json
{
  "roleId": "uuid"
}
```

### Audit Logs

**GET /api/audit-logs**
- Description: Get audit trail
- Authorization: Required (ADMIN only)
- Query Parameters:
  - `entityType` (ROLE, PERMISSION, USER)
  - `action` (CREATE, UPDATE, DELETE)
  - `startDate`
  - `endDate`
  - `page`, `size`, `sort`

**GET /api/audit-logs/entity/{entityId}**
- Description: Get audit history for specific entity
- Authorization: Required (ADMIN only)

## Security Implementation

### Method-Level Security

```java
@PreAuthorize("hasAuthority('USER_DELETE')")
public void deleteUser(UUID id) {
    // Only users with USER_DELETE permission can execute
}

@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public UserDTO updateUser(UUID userId, UserDTO dto) {
    // Admins can update anyone, users can update themselves
}

@PostAuthorize("returnObject.roleLevel >= authentication.principal.roleLevel")
public Role getRoleById(UUID id) {
    // Users can only view roles at or below their level
}
```

### JWT Configuration

**Token Structure:**
```json
{
  "sub": "admin@example.com",
  "userId": "uuid",
  "role": "ADMIN",
  "roleLevel": 1,
  "permissions": ["USER_CREATE", "USER_READ", ...],
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiration:** 24 hours (configurable)

**Refresh Strategy:** Client must re-authenticate after expiration

### CORS Configuration

```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "https://your-production-domain.com"
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

## Frontend Integration

### TypeScript Types

```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLevel: number;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  permissionIds: string[];
  permissionNames: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}
```

### Custom Hooks

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);

  return {
    user: context.user,
    login: context.login,
    logout: context.logout,
    hasPermission: context.hasPermission,
    hasRole: context.hasRole,
    hasAnyPermission: context.hasAnyPermission,
    hasAllPermissions: context.hasAllPermissions,
  };
};

// hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permissionName = `${resource}_${action}`;
    return hasPermission(permissionName);
  };

  return { hasPermission, canAccessResource };
};

// hooks/useRoleHierarchy.ts
export const useRoleHierarchy = () => {
  const { user } = useAuth();

  const canManageRole = (targetRoleLevel: number): boolean => {
    if (!user) return false;
    // Can only manage roles at lower levels
    return user.roleLevel < targetRoleLevel;
  };

  return { canManageRole };
};
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}) => {
  const { user, hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

### Conditional Rendering

```typescript
// components/PermissionGate.tsx
interface PermissionGateProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage
<PermissionGate permission="USER_CREATE">
  <Button onClick={handleCreate}>Create User</Button>
</PermissionGate>
```

## Integration Guide

### Step 1: Add Dependencies

**Backend (pom.xml):**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@types/react": "^18.2.0"
  }
}
```

### Step 2: Configure Database

Run the initialization scripts to create tables and seed data:

```sql
-- Tables are auto-created by JPA
-- Data seeded by DataInitializer.java
```

### Step 3: Configure Application Properties

```properties
# JWT Configuration
jwt.secret=YOUR_SECURE_SECRET_KEY_HERE
jwt.expiration=86400000

# Database
spring.datasource.url=jdbc:h2:mem:rbacdb
spring.jpa.hibernate.ddl-auto=create-drop
```

### Step 4: Import RBAC Module

**Backend:**
```java
@SpringBootApplication
@EnableMethodSecurity
public class YourApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourApplication.class, args);
    }
}
```

**Frontend:**
```typescript
import { AuthProvider } from './rbac/contexts/AuthContext';
import { ProtectedRoute } from './rbac/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute requiredPermission="ROLE_READ">
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
```

## Extending the System

### Adding New Roles

1. **Create via API:**
```bash
curl -X POST http://localhost:8080/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEACHER",
    "description": "Teacher with student management access",
    "hierarchyLevel": 2,
    "permissionIds": ["uuid1", "uuid2"]
  }'
```

2. **Or via Database:**
```sql
INSERT INTO roles (id, name, description, hierarchy_level, is_active)
VALUES (gen_random_uuid(), 'TEACHER', 'Teacher role', 2, true);
```

### Adding New Permissions

1. **Define Permission Constant:**
```java
public class PermissionConstants {
    public static final String COURSE_CREATE = "COURSE_CREATE";
    public static final String COURSE_READ = "COURSE_READ";
    // ...
}
```

2. **Add to Database:**
```java
Permission permission = new Permission();
permission.setName("COURSE_CREATE");
permission.setDescription("Create new courses");
permission.setResource("COURSE");
permission.setAction("CREATE");
permissionRepository.save(permission);
```

3. **Apply to Endpoint:**
```java
@PreAuthorize("hasAuthority('COURSE_CREATE')")
@PostMapping("/api/courses")
public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO dto) {
    // Implementation
}
```

### Custom Permission Logic

```java
@Component
public class CustomPermissionEvaluator {

    public boolean canEditUser(Authentication auth, UUID userId) {
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();

        // Users can edit themselves
        if (principal.getId().equals(userId)) {
            return true;
        }

        // Admins can edit anyone
        return principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("USER_UPDATE"));
    }
}

// Usage
@PreAuthorize("@customPermissionEvaluator.canEditUser(authentication, #userId)")
public UserDTO updateUser(UUID userId, UserDTO dto) {
    // Implementation
}
```

## Testing

### Backend Unit Tests

```java
@WebMvcTest(RoleController.class)
class RoleControllerTest {

    @MockBean
    private RoleService roleService;

    @Test
    @WithMockUser(authorities = {"ROLE_READ"})
    void getAllRoles_WithPermission_ReturnsRoles() throws Exception {
        mockMvc.perform(get("/api/roles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(authorities = {})
    void createRole_WithoutPermission_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }
}
```

### Frontend Unit Tests

```typescript
describe('usePermissions', () => {
  it('should return true for granted permission', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthProvider user={mockAdminUser}>
          {children}
        </AuthProvider>
      ),
    });

    expect(result.current.hasPermission('USER_CREATE')).toBe(true);
  });

  it('should return false for denied permission', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthProvider user={mockStudentUser}>
          {children}
        </AuthProvider>
      ),
    });

    expect(result.current.hasPermission('USER_DELETE')).toBe(false);
  });
});
```

## Performance Considerations

### Caching

```java
@Cacheable(value = "roles", key = "#id")
public Role getRoleById(UUID id) {
    return roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
}

@CacheEvict(value = "roles", key = "#id")
public void deleteRole(UUID id) {
    roleRepository.deleteById(id);
}
```

### Pagination

```java
@GetMapping
public ResponseEntity<Page<RoleDTO>> getAllRoles(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "name,asc") String[] sort) {

    Pageable pageable = PageRequest.of(page, size, Sort.by(
        Sort.Order.by(sort[0]).with(Sort.Direction.fromString(sort[1]))
    ));

    return ResponseEntity.ok(roleService.getAllRoles(pageable));
}
```

### Query Optimization

```java
@Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
Optional<Role> findByIdWithPermissions(@Param("id") UUID id);
```

## Troubleshooting

### Common Issues

**Issue: 403 Forbidden on API calls**
- Check JWT token is included in Authorization header
- Verify user has required permission
- Check token hasn't expired

**Issue: Permission changes not reflected**
- Clear browser cache and localStorage
- Implement token refresh mechanism
- Check audit logs for permission changes

**Issue: Circular dependency in role hierarchy**
- Validate hierarchy before saving
- Implement cycle detection algorithm

## Best Practices

1. **Principle of Least Privilege**: Grant minimum permissions necessary
2. **Regular Audits**: Review audit logs periodically
3. **Permission Naming**: Use consistent naming: `RESOURCE_ACTION`
4. **Role Granularity**: Balance between too many and too few roles
5. **Documentation**: Document custom permissions and roles
6. **Testing**: Test permission enforcement at all levels
7. **Token Management**: Implement secure token storage and refresh
8. **Error Handling**: Provide clear error messages for access denied

## Support

For issues or questions:
- Check logs at `/logs/application.log`
- Review audit trail at `/api/audit-logs`
- Consult API documentation at `/swagger-ui.html`
- Check this documentation

## License

This RBAC module is part of the Menu RBAC Management System.
