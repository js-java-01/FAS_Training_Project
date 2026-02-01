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
        ModuleGroups mainGroup = new ModuleGroups();
        mainGroup.setName("Main Menu");
        mainGroup.setDescription("Primary navigation menu");
        mainGroup.setIsActive(true);
        mainGroup.setDisplayOrder(1);
        mainGroup = moduleGroupsRepository.save(mainGroup);

        Module dashboard = createModule(mainGroup, "Dashboard", "/dashboard", "dashboard", 1, null);
        moduleRepository.save(dashboard);

        ModuleGroups adminGroup = new ModuleGroups();
        adminGroup.setName("Administration");
        adminGroup.setDescription("Administrative functions menu");
        adminGroup.setIsActive(true);
        adminGroup.setDisplayOrder(2);
        adminGroup = moduleGroupsRepository.save(adminGroup);

        Module userManagement = createModule(adminGroup, "User Management", "/users", "people", 1,
                "USER_READ");
        Module roleManagement = createModule(adminGroup,  "Role Management", "/roles", "security", 2,
                "ROLE_READ");
        moduleRepository.saveAll(Arrays.asList(userManagement, roleManagement));

        log.info("Initialized 2 module groups with modules");
    }

    private Module createModule(ModuleGroups moduleGroup, String title, String url, String icon, int order,
                                String permission) {
        Module m = new Module();
        m.setModuleGroup(moduleGroup);
        m.setTitle(title);
        m.setUrl(url);
        m.setIcon(icon);
        m.setDisplayOrder(order);
        m.setIsActive(true);
        m.setRequiredPermission(permission);
        return m;
    }
}