package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.data.entity.Province;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
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
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;

    private final ProvinceRepository provinceRepository;
    private final CommuneRepository communeRepository;
    private final LocationRepository locationRepository;

    private final ObjectMapper objectMapper;

    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleRepository moduleRepository;

    private final ProgrammingLanguageRepository programmingLanguageRepository;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AssessmentTypeRepository assessmentTypeRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuestionCategoryRepository questionCategoryRepository;
    private final QuestionRepository questionRepository;

    private final CourseRepository courseRepository;
    private final UserRoleRepository userRoleRepository;

    private final SemesterRepository semesterRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeMenus();

            initializeLocationData();
            initializeLocations();

            initializeModuleGroups();

            initializeAssessmentType();
            initializeAssessments();

            initializeQuestionCategories();
            initializeQuestions();

            initializeProgrammingLanguages();
            initializeCourses();

            initializeSemester();
            initializeUserRoles();

            log.info("Database initialization completed successfully!");
        } else {
            log.info("Database already initialized, checking for missing permissions...");
            ensureProgrammingLanguagePermissions();
            initializeProgrammingLanguages();
            initializeCourses();

            if (userRoleRepository.count() == 0) {
                initializeUserRoles();
            }
        }
    }

    // ---------------- PERMISSIONS ----------------

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

                createPermission("ENROLL_COURSE", "Enroll into a course cohort", "ENROLLMENT", "CREATE"),

                createPermission("ASSESSMENTTYPE_READ", "View assessment types", "ASSESSMENT_TYPE", "READ"),
                createPermission("ASSESSMENTTYPE_UPDATE", "Update existing assessment types", "ASSESSMENT_TYPE", "UPDATE"),
                createPermission("ASSESSMENTTYPE_DELETE", "Delete assessment types", "ASSESSMENT_TYPE", "DELETE"),
                createPermission("ASSESSMENTTYPE_CREATE", "Assign assessment types", "ASSESSMENT_TYPE", "ASSIGN"),

                createPermission("STUDENT_CREATE", "Create new students", "STUDENT", "CREATE"),
                createPermission("STUDENT_READ", "View students", "STUDENT", "READ"),
                createPermission("STUDENT_UPDATE", "Update existing students", "STUDENT", "UPDATE"),
                createPermission("STUDENT_DELETE", "Delete students", "STUDENT", "DELETE"),
                createPermission("STUDENT_ASSIGN", "Assign students", "STUDENT", "ASSIGN"),

                createPermission("PROGRAMMING_LANGUAGE_CREATE", "Create new programming languages", "PROGRAMMING_LANGUAGE", "CREATE"),
                createPermission("PROGRAMMING_LANGUAGE_READ", "View programming languages", "PROGRAMMING_LANGUAGE", "READ"),
                createPermission("PROGRAMMING_LANGUAGE_UPDATE", "Update existing programming languages", "PROGRAMMING_LANGUAGE", "UPDATE"),
                createPermission("PROGRAMMING_LANGUAGE_DELETE", "Delete programming languages", "PROGRAMMING_LANGUAGE", "DELETE"),

                createPermission("ASSESSMENT_CREATE", "Create new assessments", "ASSESSMENT", "CREATE"),
                createPermission("ASSESSMENT_READ", "View assessments", "ASSESSMENT", "READ"),
                createPermission("ASSESSMENT_UPDATE", "Update existing assessments", "ASSESSMENT", "UPDATE"),
                createPermission("ASSESSMENT_DELETE", "Delete assessments", "ASSESSMENT", "DELETE"),
                createPermission("ASSESSMENT_ASSIGN", "Assign assessments to students or classes", "ASSESSMENT", "ASSIGN"),
                createPermission("ASSESSMENT_PUBLISH", "Publish or unpublish assessments", "ASSESSMENT", "PUBLISH"),
                createPermission("ASSESSMENT_SUBMIT", "Submit assessment attempts", "ASSESSMENT", "SUBMIT"),

                createPermission("QUESTION_CREATE", "Create new questions", "QUESTION", "CREATE"),
                createPermission("QUESTION_READ", "View questions", "QUESTION", "READ"),
                createPermission("QUESTION_UPDATE", "Update questions", "QUESTION", "UPDATE"),
                createPermission("QUESTION_DELETE", "Delete questions", "QUESTION", "DELETE"),

                createPermission("QUESTION_CATEGORY_CREATE", "Create question categories", "QUESTION_CATEGORY", "CREATE"),
                createPermission("QUESTION_CATEGORY_READ", "View question categories", "QUESTION_CATEGORY", "READ"),
                createPermission("QUESTION_CATEGORY_UPDATE", "Update question categories", "QUESTION_CATEGORY", "UPDATE"),
                createPermission("QUESTION_CATEGORY_DELETE", "Delete question categories", "QUESTION_CATEGORY", "DELETE"),

                // CLASS permissions (để dùng cho DEPARTMENT_MANAGER)
                createPermission("CLASS_CREATE", "Create new classes", "CLASS", "CREATE"),
                createPermission("CLASS_READ", "View classes", "CLASS", "READ"),
                createPermission("CLASS_UPDATE", "Update existing classes", "CLASS", "UPDATE"),
                createPermission("CLASS_DELETE", "Delete classes", "CLASS", "DELETE")
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

    // ---------------- ROLES ----------------

    private void initializeRoles() {
        // ADMIN
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole.setDescription("Administrator with full system access");
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);

        // DEPARTMENT_MANAGER (chỉ lấy permission resource = CLASS)
        Role departmentManagerRole = new Role();
        departmentManagerRole.setName("DEPARTMENT_MANAGER");
        departmentManagerRole.setDescription("Department Manager with class management permissions");
        List<Permission> departmentPermissions = permissionRepository.findAll().stream()
                .filter(p -> "CLASS".equals(p.getResource()))
                .toList();
        departmentManagerRole.setPermissions(new HashSet<>(departmentPermissions));
        roleRepository.save(departmentManagerRole);

        // STUDENT
        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        studentRole.setDescription("Student with limited access to educational resources");
        List<Permission> studentPermissions = new ArrayList<>(permissionRepository.findByAction("READ"));
        permissionRepository.findByName("ENROLL_COURSE").ifPresent(studentPermissions::add);
        studentRole.setPermissions(new HashSet<>(studentPermissions));
        roleRepository.save(studentRole);

        log.info("Initialized roles: ADMIN, DEPARTMENT_MANAGER, STUDENT");
    }

    // ---------------- USERS ----------------

    private void initializeUsers() {
        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setIsActive(true);
        userRepository.save(admin);

        User student1 = new User();
        student1.setEmail("student@example.com");
        student1.setPasswordHash(passwordEncoder.encode("password123"));
        student1.setFirstName("John");
        student1.setLastName("Doe");
        student1.setIsActive(true);
        userRepository.save(student1);

        User student2 = new User();
        student2.setEmail("jane.smith@example.com");
        student2.setPasswordHash(passwordEncoder.encode("password123"));
        student2.setFirstName("Jane");
        student2.setLastName("Smith");
        student2.setIsActive(true);
        userRepository.save(student2);

        log.info("Initialized 3 users (admin@example.com, student@example.com, jane.smith@example.com)");
    }

    private void initializeUserRoles() {
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

    // ---------------- MENUS ----------------

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
        MenuItem locationManagement = createMenuItem(adminMenu, null, "Location Management", "/locations", "location", 3, "LOCATION_READ");
        MenuItem courseManagement = createMenuItem(adminMenu, null, "Course Management", "/courses", "security", 4, "COURSE_READ");

        menuItemRepository.saveAll(Arrays.asList(userManagement, roleManagement, locationManagement, courseManagement));

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

    // ---------------- LOCATION DATA ----------------

    private void initializeLocationData() {
        if (provinceRepository.count() > 0 || communeRepository.count() > 0) {
            log.info("Location data already initialized, skipping location data import.");
            return;
        }

        try (InputStream inputStream = new ClassPathResource("LocationData.json").getInputStream()) {
            LocationDataJson locationData = objectMapper.readValue(inputStream, LocationDataJson.class);

            List<Province> provinces = locationData.province().stream()
                    .map(p -> new Province(p.idProvince(), p.name()))
                    .toList();
            provinceRepository.saveAll(provinces);

            Map<String, Province> provinceById = provinces.stream()
                    .collect(Collectors.toMap(Province::getId, Function.identity()));

            List<Commune> communes = locationData.commune().stream()
                    .map(c -> new Commune(c.idCommune(), c.name(), provinceById.get(c.idProvince())))
                    .toList();
            communeRepository.saveAll(communes);

            log.info("Initialized {} provinces and {} communes", provinces.size(), communes.size());
        } catch (IOException e) {
            log.error("Failed to import location data from LocationData.json", e);
        }
    }

    private void initializeLocations() {
        if (locationRepository.count() > 0) {
            log.info("Locations already exist, skipping initialization");
            return;
        }

        Location fptHcm = Location.builder()
                .name("FPT Software - TP. Ho Chi Minh")
                .address("Lo E2a-7, Duong D1, Khu Cong nghe cao, Phuong Tang Nhon Phu")
                .communeId("26842")
                .locationStatus(LocationStatus.ACTIVE)
                .build();

        Location xavaloShtp = Location.builder()
                .name("Xavalo - Khu Cong Nghe Cao Sai Gon")
                .address("Duong So 8, Khu Cong nghe cao, Phuong Linh Xuan, TP. Thu Duc")
                .communeId("26800")
                .locationStatus(LocationStatus.INACTIVE)
                .build();

        Location fptHanoi = Location.builder()
                .name("FPT Software - Ha Noi")
                .address("Toa nha FPT Cau Giay, Phuong Cau Giay, Quan Cau Giay")
                .communeId("00166")
                .locationStatus(LocationStatus.ACTIVE)
                .build();

        Location fptDanang = Location.builder()
                .name("FPT Software - Da Nang")
                .address("Lo D26, Duong So 2, Khu Cong nghe cao Da Nang, Phuong Hoa Khanh")
                .communeId("20200")
                .locationStatus(LocationStatus.ACTIVE)
                .build();

        locationRepository.saveAll(List.of(fptHcm, xavaloShtp, fptHanoi, fptDanang));
        log.info("Initialized {} locations", 4);
    }

    // ---------------- MODULE GROUPS ----------------

    private void initializeModuleGroups() {
        // Main Menu group
        ModuleGroups mainGroup = new ModuleGroups();
        mainGroup.setName("Main Menu");
        mainGroup.setDescription("Main navigation menu of the application");
        mainGroup.setDisplayOrder(1);
        mainGroup.setIsActive(true);
        mainGroup = moduleGroupsRepository.save(mainGroup);

        moduleRepository.save(createModule(mainGroup, "Dashboard", "/dashboard", "home", 1, "MENU_READ", "System dashboard overview"));

        // System group
        ModuleGroups systemGroup = new ModuleGroups();
        systemGroup.setName("System");
        systemGroup.setDescription("System configuration and administration");
        systemGroup.setDisplayOrder(4);
        systemGroup.setIsActive(true);
        systemGroup = moduleGroupsRepository.save(systemGroup);

        moduleRepository.save(createModule(systemGroup, "Modules", "/modules", "menu", 1, "MENU_READ", "Manage system modules"));
        moduleRepository.save(createModule(systemGroup, "Module Groups", "/moduleGroups", "layers", 2, "MENU_READ", "Manage module groups"));
        moduleRepository.save(createModule(systemGroup, "Users", "/users", "users", 3, "USER_READ", "Manage system users"));
        moduleRepository.save(createModule(systemGroup, "Roles", "/roles", "shield", 4, "ROLE_READ", "Manage roles and permissions"));
        moduleRepository.save(createModule(systemGroup, "Locations", "/locations", "map-pin", 5, "LOCATION_READ", "Manage office locations"));

        // Training group
        ModuleGroups trainingGroup = new ModuleGroups();
        trainingGroup.setName("Training");
        trainingGroup.setDescription("Manage training programs and related activities");
        trainingGroup.setDisplayOrder(5);
        trainingGroup.setIsActive(true);
        trainingGroup = moduleGroupsRepository.save(trainingGroup);

        Module courseSub = createModule(trainingGroup, "Courses", "/courses", "book-open", 1, "COURSE_READ", "Manage training courses");
        Module courseCatalogSub = createModule(trainingGroup, "Course Catalog", "/my-courses", "graduation-cap", 2, "ENROLL_COURSE", "Browse and enroll in available courses");
        moduleRepository.saveAll(Arrays.asList(courseSub, courseCatalogSub));

        moduleRepository.save(createModule(trainingGroup, "Programming Languages", "/programming-languages", "code", 3, "PROGRAMMING_LANGUAGE_READ", "Manage programming languages"));
        moduleRepository.save(createModule(trainingGroup, "Student Management", "/v1/student", "person", 4, "STUDENT_READ", "Manage students"));

        // Assessment group
        ModuleGroups assessmentGroup = new ModuleGroups();
        assessmentGroup.setName("Assessment");
        assessmentGroup.setDescription("Manage assessment types and related permissions");
        assessmentGroup.setDisplayOrder(3);
        assessmentGroup.setIsActive(true);
        assessmentGroup = moduleGroupsRepository.save(assessmentGroup);

        moduleRepository.save(createModule(assessmentGroup, "Assessment Type", "/assessment-type", "shield", 1, "ASSESSMENT_READ", "Manage assessment types"));

        // Class Management group
        ModuleGroups classManagementGroup = new ModuleGroups();
        classManagementGroup.setName("Class Management");
        classManagementGroup.setDescription("Manage classes, open class requests.");
        classManagementGroup.setDisplayOrder(7);
        classManagementGroup.setIsActive(true);
        classManagementGroup = moduleGroupsRepository.save(classManagementGroup);

        moduleRepository.save(createModule(classManagementGroup, "Training Classes", "/training-classes", "people", 1, "CLASS_READ", "Manage Classes and Open Class Requests"));

        log.info("Initialized module groups and modules.");
    }

    private Module createModule(ModuleGroups group, String title, String url, String icon,
                                int order, String permission, String description) {
        Module module = new Module();
        module.setModuleGroup(group);
        module.setTitle(title);
        module.setUrl(url);
        module.setIcon(icon);
        module.setDisplayOrder(order);
        module.setRequiredPermission(permission);
        module.setDescription(description);
        module.setIsActive(true);
        return module;
    }

    // ---------------- ASSESSMENT TYPE + ASSESSMENTS ----------------

    private void initializeAssessmentType() {
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
        log.info("Initialized {} assessment types", 3);
    }

    private void initializeAssessments() {
        if (assessmentRepository.count() > 0) {
            return;
        }

        AssessmentType entranceType = assessmentTypeRepository
                .findByName("Entrance Quiz")
                .orElseThrow(() -> new RuntimeException("AssessmentType 'Entrance Quiz' not found"));

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

        assessmentRepository.save(entranceAssessment);
        log.info("Initialized assessments");
    }

    // ---------------- QUESTION CATEGORY + QUESTIONS ----------------

    private void initializeQuestionCategories() {
        if (questionCategoryRepository.count() > 0) {
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

    private void initializeQuestions() {
        if (questionRepository.count() > 0) {
            return;
        }

        QuestionCategory javaCore = questionCategoryRepository
                .findByName("Java Core")
                .orElseThrow(() -> new RuntimeException("Java Core category not found"));

        Question q1 = new Question();
        q1.setContent("Which keyword is used to inherit a class in Java?");
        q1.setQuestionType("SINGLE");
        q1.setCategory(javaCore);

        List<QuestionOption> options = new ArrayList<>();

        QuestionOption o1 = new QuestionOption();
        o1.setContent("extends");
        o1.setCorrect(true);
        o1.setOrderIndex(1);
        o1.setQuestion(q1);
        options.add(o1);

        QuestionOption o2 = new QuestionOption();
        o2.setContent("implements");
        o2.setCorrect(false);
        o2.setOrderIndex(2);
        o2.setQuestion(q1);
        options.add(o2);

        q1.setOptions(options);
        questionRepository.save(q1);

        log.info("Initialized 1 question with options");
    }

    // ---------------- PROGRAMMING LANGUAGES ----------------

    private void ensureProgrammingLanguagePermissions() {
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

            Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
            if (adminRole != null) {
                adminRole.getPermissions().addAll(progLangPermissions);
                roleRepository.save(adminRole);
                log.info("Added programming language permissions to ADMIN role");
            }
        }
    }

    private void initializeProgrammingLanguages() {
        if (programmingLanguageRepository.count() == 0) {
            ProgrammingLanguage java = createProgrammingLanguage("Java", "17", "Object-oriented programming language widely used for enterprise applications", true);
            ProgrammingLanguage python = createProgrammingLanguage("Python", "3.11", "High-level interpreted language popular for data science and web development", true);
            ProgrammingLanguage javascript = createProgrammingLanguage("JavaScript", "ES2023", "Dynamic programming language essential for web development", true);
            ProgrammingLanguage csharp = createProgrammingLanguage("C#", "11.0", "Modern object-oriented language developed by Microsoft", true);
            ProgrammingLanguage cpp = createProgrammingLanguage("C++", "20", "General-purpose programming language with low-level control", true);
            ProgrammingLanguage go = createProgrammingLanguage("Go", "1.21", "Fast, statically typed language designed for modern software development", false);

            programmingLanguageRepository.saveAll(Arrays.asList(java, python, javascript, csharp, cpp, go));
            log.info("Initialized 6 programming languages");
        } else {
            log.info("Programming languages already exist, skipping initialization");
        }
    }

    private ProgrammingLanguage createProgrammingLanguage(String name, String version, String description, boolean isSupported) {
        return new ProgrammingLanguage(name, version, description, isSupported);
    }

    // ---------------- COURSES ----------------

    private void initializeCourses() {
        if (courseRepository.count() > 0) {
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
                .estimatedTime(90 * 24 * 60)
                .thumbnailUrl("https://example.com/java.jpg")
                .creator(admin)
                .description("Java Spring Boot from basic to advanced")
                .note("Core backend course")
                .minGpaToPass(5.0)
                .minAttendancePercent(80.0)
                .allowFinalRetake(true)
                .build();

        Course reactCourse = Course.builder()
                .courseName("React Frontend Pro")
                .courseCode("RFP-01")
                .topicId(2L)
                .price(BigDecimal.valueOf(12_000_000))
                .discount(5.0)
                .level(CourseLevel.INTERMEDIATE)
                .estimatedTime(60 * 24 * 60)
                .thumbnailUrl("https://example.com/react.jpg")
                .status(CourseStatus.ACTIVE)
                .creator(admin)
                .description("React from zero to hero")
                .note("Frontend track")
                .minGpaToPass(5.0)
                .minAttendancePercent(75.0)
                .allowFinalRetake(true)
                .build();

        courseRepository.saveAll(List.of(javaCourse, reactCourse));
        log.info("Initialized {} courses", 2);
    }

    // ---------------- SEMESTER ----------------

    private void initializeSemester() {
        if (semesterRepository.count() > 0) {
            return;
        }

        Semester spring2026 = new Semester();
        spring2026.setName("Spring 2026");
        spring2026.setStartDate(LocalDate.of(2026, 1, 5));
        spring2026.setEndDate(LocalDate.of(2026, 4, 30));
        semesterRepository.save(spring2026);

        log.info("Initialized Semester: Spring 2026");
    }

    // ---------------- JSON RECORDS ----------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record LocationDataJson(List<ProvinceJson> province, List<CommuneJson> commune) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProvinceJson(String idProvince, String name) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CommuneJson(String idProvince, String idCommune, String name) {}
}