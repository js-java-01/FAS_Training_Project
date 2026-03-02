package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.repository.*;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionCrudRepository;
import com.example.starter_project_2025.system.auth.repository.RoleCrudRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.menu.entity.Menu;
import com.example.starter_project_2025.system.menu.entity.MenuItem;
import com.example.starter_project_2025.system.menu.repository.MenuItemRepository;
import com.example.starter_project_2025.system.menu.repository.MenuRepository;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner
{

    private final RoleCrudRepository roleRepository;
    private final PermissionCrudRepository permissionRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final ProvinceRepository provinceRepository;
    private final CommuneRepository communeRepository;
    private final ObjectMapper objectMapper;
    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleRepository moduleRepository;
    private final ProgrammingLanguageRepository programmingLanguageRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseRepository courseRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuestionCategoryRepository questionCategoryRepository;
    private final QuestionRepository questionRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final UserRoleRepository userRoleRepository;
    private final QuestionTagRepository tagRepository;

    @Override
    @Transactional
    public void run(String... args)
    {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0)
        {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeMenus();
//            initializeLocationData();
            initializeModuleGroups();
            initializeAssessmentType();
            initializeAssessments();
            initializeQuestionCategories();
            initializeQuestions();
            linkQuestionsToAssessments();
            initializeUserRoles();
            initializeTags();

            log.info("Database initialization completed successfully!");
        } else
        {
            log.info("Database already initialized, checking for missing permissions...");
            // Check if programming language permissions exist, if not, add them
            ensureProgrammingLanguagePermissions();
            initializeProgrammingLanguages();
            initializeCourses();

        }
        if (userRoleRepository.count() == 0)
        {
            initializeUserRoles();
        }
    }


    private void initializePermissions()
    {
        List<Permission> permissions = Arrays.asList(
                createPermission("MENU_CREATE", "Create new menus", "MENU", "CREATE"),
                createPermission("MENU_READ", "View menus", "MENU", "READ"),
                createPermission("MENU_UPDATE", "Update existing menus", "MENU", "UPDATE"),
                createPermission("MENU_DELETE", "Delete menus", "MENU", "DELETE"),
                createPermission("MENU_ITEM_CREATE", "Create new menu items", "MENU_ITEM", "CREATE"),
                createPermission("MENU_ITEM_READ", "View menu items", "MENU_ITEM", "READ"),
                createPermission("MENU_ITEM_UPDATE", "Update existing menu items", "MENU_ITEM",
                        "UPDATE"),
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
                createPermission("LOCATION_CREATE", "Create new locations", "LOCATION", "CREATE"),
                createPermission("LOCATION_READ", "View locations", "LOCATION", "READ"),
                createPermission("LOCATION_UPDATE", "Update existing locations", "LOCATION", "UPDATE"),
                createPermission("LOCATION_DELETE", "Delete locations", "LOCATION", "DELETE"),
                createPermission("LOCATION_IMPORT", "Import locations", "LOCATION", "IMPORT"),
                createPermission("LOCATION_EXPORT", "Export locations", "LOCATION", "EXPORT"),
                createPermission("COURSE_CREATE", "Create new courses", "COURSE", "CREATE"),
                createPermission("COURSE_READ", "View courses", "COURSE", "READ"),
                createPermission("COURSE_UPDATE", "Update existing courses", "COURSE", "UPDATE"),
                createPermission("COURSE_DELETE", "Delete courses", "COURSE", "DELETE"),
                createPermission("COURSE_IMPORT", "Import courses", "COURSE", "IMPORT"),
                createPermission("COURSE_EXPORT", "Export courses", "COURSE", "EXPORT"),
                createPermission("COHORT_CREATE", "Create new cohorts", "COHORT", "CREATE"),
                createPermission("COHORT_READ", "View cohorts", "COHORT", "READ"),
                createPermission("COHORT_UPDATE", "Update existing cohorts", "COHORT", "UPDATE"),
                createPermission("COHORT_DELETE", "Delete cohorts", "COHORT", "DELETE"),
                createPermission("ENROLL_COURSE", "Enroll into a course cohort", "ENROLLMENT",
                        "CREATE"),
                createPermission("ASSESSMENTTYPE_READ", "View assessment types", "ASSESSMENT_TYPE",
                        "READ"),
                createPermission("ASSESSMENTTYPE_UPDATE", "Update existing assessment types",
                        "ASSESSMENT_TYPE",
                        "UPDATE"),
                createPermission("ASSESSMENTTYPE_DELETE", "Delete assessment types", "ASSESSMENT_TYPE",
                        "DELETE"),
                createPermission("ASSESSMENTTYPE_CREATE", "Assign assessment types", "ASSESSMENT_TYPE",
                        "ASSIGN"),
                createPermission("STUDENT_CREATE", "Create new students", "STUDENT", "CREATE"),
                createPermission("STUDENT_READ", "View students", "STUDENT", "READ"),
                createPermission("STUDENT_UPDATE", "Update existing students", "STUDENT", "UPDATE"),
                createPermission("STUDENT_DELETE", "Delete students", "STUDENT", "DELETE"),
                createPermission("STUDENT_ASSIGN", "Assign students", "STUDENT", "ASSIGN"),
                createPermission("PROGRAMMING_LANGUAGE_CREATE", "Create new programming languages",
                        "PROGRAMMING_LANGUAGE", "CREATE"),
                createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages",
                        "PROGRAMMING_LANGUAGE",
                        "READ"),
                createPermission("PROGRAMMING_LANGUAGE_UPDATE", "Update existing programming languages",
                        "PROGRAMMING_LANGUAGE", "UPDATE"),
                createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages",
                        "PROGRAMMING_LANGUAGE",
                        "DELETE"),
                createPermission("ASSESSMENT_CREATE", "Create new assessments", "ASSESSMENT", "CREATE"),
                createPermission("ASSESSMENT_READ", "View assessments", "ASSESSMENT", "READ"),
                createPermission("ASSESSMENT_UPDATE", "Update existing assessments", "ASSESSMENT",
                        "UPDATE"),
                createPermission("ASSESSMENT_DELETE", "Delete assessments", "ASSESSMENT", "DELETE"),
                createPermission("ASSESSMENT_ASSIGN", "Assign assessments to students or classes",
                        "ASSESSMENT",
                        "ASSIGN"),
                createPermission("ASSESSMENT_PUBLISH", "Publish or unpublish assessments", "ASSESSMENT",
                        "PUBLISH"),
                createPermission("ASSESSMENT_SUBMIT", "Submit assessment attempts", "ASSESSMENT",
                        "SUBMIT"),
                createPermission("QUESTION_CREATE", "Create new questions", "QUESTION", "CREATE"),
                createPermission("QUESTION_READ", "View questions", "QUESTION", "READ"),
                createPermission("QUESTION_UPDATE", "Update questions", "QUESTION", "UPDATE"),
                createPermission("QUESTION_DELETE", "Delete questions", "QUESTION", "DELETE"),
                createPermission("QUESTION_CATEGORY_CREATE", "Create question categories",
                        "QUESTION_CATEGORY",
                        "CREATE"),
                createPermission("QUESTION_CATEGORY_READ", "View question categories",
                        "QUESTION_CATEGORY", "READ"),
                createPermission("QUESTION_CATEGORY_UPDATE", "Update question categories",
                        "QUESTION_CATEGORY",
                        "UPDATE"),
                createPermission("QUESTION_CATEGORY_DELETE", "Delete question categories",
                        "QUESTION_CATEGORY",
                        "DELETE")

        );
        permissionRepository.saveAll(permissions);
        log.info("Initialized {} permissions", permissions.size());
    }

    private Permission createPermission(String name, String description, String resource, String action)
    {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDescription(description);
        permission.setResource(resource);
        permission.setAction(action);
        return permission;
    }

    private void initializeRoles()
    {
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole.setDescription("Administrator with full system access");
        // adminRole.setHierarchyLevel(1);
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);

        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        studentRole.setDescription("Student with limited access to educational resources");
        List<Permission> studentPermissions = new java.util.ArrayList<>(
                permissionRepository.findByAction("READ"));
        permissionRepository.findByName("ENROLL_COURSE").ifPresent(studentPermissions::add);
        studentRole.setPermissions(new HashSet<>(studentPermissions));
        roleRepository.save(studentRole);

        log.info("Initialized 2 roles: ADMIN, STUDENT");
    }

    private void initializeUsers()
    {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        // admin.setRole(adminRole);
        admin.setIsActive(true);
        userRepository.save(admin);

        User student1 = new User();
        student1.setEmail("student@example.com");
        student1.setPasswordHash(passwordEncoder.encode("password123"));
        student1.setFirstName("John");
        student1.setLastName("Doe");
        // student1.setRole(studentRole);
        student1.setIsActive(true);
        userRepository.save(student1);

        User student2 = new User();
        student2.setEmail("jane.smith@example.com");
        student2.setPasswordHash(passwordEncoder.encode("password123"));
        student2.setFirstName("Jane");
        student2.setLastName("Smith");
        // student2.setRole(studentRole);
        student2.setIsActive(true);
        userRepository.save(student2);

        log.info("Initialized 3 users (admin@example.com, student@example.com, jane.smith@example.com)");
    }

    private void initializeUserRoles()
    {
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));

        User adminUser = userRepository.findByEmail("admin@example.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        User student1 = userRepository.findByEmail("student@example.com")
                .orElseThrow(() -> new RuntimeException("Student 1 not found"));
        User student2 = userRepository.findByEmail("jane.smith@example.com")
                .orElseThrow(() -> new RuntimeException("Student 2 not found"));

        UserRole adminUserRole = new UserRole();
        adminUserRole.setUser(adminUser);
        adminUserRole.setRole(adminRole);
        adminUserRole.setDefault(true);
        userRoleRepository.save(adminUserRole);

        UserRole adminUserRole02 = new UserRole();
        adminUserRole02.setUser(adminUser);
        adminUserRole02.setRole(studentRole);
        adminUserRole02.setDefault(false);
        userRoleRepository.save(adminUserRole02);

        UserRole student1Role = new UserRole();
        student1Role.setUser(student1);
        student1Role.setRole(studentRole);
        student1Role.setDefault(true);
        userRoleRepository.save(student1Role);

        UserRole student2Role = new UserRole();
        student2Role.setUser(student2);
        student2Role.setRole(studentRole);
        student2Role.setDefault(true);
        userRoleRepository.save(student2Role);

        log.info("Successfully assigned roles to users in UserRole table.");
    }

    private void initializeMenus()
    {
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

        MenuItem userManagement = createMenuItem(adminMenu, null, "User Management", "/users", "people", 1,
                "USER_READ");
        MenuItem locationManagement = createMenuItem(adminMenu, null, "Location Management", "/locations",
                "location",
                3, "LOCATION_READ");
        MenuItem roleManagement = createMenuItem(adminMenu, null, "Role Management", "/roles", "security", 2,
                "ROLE_READ");
        MenuItem courseManagement = createMenuItem(adminMenu, null, "Course Management", "/courses", "security",
                4,
                "COURSE_READ");

        menuItemRepository.saveAll(
                Arrays.asList(userManagement, roleManagement, locationManagement, courseManagement));

        log.info("Initialized 2 menus with menu items");
    }

    private MenuItem createMenuItem(Menu menu, MenuItem parent, String title, String url, String icon, int order,
                                    String permission)
    {
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

//    private void initializeLocationData()
//    {
//        if (provinceRepository.count() > 0 || communeRepository.count() > 0)
//        {
//            log.info("Location data already initialized, skipping location data import.");
//            return;
//        }
//
//        try (InputStream inputStream = new ClassPathResource("LocationData.json").getInputStream())
//        {
//            LocationDataJson locationData = objectMapper.readValue(inputStream, LocationDataJson.class);
//
//            List<Province> provinces = locationData.province().stream()
//                    .map(p -> new Province(p.idProvince(), p.name()))
//                    .toList();
//            provinceRepository.saveAll(provinces);
//
//            Map<String, Province> provinceById = provinces.stream()
//                    .collect(Collectors.toMap(Province::getId, Function.identity()));
//
//            List<Commune> communes = locationData.commune().stream()
//                    .map(c -> new Commune(c.idCommune(), c.name(),
//                            provinceById.get(c.idProvince())))
//                    .toList();
//            communeRepository.saveAll(communes);
//
//            log.info("Initialized {} provinces and {} communes", provinces.size(), communes.size());
//        } catch (IOException e)
//        {
//            log.error("Failed to import location data from LocationData.json", e);
//        }
    //}

    private void initializeAssessments()
    {

        if (assessmentRepository.count() > 0)
        {
            return;
        }

        AssessmentType entranceType = assessmentTypeRepository
                .findByName("Entrance Quiz")
                .orElseThrow(() -> new RuntimeException("AssessmentType 'Entrance Quiz' not found"));

        AssessmentType midtermType = assessmentTypeRepository
                .findByName("Midterm Test")
                .orElseThrow(() -> new RuntimeException("AssessmentType 'Midterm Test' not found"));

        AssessmentType finalType = assessmentTypeRepository
                .findByName("Final Exam")
                .orElseThrow(() -> new RuntimeException("AssessmentType 'Final Exam' not found"));

        Assessment entranceAssessment = new Assessment();
        entranceAssessment.setAssessmentType(entranceType);
        entranceAssessment.setCode("JAVA_ENTRANCE_2025");
        entranceAssessment.setTitle("Java Entrance Quiz 2025");
        entranceAssessment.setDescription("Entrance assessment for Java trainees");
        entranceAssessment.setTotalScore(100);
        entranceAssessment.setPassScore(60);
        entranceAssessment.setTimeLimitMinutes(60);
        entranceAssessment.setAttemptLimit(1);
        entranceAssessment.setIsShuffleQuestion(true);
        entranceAssessment.setIsShuffleOption(true);
        entranceAssessment.setStatus(AssessmentStatus.ACTIVE);

        Assessment midtermAssessment = new Assessment();
        midtermAssessment.setAssessmentType(midtermType);
        midtermAssessment.setCode("JAVA_MIDTERM_2025");
        midtermAssessment.setTitle("Java Midterm Test 2025");
        midtermAssessment.setDescription("Midterm evaluation for Java course");
        midtermAssessment.setTotalScore(100);
        midtermAssessment.setPassScore(50);
        midtermAssessment.setTimeLimitMinutes(90);
        midtermAssessment.setAttemptLimit(1);
        midtermAssessment.setIsShuffleQuestion(false);
        midtermAssessment.setIsShuffleOption(false);
        midtermAssessment.setStatus(AssessmentStatus.ACTIVE);

        Assessment finalAssessment = new Assessment();
        finalAssessment.setAssessmentType(finalType);
        finalAssessment.setCode("JAVA_FINAL_2025");
        finalAssessment.setTitle("Java Final Exam 2025");
        finalAssessment.setDescription("Final assessment for Java course");
        finalAssessment.setTotalScore(100);
        finalAssessment.setPassScore(60);
        finalAssessment.setTimeLimitMinutes(120);
        finalAssessment.setAttemptLimit(1);
        finalAssessment.setIsShuffleQuestion(false);
        finalAssessment.setIsShuffleOption(false);
        finalAssessment.setStatus(AssessmentStatus.ACTIVE);

        assessmentRepository.saveAll(
                List.of(entranceAssessment, midtermAssessment, finalAssessment));

        log.info("Initialized {} assessments", 3);
    }

    private void initializeQuestionCategories()
    {

        if (questionCategoryRepository.count() > 0)
        {
            return;
        }

        QuestionCategory javaCore = new QuestionCategory();
        javaCore.setName("Java Core");
        javaCore.setDescription("Core Java knowledge");

        QuestionCategory oop = new QuestionCategory();
        oop.setName("OOP");
        oop.setDescription("Object-oriented programming concepts");

        QuestionCategory sql = new QuestionCategory();
        sql.setName("SQL");
        sql.setDescription("Database and SQL knowledge");

        questionCategoryRepository.saveAll(List.of(javaCore, oop, sql));

        log.info("Initialized {} question categories", 3);
    }

    private void initializeModuleGroups()
    {
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
                createModule(userGroup, "Users", "/users", "users", 1, "USER_READ",
                        "Manage system users"));
        moduleRepository.save(
                createModule(userGroup, "Roles", "/roles", "shield", 2, "ROLE_READ",
                        "Manage roles and permissions"));
        moduleRepository.save(
                createModule(userGroup, "Locations", "/locations", "map-pin", 3, "LOCATION_READ",
                        "Manage office locations"));

        // 3. Nhóm: Role Management (deprecated - kept for backward compatibility)
        ModuleGroups roleGroup = new ModuleGroups();
        roleGroup.setName("Role Management");
        roleGroup.setDescription("Manage roles and role-based access control");
        roleGroup.setDisplayOrder(3);
        roleGroup.setIsActive(false); // Disabled - modules moved to User Management
        roleGroup = moduleGroupsRepository.save(roleGroup);

        // No modules in this group - all moved to User Management

        // 4. Nhóm: System Management
        ModuleGroups systemGroup = new ModuleGroups();
        systemGroup.setName("System Management");
        systemGroup.setDescription("System configuration and administration");
        systemGroup.setDisplayOrder(4);
        systemGroup.setIsActive(true);
        systemGroup = moduleGroupsRepository.save(systemGroup);

        // Nhóm này có 2 module con
        Module moduleGroupsSub = createModule(systemGroup, "Module Groups", "/moduleGroups", "layers", 1,
                "MENU_READ",
                "Manage module groups");
        Module modulesSub = createModule(systemGroup, "Modules", "/modules", "menu", 2, "MENU_READ",
                "Manage system modules");

        moduleRepository.saveAll(Arrays.asList(moduleGroupsSub, modulesSub));

        log.info("Initialized 4 module groups and their respective modules.");

        // 5. Nhóm: Training Management
        ModuleGroups trainingGroup = new ModuleGroups();
        trainingGroup.setName("Training Management");
        trainingGroup.setDescription("Manage training programs and related activities");
        trainingGroup.setDisplayOrder(5);
        trainingGroup.setIsActive(true);
        trainingGroup = moduleGroupsRepository.save(trainingGroup);

        // Nhóm này có 2 module con
        Module courseSub = createModule(trainingGroup, "Courses", "/courses", "book-open", 1, "COURSE_READ",
                "Manage training courses");
        Module courseCatalogSub = createModule(trainingGroup, "Course Catalog", "/my-courses", "graduation-cap",
                2,
                "ENROLL_COURSE", "Browse and enroll in available courses");

        moduleRepository.saveAll(Arrays.asList(courseSub, courseCatalogSub));

        log.info("Initialized 5 module groups and their respective modules.");
        // 5. Nhóm: Assessment Management
        ModuleGroups assessmentGroup = new ModuleGroups();
        assessmentGroup.setName("Assessment Management");
        assessmentGroup.setDescription("Manage assessments, questions, and exam configurations");
        assessmentGroup.setDisplayOrder(3);
        assessmentGroup.setIsActive(true);
        assessmentGroup = moduleGroupsRepository.save(assessmentGroup);

        // Assessment sub-modules
        Module assessmentTypeModule = createModule(
                assessmentGroup,
                "Assessment Types",
                "/assessment-type",
                "file-badge",
                1,
                "ASSESSMENT_READ",
                "Manage assessment types and categories");

        Module teacherAssessmentModule = createModule(
                assessmentGroup,
                "Assessments",
                "/teacher-assessment",
                "clipboard-list",
                2,
                "ASSESSMENT_READ",
                "Create and manage assessments");

        Module questionCategoryModule = createModule(
                assessmentGroup,
                "Question Categories",
                "/question-categories",
                "folder-tree",
                3,
                "QUESTION_CATEGORY_READ",
                "Manage question categories");

        Module questionModule = createModule(
                assessmentGroup,
                "Questions",
                "/questions",
                "help-circle",
                4,
                "QUESTION_READ",
                "Manage question bank");

        Module examModule = createModule(
                assessmentGroup,
                "Take Exam",
                "/exam",
                "pencil",
                5,
                "ASSESSMENT_SUBMIT",
                "Take assessments and view results");

        moduleRepository.saveAll(Arrays.asList(
                assessmentTypeModule,
                teacherAssessmentModule,
                questionCategoryModule,
                questionModule,
                examModule
        ));

        log.info("Initialized Assessment Management group with 5 modules.");
        
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

        log.info("Initialized Student Management group.");
        
        // 7. Programming Language Management
        ModuleGroups programmingLanguageGroup = new ModuleGroups();
        programmingLanguageGroup.setName("Programming Language Management");
        programmingLanguageGroup.setDescription("Manage programming languages and their configurations");
        programmingLanguageGroup.setDisplayOrder(6);
        programmingLanguageGroup.setIsActive(true);
        programmingLanguageGroup = moduleGroupsRepository.save(programmingLanguageGroup);

        moduleRepository.save(
                createModule(
                        programmingLanguageGroup,
                        "Programming Languages",
                        "/programming-languages",
                        "code",
                        1,
                        "PROGRAMMING_LANGUAGE_READ",
                        "Manage programming languages"));

        log.info("Initialized Programming Language Management group.");
    }


    private Module createModule(ModuleGroups group, String title, String url, String icon,
                                int order, String permission, String description)
    {
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

    private void initializeAssessmentType()
    {

        if (assessmentTypeRepository.count() > 0)
        {
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

    private void ensureProgrammingLanguagePermissions()
    {
        boolean hasProgLangPerms = permissionRepository.existsByName("PROGRAMMING_LANGUAGE_READ");

        if (!hasProgLangPerms)
        {
            log.info("Programming language permissions not found, adding them...");

            List<Permission> progLangPermissions = Arrays.asList(
                    createPermission("PROGRAMMING_LANGUAGE_CREATE",
                            "Create new programming languages",
                            "PROGRAMMING_LANGUAGE", "CREATE"),
                    createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages",
                            "PROGRAMMING_LANGUAGE",
                            "READ"),
                    createPermission("PROGRAMMING_LANGUAGE_UPDATE",
                            "Update existing programming languages",
                            "PROGRAMMING_LANGUAGE", "UPDATE"),
                    createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages",
                            "PROGRAMMING_LANGUAGE", "DELETE"));

            permissionRepository.saveAll(progLangPermissions);

            // Add these permissions to the ADMIN role
            Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
            if (adminRole != null)
            {
                adminRole.getPermissions().addAll(progLangPermissions);
                roleRepository.save(adminRole);
                log.info("Added programming language permissions to ADMIN role");
            }
        }
    }

    private void initializeQuestions()
    {

        if (questionRepository.count() > 0)
        {
            return;
        }

        QuestionCategory javaCore = questionCategoryRepository
                .findByName("Java Core")
                .orElseThrow(() -> new RuntimeException("Java Core category not found"));

        QuestionCategory oop = questionCategoryRepository
                .findByName("OOP")
                .orElseThrow(() -> new RuntimeException("OOP category not found"));

        QuestionCategory sql = questionCategoryRepository
                .findByName("SQL")
                .orElseThrow(() -> new RuntimeException("SQL category not found"));

        // ===== QUESTION 1 =====
        Question q1 = new Question();
        q1.setContent("Which keyword is used to inherit a class in Java?");
        q1.setQuestionType("SINGLE");
        q1.setCategory(javaCore);
        q1.setOptions(List.of(
            createOption(q1, "extends", true, 1),
            createOption(q1, "implements", false, 2),
            createOption(q1, "inherits", false, 3),
            createOption(q1, "super", false, 4)
        ));

        // ===== QUESTION 2 =====
        Question q2 = new Question();
        q2.setContent("What is the default value of a boolean variable in Java?");
        q2.setQuestionType("SINGLE");
        q2.setCategory(javaCore);
        q2.setOptions(List.of(
            createOption(q2, "true", false, 1),
            createOption(q2, "false", true, 2),
            createOption(q2, "null", false, 3),
            createOption(q2, "0", false, 4)
        ));

        // ===== QUESTION 3 =====
        Question q3 = new Question();
        q3.setContent("Which method must be implemented by all threads in Java?");
        q3.setQuestionType("SINGLE");
        q3.setCategory(javaCore);
        q3.setOptions(List.of(
            createOption(q3, "start()", false, 1),
            createOption(q3, "run()", true, 2),
            createOption(q3, "execute()", false, 3),
            createOption(q3, "begin()", false, 4)
        ));

        // ===== QUESTION 4 =====
        Question q4 = new Question();
        q4.setContent("What are the principles of OOP? (Select all that apply)");
        q4.setQuestionType("MULTIPLE");
        q4.setCategory(oop);
        q4.setOptions(List.of(
            createOption(q4, "Encapsulation", true, 1),
            createOption(q4, "Inheritance", true, 2),
            createOption(q4, "Polymorphism", true, 3),
            createOption(q4, "Compilation", false, 4),
            createOption(q4, "Abstraction", true, 5)
        ));

        // ===== QUESTION 5 =====
        Question q5 = new Question();
        q5.setContent("Which keyword is used to prevent method overriding in Java?");
        q5.setQuestionType("SINGLE");
        q5.setCategory(oop);
        q5.setOptions(List.of(
            createOption(q5, "static", false, 1),
            createOption(q5, "final", true, 2),
            createOption(q5, "abstract", false, 3),
            createOption(q5, "private", false, 4)
        ));

        // ===== QUESTION 6 =====
        Question q6 = new Question();
        q6.setContent("What is the purpose of a constructor in Java?");
        q6.setQuestionType("SINGLE");
        q6.setCategory(oop);
        q6.setOptions(List.of(
            createOption(q6, "To initialize an object", true, 1),
            createOption(q6, "To destroy an object", false, 2),
            createOption(q6, "To copy an object", false, 3),
            createOption(q6, "To compile a class", false, 4)
        ));

        // ===== QUESTION 7 =====
        Question q7 = new Question();
        q7.setContent("Which SQL command is used to retrieve data from a database?");
        q7.setQuestionType("SINGLE");
        q7.setCategory(sql);
        q7.setOptions(List.of(
            createOption(q7, "GET", false, 1),
            createOption(q7, "SELECT", true, 2),
            createOption(q7, "FETCH", false, 3),
            createOption(q7, "RETRIEVE", false, 4)
        ));

        // ===== QUESTION 8 =====
        Question q8 = new Question();
        q8.setContent("Which SQL clause is used to filter records?");
        q8.setQuestionType("SINGLE");
        q8.setCategory(sql);
        q8.setOptions(List.of(
            createOption(q8, "FILTER", false, 1),
            createOption(q8, "WHERE", true, 2),
            createOption(q8, "HAVING", false, 3),
            createOption(q8, "SORT", false, 4)
        ));

        // ===== QUESTION 9 =====
        Question q9 = new Question();
        q9.setContent("What does JVM stand for?");
        q9.setQuestionType("SINGLE");
        q9.setCategory(javaCore);
        q9.setOptions(List.of(
            createOption(q9, "Java Virtual Machine", true, 1),
            createOption(q9, "Java Visual Monitor", false, 2),
            createOption(q9, "Java Verified Method", false, 3),
            createOption(q9, "Java Variable Manager", false, 4)
        ));

        // ===== QUESTION 10 =====
        Question q10 = new Question();
        q10.setContent("Which of the following are access modifiers in Java? (Select all that apply)");
        q10.setQuestionType("MULTIPLE");
        q10.setCategory(javaCore);
        q10.setOptions(List.of(
            createOption(q10, "public", true, 1),
            createOption(q10, "private", true, 2),
            createOption(q10, "protected", true, 3),
            createOption(q10, "default", false, 4),
            createOption(q10, "internal", false, 5)
        ));

        questionRepository.saveAll(List.of(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10));

        log.info("Initialized 10 questions with options");
    }

    private QuestionOption createOption(Question question, String content, boolean isCorrect, int order)
    {
        QuestionOption option = new QuestionOption();
        option.setContent(content);
        option.setCorrect(isCorrect);
        option.setOrderIndex(order);
        option.setQuestion(question);
        return option;
    }

    private void linkQuestionsToAssessments()
    {
        if (assessmentQuestionRepository.count() > 0)
        {
            return;
        }

        List<Assessment> assessments = assessmentRepository.findAll();
        List<Question> questions = questionRepository.findAll();

        if (assessments.isEmpty() || questions.isEmpty())
        {
            log.warn("Cannot link questions to assessments - missing data");
            return;
        }

        Assessment entranceAssessment = assessments.stream()
            .filter(a -> a.getCode().equals("JAVA_ENTRANCE_2025"))
            .findFirst()
            .orElse(null);

        Assessment midtermAssessment = assessments.stream()
            .filter(a -> a.getCode().equals("JAVA_MIDTERM_2025"))
            .findFirst()
            .orElse(null);

        Assessment finalAssessment = assessments.stream()
            .filter(a -> a.getCode().equals("JAVA_FINAL_2025"))
            .findFirst()
            .orElse(null);

        List<AssessmentQuestion> assessmentQuestions = new ArrayList<>();

        // Link first 4 questions to Entrance Assessment (40 points total)
        if (entranceAssessment != null && questions.size() >= 4)
        {
            for (int i = 0; i < 4; i++)
            {
                assessmentQuestions.add(createAssessmentQuestion(entranceAssessment, questions.get(i), 10.0, i + 1));
            }
        }

        // Link questions 3-7 to Midterm Assessment (50 points total)
        if (midtermAssessment != null && questions.size() >= 7)
        {
            for (int i = 2; i < 7; i++)
            {
                assessmentQuestions.add(createAssessmentQuestion(midtermAssessment, questions.get(i), 10.0, i - 1));
            }
        }

        // Link all 10 questions to Final Assessment (100 points total)
        if (finalAssessment != null)
        {
            for (int i = 0; i < questions.size(); i++)
            {
                assessmentQuestions.add(createAssessmentQuestion(finalAssessment, questions.get(i), 10.0, i + 1));
            }
        }

        assessmentQuestionRepository.saveAll(assessmentQuestions);

        log.info("Linked {} questions to {} assessments", questions.size(), assessments.size());
    }

    private AssessmentQuestion createAssessmentQuestion(Assessment assessment, Question question, Double score, int order)
    {
        AssessmentQuestion aq = new AssessmentQuestion();
        aq.setAssessment(assessment);
        aq.setQuestion(question);
        aq.setScore(score);
        aq.setOrderIndex(order);
        return aq;
    }

    private void initializeProgrammingLanguages()
    {
        // Only initialize if no programming languages exist
        if (programmingLanguageRepository.count() == 0)
        {
            ProgrammingLanguage java = createProgrammingLanguage("Java", "17",
                    "Object-oriented programming language widely used for enterprise applications",
                    true);
            ProgrammingLanguage python = createProgrammingLanguage("Python", "3.11",
                    "High-level interpreted language popular for data science and web development",
                    true);
            ProgrammingLanguage javascript = createProgrammingLanguage("JavaScript", "ES2023",
                    "Dynamic programming language essential for web development", true);
            ProgrammingLanguage csharp = createProgrammingLanguage("C#", "11.0",
                    "Modern object-oriented language developed by Microsoft", true);
            ProgrammingLanguage cpp = createProgrammingLanguage("C++", "20",
                    "General-purpose programming language with low-level control", true);
            ProgrammingLanguage go = createProgrammingLanguage("Go", "1.21",
                    "Fast, statically typed language designed for modern software development",
                    false);

            programmingLanguageRepository.saveAll(Arrays.asList(java, python, javascript, csharp, cpp, go));
            log.info("Initialized 6 programming languages");
        } else
        {
            log.info("Programming languages already exist, skipping initialization");
        }
    }

    private ProgrammingLanguage createProgrammingLanguage(String name, String version, String description,
                                                          boolean isSupported)
    {
        ProgrammingLanguage language = new ProgrammingLanguage();
        language.setName(name);
        language.setVersion(version);
        language.setDescription(description);
        language.setSupported(isSupported);
        return language;
    }

    private void initializeCourses()
    {

        if (courseRepository.count() > 0)
        {
            log.info("Courses already exist, skipping initialization");
            return;
        }

        User admin = userRepository.findByEmail("admin@example.com").orElseThrow();

        Course javaCourse = Course.builder()
                .courseName("Java Backend Master")
                .courseCode("JBM-01")
                .topicId(1L)
                .price(BigDecimal.valueOf(15_000_000))
                .discount(10.0)
                .level(CourseLevel.ADVANCED)
                .estimatedTime(90 * 24 * 60) // 3 months ≈ minutes
                .thumbnailUrl("https://example.com/java.jpg")

                .status(CourseStatus.ACTIVE)

                .description("Java Spring Boot from basic to advanced")
                .note("Core backend course")

                .minGpaToPass(5.0)
                .minAttendancePercent(80.0)
                .allowFinalRetake(true)

                .creator(admin)
                // .trainer(admin)

                .build();

        Course reactCourse = Course.builder()
                .courseName("React Frontend Pro")
                .courseCode("RFP-01")
                .topicId(2L)
                .price(BigDecimal.valueOf(12_000_000))
                .discount(5.0)
                .level(CourseLevel.INTERMEDIATE)
                .estimatedTime(60 * 24 * 60) // 2 months
                .thumbnailUrl("https://example.com/react.jpg")

                .status(CourseStatus.ACTIVE)

                .description("React from zero to hero")
                .note("Frontend track")

                .minGpaToPass(5.0)
                .minAttendancePercent(75.0)
                .allowFinalRetake(true)

                .creator(admin)
                // .trainer(admin)

                .build();

        courseRepository.saveAll(List.of(javaCourse, reactCourse));

        log.info("Initialized {} courses", 2);
    }

    private void initializeTags() {

        if (tagRepository.count() > 0) {
            return;
        }

        QuestionTag basic = new QuestionTag();
        basic.setName("BASIC");
        basic.setDescription("Basic level question");

        QuestionTag oop = new QuestionTag();
        oop.setName("OOP");
        oop.setDescription("Object-Oriented Programming");

        QuestionTag spring = new QuestionTag();
        spring.setName("SPRING");
        spring.setDescription("Spring Framework related");

        QuestionTag database = new QuestionTag();
        database.setName("DATABASE");
        database.setDescription("Database and SQL related");

        QuestionTag algorithm = new QuestionTag();
        algorithm.setName("ALGORITHM");
        algorithm.setDescription("Algorithm and problem solving");

        tagRepository.saveAll(
                List.of(basic, oop, spring, database, algorithm)
        );

        log.info("Initialized {} tags", 5);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record LocationDataJson(List<ProvinceJson> province, List<CommuneJson> commune)
    {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProvinceJson(String idProvince, String name)
    {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CommuneJson(String idProvince, String idCommune, String name)
    {
    }

}
