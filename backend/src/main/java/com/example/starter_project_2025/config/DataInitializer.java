package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
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
    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleRepository moduleRepository;
    private final ProgrammingLanguageRepository programmingLanguageRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentTypeRepository assessmentTypeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeModuleGroups();
            initializeAssessments();
            log.info("Database initialization completed successfully!");
        } else {
            log.info("Database already initialized, checking for missing permissions...");
            // Check if programming language permissions exist, if not, add them
            ensureProgrammingLanguagePermissions();
            // Always check and initialize programming languages if they don't exist
            initializeProgrammingLanguages();
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
                createPermission("ASSESSMENT_READ", "View assessment types", "ASSESSMENT_TYPE", "READ"),
                createPermission("ASSESSMENT_UPDATE", "Update existing assessment types", "ASSESSMENT_TYPE", "UPDATE"),
                createPermission("ASSESSMENT_DELETE", "Delete assessment types", "ASSESSMENT_TYPE", "DELETE"),
                createPermission("ASSESSMENT_CREATE", "Assign assessment types", "ASSESSMENT_TYPE", "ASSIGN"),
                createPermission("STUDENT_CREATE", "Create new students", "STUDENT", "CREATE"),
                createPermission("STUDENT_READ", "View students", "STUDENT", "READ"),
                createPermission("STUDENT_UPDATE", "Update existing students", "STUDENT", "UPDATE"),
                createPermission("STUDENT_DELETE", "Delete students", "STUDENT", "DELETE"),
                createPermission("STUDENT_ASSIGN", "Assign students", "STUDENT", "ASSIGN")


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

        // 5. Nhóm: Assessment Type Management
        ModuleGroups assessmentTypeGroup = new ModuleGroups();
        assessmentTypeGroup.setName("Assessment Type Management");
        assessmentTypeGroup.setDescription("Manage assessment types and related permissions");
        assessmentTypeGroup.setDisplayOrder(3);
        assessmentTypeGroup.setIsActive(true);
        assessmentTypeGroup = moduleGroupsRepository.save(assessmentTypeGroup);

        moduleRepository.save(
                createModule(
                        assessmentTypeGroup,
                        "Assessment Type Management",
                        "/assessment-type",
                        "shield", // icon (you can change if you want)
                        2,
                        "ASSESSMENT_READ",
                        "Manage assessment types"));


        // 6. Nhóm: Student Management
        ModuleGroups studentGroup = new ModuleGroups();
        studentGroup.setName("Student Management");
        studentGroup.setDescription("Manage students and related permissions");
        studentGroup.setDisplayOrder(4); // next order after assessment type
        studentGroup.setIsActive(true);
        studentGroup = moduleGroupsRepository.save(studentGroup);

        moduleRepository.save(
                createModule(
                        studentGroup,
                        "Student Management",
                        "/v1/student",
                        "users", // icon, you can change
                        1,
                        "STUDENT_READ",
                        "Manage students"));

        log.info("Initialized 5 module groups and their respective modules.");
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

    private void initializeAssessments() {

        if (assessmentTypeRepository.count() > 0) {
            return;
        }

        AssessmentType a1 = new AssessmentType();
        a1.setName("Entrance Quiz");
        a1.setDescription("Assessment for entrance examination");

        AssessmentType a2 = new AssessmentType();
        a2.setName("Midterm Test");
        a2.setDescription("Midterm evaluation assessment");

        AssessmentType a3 = new AssessmentType();
        a3.setName("Final Exam");
        a3.setDescription("Final assessment of the course");

        assessmentTypeRepository.saveAll(List.of(a1, a2, a3));

        log.info("Initialized {} assessments", 3);
    }

    private void ensureProgrammingLanguagePermissions() {
        boolean hasProgLangPerms = permissionRepository.existsByName("PROGRAMMING_LANGUAGE_READ");

        if (!hasProgLangPerms) {
            log.info("Programming language permissions not found, adding them...");

            List<Permission> progLangPermissions = Arrays.asList(
                    createPermission("PROGRAMMING_LANGUAGE_CREATE", "Create new programming languages",
                            "PROGRAMMING_LANGUAGE", "CREATE"),
                    createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages", "PROGRAMMING_LANGUAGE",
                            "READ"),
                    createPermission("PROGRAMMING_LANGUAGE_UPDATE", "Update existing programming languages",
                            "PROGRAMMING_LANGUAGE", "UPDATE"),
                    createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages",
                            "PROGRAMMING_LANGUAGE", "DELETE"));

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

    private void initializeProgrammingLanguages() {
        // Only initialize if no programming languages exist
        if (programmingLanguageRepository.count() == 0) {
            ProgrammingLanguage java = createProgrammingLanguage("Java", "17",
                    "Object-oriented programming language widely used for enterprise applications", true);
            ProgrammingLanguage python = createProgrammingLanguage("Python", "3.11",
                    "High-level interpreted language popular for data science and web development", true);
            ProgrammingLanguage javascript = createProgrammingLanguage("JavaScript", "ES2023",
                    "Dynamic programming language essential for web development", true);
            ProgrammingLanguage csharp = createProgrammingLanguage("C#", "11.0",
                    "Modern object-oriented language developed by Microsoft", true);
            ProgrammingLanguage cpp = createProgrammingLanguage("C++", "20",
                    "General-purpose programming language with low-level control", true);
            ProgrammingLanguage go = createProgrammingLanguage("Go", "1.21",
                    "Fast, statically typed language designed for modern software development", false);

            programmingLanguageRepository.saveAll(Arrays.asList(java, python, javascript, csharp, cpp, go));
            log.info("Initialized 6 programming languages");
        } else {
            log.info("Programming languages already exist, skipping initialization");
        }
    }

    private ProgrammingLanguage createProgrammingLanguage(String name, String version, String description,
            boolean isSupported) {
        ProgrammingLanguage language = new ProgrammingLanguage(name, version, description, isSupported);
        return language;
    }
}
