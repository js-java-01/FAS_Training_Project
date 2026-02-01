package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleRepository moduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeModuleGroups();

            log.info("Database initialization completed successfully!");
        } else {
            log.info("Database already initialized, skipping data initialization.");
        }
    }

    private void initializePermissions() {
        List<Permission> permissions = Arrays.asList(
                createPermission("MENU_CREATE", "Create new menus", "MENU", "CREATE"),
                createPermission("MENU_READ", "View menus", "MENU", "READ"),
                createPermission("MENU_UPDATE", "Update existing menus", "MENU", "UPDATE"),
                createPermission("MENU_DELETE", "Delete menus", "MENU", "DELETE"),
                createPermission("MENU_ITEM_CREATE", "Create new menu items", "MENU_ITEM", "CREATE"),
                createPermission("MENU_ITEM_READ", "View menu items", "MENU_ITEM", "READ"),
                createPermission("MENU_ITEM_UPDATE", "Update existing menu items", "MENU_ITEM", "UPDATE"),
                createPermission("MENU_ITEM_DELETE", "Delete menu items", "MENU_ITEM", "DELETE"),
                createPermission("USER_CREATE", "Create new users", "USER", "CREATE"),
                createPermission("USER_READ", "View users", "USER", "READ"),
                createPermission("USER_UPDATE", "Update existing users", "USER", "UPDATE"),
                createPermission("USER_DELETE", "Delete users", "USER", "DELETE"),
                createPermission("USER_ACTIVATE", "Activate/deactivate users", "USER", "ACTIVATE"),
                createPermission("ROLE_CREATE", "Create new roles", "ROLE", "CREATE"),
                createPermission("ROLE_READ", "View roles", "ROLE", "READ"),
                createPermission("ROLE_UPDATE", "Update existing roles", "ROLE", "UPDATE"),
                createPermission("ROLE_DELETE", "Delete roles", "ROLE", "DELETE"),
                createPermission("ROLE_ASSIGN", "Assign roles to users", "ROLE", "ASSIGN"));
        permissionRepository.saveAll(permissions);
        log.info("Initialized {} permissions", permissions.size());
    }

    private Permission createPermission(String name, String description, String resource, String action) {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDescription(description);
        permission.setResource(resource);
        permission.setAction(action);
        return permission;
    }

    private void initializeRoles() {
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole.setDescription("Administrator with full system access");
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);

        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        studentRole.setDescription("Student with limited access to educational resources");
        studentRole.setPermissions(new HashSet<>(permissionRepository.findByAction("READ")));
        roleRepository.save(studentRole);

        log.info("Initialized 2 roles: ADMIN and STUDENT");
    }

    private void initializeUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(adminRole);
        admin.setIsActive(true);
        userRepository.save(admin);

        User student1 = new User();
        student1.setEmail("student@example.com");
        student1.setPasswordHash(passwordEncoder.encode("password123"));
        student1.setFirstName("John");
        student1.setLastName("Doe");
        student1.setRole(studentRole);
        student1.setIsActive(true);
        userRepository.save(student1);

        User student2 = new User();
        student2.setEmail("jane.smith@example.com");
        student2.setPasswordHash(passwordEncoder.encode("password123"));
        student2.setFirstName("Jane");
        student2.setLastName("Smith");
        student2.setRole(studentRole);
        student2.setIsActive(true);
        userRepository.save(student2);

        log.info("Initialized 3 users (admin@example.com, student@example.com, jane.smith@example.com)");
    }

    private void initializeModuleGroups() {
        // 1. Nhóm: Main Menu
        ModuleGroups mainGroup = new ModuleGroups();
        mainGroup.setName("Main Menu");
        mainGroup.setDescription("Main navigation menu of the application");
        mainGroup.setDisplayOrder(1);
        mainGroup.setIsActive(true);
        mainGroup = moduleGroupsRepository.save(mainGroup); // Lưu để lấy ID tự sinh

        moduleRepository.save(createModule(mainGroup, "Dashboard", "/dashboard", "home", 1, "MENU_READ",
                "System dashboard overview"));

        // 2. Nhóm: User Management
        ModuleGroups userGroup = new ModuleGroups();
        userGroup.setName("User Management");
        userGroup.setDescription("Manage user accounts, roles, and permissions");
        userGroup.setDisplayOrder(2);
        userGroup.setIsActive(true);
        userGroup = moduleGroupsRepository.save(userGroup);

        moduleRepository.save(
                createModule(userGroup, "User Management", "/users", "users", 1, "USER_READ", "Manage system users"));

        // 3. Nhóm: Role Management
        ModuleGroups roleGroup = new ModuleGroups();
        roleGroup.setName("Role Management");
        roleGroup.setDescription("Manage roles and role-based access control");
        roleGroup.setDisplayOrder(3);
        roleGroup.setIsActive(true);
        roleGroup = moduleGroupsRepository.save(roleGroup);

        moduleRepository.save(createModule(roleGroup, "Role Management", "/roles", "shield", 2, "ROLE_READ",
                "Manage roles and permissions"));

        // 4. Nhóm: System Management
        ModuleGroups systemGroup = new ModuleGroups();
        systemGroup.setName("System Management");
        systemGroup.setDescription("System configuration and administration");
        systemGroup.setDisplayOrder(4);
        systemGroup.setIsActive(true);
        systemGroup = moduleGroupsRepository.save(systemGroup);

        // Nhóm này có 2 module con
        Module moduleGroupsSub = createModule(systemGroup, "Module Groups", "/moduleGroups", "layers", 1, "MENU_READ",
                "Manage module groups");
        Module modulesSub = createModule(systemGroup, "Modules", "/modules", "menu", 2, "MENU_READ",
                "Manage system modules");

        moduleRepository.saveAll(Arrays.asList(moduleGroupsSub, modulesSub));

        log.info("Initialized 4 module groups and their respective modules.");
    }

    private Module createModule(ModuleGroups group, String title, String url, String icon,
            int order, String permission, String description) {
        Module module = new Module();
        module.setModuleGroup(group); // Gán quan hệ group_id
        module.setTitle(title);
        module.setUrl(url);
        module.setIcon(icon);
        module.setDisplayOrder(order);
        module.setRequiredPermission(permission);
        module.setDescription(description);
        module.setIsActive(true);
        return module;
    }

}