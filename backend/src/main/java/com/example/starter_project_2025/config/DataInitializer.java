package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.menu.entity.Menu;
import com.example.starter_project_2025.system.menu.entity.MenuItem;
import com.example.starter_project_2025.system.menu.repository.MenuItemRepository;
import com.example.starter_project_2025.system.menu.repository.MenuRepository;
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
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentRepository assessmentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeMenus();
            initializeAssessments();
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
                createPermission("ROLE_ASSIGN", "Assign roles to users", "ROLE", "ASSIGN"),
                createPermission("ASSESSMENT_CREATE", "Create assessments", "ASSESSMENT", "CREATE"),
                createPermission("ASSESSMENT_READ", "Read assessments", "ASSESSMENT", "READ"),
                createPermission("ASSESSMENT_UPDATE", "Update assessments", "ASSESSMENT", "UPDATE"),
                createPermission("ASSESSMENT_DELETE", "Delete assessments", "ASSESSMENT", "DELETE"),
                createPermission("PROGRAMMING_LANGUAGE_CREATE", "Create new programming languages", "PROGRAMMING_LANGUAGE", "CREATE"),
                createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages", "PROGRAMMING_LANGUAGE", "READ"),
                createPermission("PROGRAMMING_LANGUAGE_UPDATE", "Update existing programming languages", "PROGRAMMING_LANGUAGE", "UPDATE"),
                createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages", "PROGRAMMING_LANGUAGE", "DELETE")

                );
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
        adminRole.setHierarchyLevel(1);
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);

        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        studentRole.setDescription("Student with limited access to educational resources");
        studentRole.setHierarchyLevel(2);
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

    private void initializeMenus() {
        Menu mainMenu = new Menu();
        mainMenu.setName("Main Menu");
        mainMenu.setDescription("Primary navigation menu");
        mainMenu.setIsActive(true);
        mainMenu.setDisplayOrder(1);
        mainMenu = menuRepository.save(mainMenu);

        MenuItem dashboard = createMenuItem(mainMenu, null, "Dashboard", "/dashboard", "dashboard", 1, null);
        menuItemRepository.save(dashboard);

        Menu adminMenu = new Menu();
        adminMenu.setName("Administration");
        adminMenu.setDescription("Administrative functions menu");
        adminMenu.setIsActive(true);
        adminMenu.setDisplayOrder(2);
        adminMenu = menuRepository.save(adminMenu);

        MenuItem userManagement = createMenuItem(adminMenu, null, "User Management", "/users", "people", 1, "USER_READ");
        MenuItem roleManagement = createMenuItem(adminMenu, null, "Role Management", "/roles", "security", 2, "ROLE_READ");
        MenuItem assessmentTypeManagement = createMenuItem(adminMenu, null, "Assessment Type Management", "/assessments", "security", 3, "ASSESSMENT_READ");
        menuItemRepository.saveAll(Arrays.asList(userManagement, roleManagement, assessmentTypeManagement));

        log.info("Initialized 2 menus with menu items");
    }

    private MenuItem createMenuItem(Menu menu, MenuItem parent, String title, String url, String icon, int order, String permission) {
        MenuItem item = new MenuItem();
        item.setMenu(menu);
        item.setParent(parent);
        item.setTitle(title);
        item.setUrl(url);
        item.setIcon(icon);
        item.setDisplayOrder(order);
        item.setIsActive(true);
        item.setRequiredPermission(permission);
        return item;
    }

    private void initializeAssessments() {

        if (assessmentRepository.count() > 0) {
            return;
        }

        Assessment a1 = new Assessment();
        a1.setName("Entrance Quiz");
        a1.setDescription("Assessment for entrance examination");

        Assessment a2 = new Assessment();
        a2.setName("Midterm Test");
        a2.setDescription("Midterm evaluation assessment");

        Assessment a3 = new Assessment();
        a3.setName("Final Exam");
        a3.setDescription("Final assessment of the course");

        assessmentRepository.saveAll(List.of(a1, a2, a3));

        log.info("Initialized {} assessments", 3);
    }

    private void ensureProgrammingLanguagePermissions() {
        // Check if programming language permissions exist
        boolean hasProgLangPerms = permissionRepository.existsByName("PROGRAMMING_LANGUAGE_READ");

        if (!hasProgLangPerms) {
            log.info("Programming language permissions not found, adding them...");

            List<Permission> progLangPermissions = Arrays.asList(
                    createPermission("PROGRAMMING_LANGUAGE_CREATE", "Create new programming languages", "PROGRAMMING_LANGUAGE", "CREATE"),
                    createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages", "PROGRAMMING_LANGUAGE", "READ"),
                    createPermission("PROGRAMMING_LANGUAGE_UPDATE", "Update existing programming languages", "PROGRAMMING_LANGUAGE", "UPDATE"),
                    createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages", "PROGRAMMING_LANGUAGE", "DELETE")
            );

            permissionRepository.saveAll(progLangPermissions);

            // Add these permissions to the ADMIN role
            Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
            if (adminRole != null) {
                adminRole.getPermissions().addAll(progLangPermissions);
                roleRepository.save(adminRole);
                log.info("Added programming language permissions to ADMIN role");
            }
        }
    }

}
