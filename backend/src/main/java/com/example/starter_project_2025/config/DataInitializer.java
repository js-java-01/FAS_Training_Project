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
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.data.entity.Province;
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
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner
{

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
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
    private final UserRoleRepository userRoleRepository;
    private final SemesterRepository semesterRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final CourseClassRepository courseClassRepository;

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
            // initializeLocationData();
            initializeModuleGroups();
            initializeAssessmentType();
            initializeAssessments();
            initializeQuestionCategories();
            initializeQuestions();
            initializeUserRoles();
            initializeSemester();
            ensureProgrammingLanguagePermissions();
            initializeProgrammingLanguages();
            initializeCourses();
            initializeTrainingClasses();
            initializeCourseClasses();
            log.info("Database initialization completed successfully!");
        } else
        {
            log.info("Database already initialized, checking for missing permissions...");
            // Check if programming language permissions exist, if not, add them

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
                        "DELETE"),
                createPermission("CLASS_CREATE", "Create new classes", "CLASS", "CREATE"),
                createPermission("CLASS_READ", "View classes", "CLASS", "READ"),
                createPermission("CLASS_UPDATE", "Update existing classes", "CLASS", "UPDATE"),
                createPermission("CLASS_USER_READ", "User can view classes", "CLASS_USER", "READ"),
                createPermission("SEMESTER_CREATE", "Create new semesters", "SEMESTER", "CREATE"),
                createPermission("SEMESTER_READ", "View semesters", "SEMESTER", "READ"),
                createPermission("SEMESTER_UPDATE", "Update semesters", "SEMESTER", "UPDATE"),
                createPermission("SEMESTER_DELETE", "Delete semesters", "SEMESTER", "DELETE")
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
        List<Permission> allPermissions = permissionRepository.findAll();

        createRoleIfNotFound("ADMIN", "Administrator with full system access", new HashSet<>(allPermissions));

        Set<Permission> managerPermissions = allPermissions.stream()
                .filter(p ->
                        "UPDATE".equals(p.getAction()) && Arrays.asList("STUDENT").contains(p.getResource())
                                || "READ".equals(p.getAction()) && Arrays.asList("MENU", "SEMESTER").contains(p.getResource())
                                || "CLASS".equals(p.getResource())
                                || "COURSE".equals(p.getResource())
                                || "SEMESTER".equals(p.getResource()))
                .collect(Collectors.toSet());
        createRoleIfNotFound("MANAGER", "Manager with class and course management permissions", managerPermissions);

        Set<Permission> trainerPermissions = allPermissions.stream()
                .filter(p -> "READ".equals(p.getAction()) && Arrays.asList("MENU", "CLASS", "COURSE", "SEMESTER", "STUDENT").contains(p.getResource())
                        || "GRADE".equals(p.getAction()))
                .collect(Collectors.toSet());
        createRoleIfNotFound("TRAINER", "Trainer/Teacher with access to assigned classes", trainerPermissions);

        Set<Permission> studentPermissions = allPermissions.stream()
                .filter(p -> "READ".equals(p.getAction()))
                .collect(Collectors.toSet());
        permissionRepository.findByName("ENROLL_COURSE").ifPresent(studentPermissions::add);
        createRoleIfNotFound("STUDENT", "Student with limited access to educational resources", studentPermissions);

        log.info("Initialized 4 roles: ADMIN, MANAGER, TRAINER, STUDENT");
    }

    private void createRoleIfNotFound(String roleName, String description, Set<Permission> permissions)
    {
        if (roleRepository.findByName(roleName).isEmpty())
        {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(description);
            role.setPermissions(permissions);

            roleRepository.save(role);
            log.info("Created role: {}", roleName);
        }
    }

    private void initializeUsers()
    {
        // ADMIN (2)
        createUserIfNotFound("admin@example.com", "Admin", "User");
        createUserIfNotFound("super.admin@example.com", "Super", "Admin");

        // MANAGER (2)
        createUserIfNotFound("manager1@example.com", "Alice", "Manager");
        createUserIfNotFound("manager2@example.com", "David", "Manager");

        // TRAINER (3)
        createUserIfNotFound("trainer1@example.com", "Bob", "Teacher");
        createUserIfNotFound("trainer2@example.com", "Michael", "Trainer");
        createUserIfNotFound("trainer3@example.com", "Sarah", "Instructor");

        // STUDENT (5)
        createUserIfNotFound("student1@example.com", "John", "Doe");
        createUserIfNotFound("student2@example.com", "Jane", "Smith");
        createUserIfNotFound("student3@example.com", "Peter", "Parker");
        createUserIfNotFound("student4@example.com", "Tony", "Stark");
        createUserIfNotFound("student5@example.com", "Bruce", "Wayne");

        log.info("Initialized 12 users successfully across ADMIN, MANAGER, TRAINER, and STUDENT roles.");
    }

    private void createUserIfNotFound(String email, String firstName, String lastName)
    {
        if (!userRepository.existsByEmail(email))
        {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setIsActive(true);
            userRepository.save(user);
        }
    }

    private void initializeUserRoles()
    {
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
        Role managerRole = roleRepository.findByName("MANAGER")
                .orElseThrow(() -> new RuntimeException("Role MANAGER not found"));
        Role trainerRole = roleRepository.findByName("TRAINER")
                .orElseThrow(() -> new RuntimeException("Role TRAINER not found"));
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));

        User admin1 = userRepository.findByEmail("admin@example.com").orElseThrow();
        User admin2 = userRepository.findByEmail("super.admin@example.com").orElseThrow();

        User manager1 = userRepository.findByEmail("manager1@example.com").orElseThrow();
        User manager2 = userRepository.findByEmail("manager2@example.com").orElseThrow();

        User trainer1 = userRepository.findByEmail("trainer1@example.com").orElseThrow();
        User trainer2 = userRepository.findByEmail("trainer2@example.com").orElseThrow();
        User trainer3 = userRepository.findByEmail("trainer3@example.com").orElseThrow();

        User student1 = userRepository.findByEmail("student1@example.com").orElseThrow();
        User student2 = userRepository.findByEmail("student2@example.com").orElseThrow();
        User student3 = userRepository.findByEmail("student3@example.com").orElseThrow();
        User student4 = userRepository.findByEmail("student4@example.com").orElseThrow();
        User student5 = userRepository.findByEmail("student5@example.com").orElseThrow();


        assignRoleIfNotFound(admin1, adminRole, true);
        assignRoleIfNotFound(admin1, studentRole, false);

        assignRoleIfNotFound(admin2, adminRole, true);

        assignRoleIfNotFound(manager1, managerRole, true);
        assignRoleIfNotFound(manager1, trainerRole, false);

        assignRoleIfNotFound(manager2, managerRole, true);

        assignRoleIfNotFound(trainer1, trainerRole, true);
        assignRoleIfNotFound(trainer1, studentRole, false);
        assignRoleIfNotFound(trainer2, trainerRole, true);
        assignRoleIfNotFound(trainer3, trainerRole, true);

        assignRoleIfNotFound(student1, studentRole, true);
        assignRoleIfNotFound(student2, studentRole, true);
        assignRoleIfNotFound(student3, studentRole, true);
        assignRoleIfNotFound(student4, studentRole, true);
        assignRoleIfNotFound(student5, studentRole, true);

        log.info("Successfully assigned roles to all 12 users in UserRole table.");
    }

    private void assignRoleIfNotFound(User user, Role role, boolean isDefault)
    {
        if (userRoleRepository.findByUserAndRole(user, role).isEmpty())
        {
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRole.setDefault(isDefault);
            userRoleRepository.save(userRole);
        }
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

    // private void initializeLocationData()
    // {
    // if (provinceRepository.count() > 0 || communeRepository.count() > 0)
    // {
    // log.info("Location data already initialized, skipping location data
    // import.");
    // return;
    // }
    //
    // try (InputStream inputStream = new
    // ClassPathResource("LocationData.json").getInputStream())
    // {
    // LocationDataJson locationData = objectMapper.readValue(inputStream,
    // LocationDataJson.class);
    //
    // List<Province> provinces = locationData.province().stream()
    // .map(p -> new Province(p.idProvince(), p.name()))
    // .toList();
    // provinceRepository.saveAll(provinces);
    //
    // Map<String, Province> provinceById = provinces.stream()
    // .collect(Collectors.toMap(Province::getId, Function.identity()));
    //
    // List<Commune> communes = locationData.commune().stream()
    // .map(c -> new Commune(c.idCommune(), c.name(),
    // provinceById.get(c.idProvince())))
    // .toList();
    // communeRepository.saveAll(communes);
    //
    // log.info("Initialized {} provinces and {} communes", provinces.size(),
    // communes.size());
    // } catch (IOException e)
    // {
    // log.error("Failed to import location data from LocationData.json", e);
    // }
    // }

    private void initializeLocationData()
    {
        if (provinceRepository.count() > 0 || communeRepository.count() > 0)
        {
            log.info("Location data already initialized, skipping location data import.");
            return;
        }

        try (InputStream inputStream = new ClassPathResource("LocationData.json").getInputStream())
        {
            LocationDataJson locationData = objectMapper.readValue(inputStream, LocationDataJson.class);

            List<Province> provinces = locationData.province().stream()
                    .map(p -> new Province(p.idProvince(), p.name()))
                    .toList();
            provinceRepository.saveAll(provinces);

            Map<String, Province> provinceById = provinces.stream()
                    .collect(Collectors.toMap(Province::getId, Function.identity()));

            List<Commune> communes = locationData.commune().stream()
                    .map(c -> new Commune(c.idCommune(), c.name(),
                            provinceById.get(c.idProvince())))
                    .toList();
            communeRepository.saveAll(communes);

            log.info("Initialized {} provinces and {} communes", provinces.size(), communes.size());
        } catch (IOException e)
        {
            log.error("Failed to import location data from LocationData.json", e);
        }
    }

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
    }

    private void initializeModuleGroups()
    {
        // Nhóm: Main Menu
        ModuleGroups mainGroup = new ModuleGroups();
        mainGroup.setName("Main Menu");
        mainGroup.setDescription("Main navigation menu of the application");
        mainGroup.setDisplayOrder(1);
        mainGroup.setIsActive(true);
        mainGroup = moduleGroupsRepository.save(mainGroup); // Lưu để lấy ID tự sinh

        moduleRepository.save(createModule(mainGroup, "Dashboard", "/dashboard", "home", 1, "MENU_READ",
                "System dashboard overview"));

        // Nhóm: System
        ModuleGroups systemGroup = new ModuleGroups();
        systemGroup.setName("System");
        systemGroup.setDescription("System configuration and administration");
        systemGroup.setDisplayOrder(4);
        systemGroup.setIsActive(true);
        systemGroup = moduleGroupsRepository.save(systemGroup);

        moduleRepository.save(
                createModule(systemGroup, "Modules", "/modules", "menu", 1, "MENU_READ",
                        "Manage system modules"));
        moduleRepository.save(
                createModule(systemGroup, "Module Groups", "/moduleGroups", "layers", 2,
                        "MENU_READ",
                        "Manage module groups"));
        moduleRepository.save(
                createModule(systemGroup, "Users", "/users", "users", 3, "USER_READ",
                        "Manage system users"));
        moduleRepository.save(
                createModule(systemGroup, "Roles", "/roles", "shield", 4, "ROLE_READ",
                        "Manage roles and permissions"));
        moduleRepository.save(
                createModule(systemGroup, "Locations", "/locations", "map-pin", 5, "LOCATION_READ",
                        "Manage office locations"));

        // moduleRepository.saveAll(Arrays.asList(moduleGroupsSub, modulesSub));

        log.info("Initialized 4 module groups and their respective modules.");

        // Nhóm: Training
        ModuleGroups trainingGroup = new ModuleGroups();
        trainingGroup.setName("Training");
        trainingGroup.setDescription("Manage training programs and related activities");
        trainingGroup.setDisplayOrder(5);
        trainingGroup.setIsActive(true);
        trainingGroup = moduleGroupsRepository.save(trainingGroup);

        Module courseSub = createModule(trainingGroup, "Courses", "/courses", "book-open", 1, "COURSE_READ",
                "Manage training courses");
        Module courseCatalogSub = createModule(trainingGroup, "Course Catalog", "/my-courses", "graduation-cap",
                2,
                "ENROLL_COURSE", "Browse and enroll in available courses");

        moduleRepository.saveAll(Arrays.asList(courseSub, courseCatalogSub));
        moduleRepository.save(
                createModule(
                        trainingGroup,
                        "Programming Languages",
                        "/programming-languages",
                        "code",
                        1,
                        "PROGRAMMING_LANGUAGE_READ",
                        "Manage programming languages"));
        moduleRepository.save(
                createModule(
                        trainingGroup,
                        "Student Management",
                        "/v1/student",
                        "person",
                        1,
                        "STUDENT_READ",
                        "Manage students"));

        moduleRepository.save(
                createModule(
                        trainingGroup,
                        "Traning Classes",
                        "/training-classes",
                        "people",
                        1,
                        "CLASS_READ",
                        "Manage Classes and Open Class Requests"));

        moduleRepository.save(
                createModule(
                        trainingGroup,
                        "Classes",
                        "/classes",
                        "people",
                        1,
                        "CLASS_USER_READ",
                        "User search and view classes"));

        moduleRepository.save(
                createModule(
                        trainingGroup,
                        "Semesters",
                        "/semesters",
                        "calendar",
                        1,
                        "SEMESTER_READ",
                        "Manage academic semesters"));

        // Nhóm: Assessment
        ModuleGroups assessmentTypeGroup = new ModuleGroups();
        assessmentTypeGroup.setName("Assessment");
        assessmentTypeGroup.setDescription("Manage assessment types and related permissions");
        assessmentTypeGroup.setDisplayOrder(3);
        assessmentTypeGroup.setIsActive(true);
        assessmentTypeGroup = moduleGroupsRepository.save(assessmentTypeGroup);

        moduleRepository.save(
                createModule(
                        assessmentTypeGroup,
                        "Assessment Type",
                        "/assessment-type",
                        "shield",
                        2,
                        "ASSESSMENT_READ",
                        "Manage assessment types"));
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

        // ===== QUESTION =====
        Question q1 = new Question();
        q1.setContent("Which keyword is used to inherit a class in Java?");
        q1.setQuestionType("SINGLE");
        q1.setCategory(javaCore);

        // ===== OPTIONS =====
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

        questionRepository.save(q1); // 🔥 cascade save options

        log.info("Initialized 1 question with options");
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
        ProgrammingLanguage language = new ProgrammingLanguage(name, version, description, isSupported);
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

        List<Course> courses = List.of(
                Course.builder().courseName("Java Backend Master").courseCode("JBM-01").topicId(1L)
                        .price(BigDecimal.valueOf(15_000_000)).discount(10.0).level(CourseLevel.ADVANCED)
                        .estimatedTime(90 * 24 * 60).thumbnailUrl("https://example.com/java.jpg")
                        .status(CourseStatus.ACTIVE).description("Java Spring Boot from basic to advanced")
                        .note("Core backend course").minGpaToPass(5.0).minAttendancePercent(80.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("React Frontend Pro").courseCode("RFP-01").topicId(2L)
                        .price(BigDecimal.valueOf(12_000_000)).discount(5.0).level(CourseLevel.INTERMEDIATE)
                        .estimatedTime(60 * 24 * 60).thumbnailUrl("https://example.com/react.jpg")
                        .status(CourseStatus.ACTIVE).description("React from zero to hero")
                        .note("Frontend track").minGpaToPass(5.0).minAttendancePercent(75.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("Python for Data Science").courseCode("PDS-01").topicId(3L)
                        .price(BigDecimal.valueOf(18_000_000)).discount(15.0).level(CourseLevel.INTERMEDIATE)
                        .estimatedTime(120 * 24 * 60).thumbnailUrl("https://example.com/python.jpg")
                        .status(CourseStatus.ACTIVE).description("Data Analysis, Pandas, NumPy, Machine Learning")
                        .note("Data path").minGpaToPass(6.0).minAttendancePercent(80.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("AWS Cloud Practitioner").courseCode("AWS-01").topicId(4L)
                        .price(BigDecimal.valueOf(8_000_000)).discount(0.0).level(CourseLevel.BEGINNER)
                        .estimatedTime(30 * 24 * 60).thumbnailUrl("https://example.com/aws.jpg")
                        .status(CourseStatus.ACTIVE).description("Introduction to Cloud Computing and AWS services")
                        .note("Cloud computing basics").minGpaToPass(7.0).minAttendancePercent(90.0)
                        .allowFinalRetake(false).creator(admin).build(),

                Course.builder().courseName("DevOps with Docker & K8s").courseCode("DVO-01").topicId(5L)
                        .price(BigDecimal.valueOf(20_000_000)).discount(20.0).level(CourseLevel.ADVANCED)
                        .estimatedTime(90 * 24 * 60).thumbnailUrl("https://example.com/devops.jpg")
                        .status(CourseStatus.ACTIVE).description("Containerization, CI/CD, and orchestration")
                        .note("Ops track").minGpaToPass(6.0).minAttendancePercent(80.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("Flutter Mobile Development").courseCode("FLT-01").topicId(6L)
                        .price(BigDecimal.valueOf(14_000_000)).discount(10.0).level(CourseLevel.INTERMEDIATE)
                        .estimatedTime(60 * 24 * 60).thumbnailUrl("https://example.com/flutter.jpg")
                        .status(CourseStatus.ACTIVE).description("Build cross-platform iOS and Android apps")
                        .note("Mobile track").minGpaToPass(5.0).minAttendancePercent(75.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("UI/UX Design Masterclass").courseCode("UIX-01").topicId(7L)
                        .price(BigDecimal.valueOf(10_000_000)).discount(5.0).level(CourseLevel.BEGINNER)
                        .estimatedTime(45 * 24 * 60).thumbnailUrl("https://example.com/uiux.jpg")
                        .status(CourseStatus.ACTIVE).description("Figma, User Research, Prototyping")
                        .note("Design track").minGpaToPass(5.0).minAttendancePercent(80.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("Node.js & Express API").courseCode("NOD-01").topicId(8L)
                        .price(BigDecimal.valueOf(11_000_000)).discount(0.0).level(CourseLevel.INTERMEDIATE)
                        .estimatedTime(60 * 24 * 60).thumbnailUrl("https://example.com/node.jpg")
                        .status(CourseStatus.ACTIVE).description("Build fast and scalable RESTful APIs")
                        .note("JS Backend").minGpaToPass(5.0).minAttendancePercent(80.0)
                        .allowFinalRetake(true).creator(admin).build(),

                Course.builder().courseName("Database SQL Mastery").courseCode("SQL-01").topicId(9L)
                        .price(BigDecimal.valueOf(7_000_000)).discount(10.0).level(CourseLevel.BEGINNER)
                        .estimatedTime(30 * 24 * 60).thumbnailUrl("https://example.com/sql.jpg")
                        .status(CourseStatus.ACTIVE).description("MySQL, PostgreSQL, query optimization")
                        .note("Database foundational").minGpaToPass(6.0).minAttendancePercent(85.0)
                        .allowFinalRetake(false).creator(admin).build(),

                Course.builder().courseName("Cybersecurity Fundamentals").courseCode("CYB-01").topicId(10L)
                        .price(BigDecimal.valueOf(16_000_000)).discount(0.0).level(CourseLevel.ADVANCED)
                        .estimatedTime(90 * 24 * 60).thumbnailUrl("https://example.com/cyber.jpg")
                        .status(CourseStatus.ACTIVE).description("Ethical hacking, network security, penetration testing")
                        .note("Security track").minGpaToPass(7.0).minAttendancePercent(90.0)
                        .allowFinalRetake(true).creator(admin).build()
        );

        courseRepository.saveAll(courses);

        log.info("Initialized 10 courses successfully.");
    }

    private void initializeSemester()
    {
        if (semesterRepository.count() > 0)
        {
            log.info("Semesters already exist, skipping initialization");
            return;
        }

        List<Semester> semesters = List.of(
                // Năm 2024
                buildSemester("Spring 2024", LocalDate.of(2024, 1, 5), LocalDate.of(2024, 4, 30)),
                buildSemester("Summer 2024", LocalDate.of(2024, 5, 5), LocalDate.of(2024, 8, 30)),
                buildSemester("Fall 2024", LocalDate.of(2024, 9, 5), LocalDate.of(2024, 12, 25)),

                // Năm 2025
                buildSemester("Spring 2025", LocalDate.of(2025, 1, 5), LocalDate.of(2025, 4, 30)),
                buildSemester("Summer 2025", LocalDate.of(2025, 5, 5), LocalDate.of(2025, 8, 30)),
                buildSemester("Fall 2025", LocalDate.of(2025, 9, 5), LocalDate.of(2025, 12, 25)),

                // Năm 2026
                buildSemester("Spring 2026", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 4, 30)),
                buildSemester("Summer 2026", LocalDate.of(2026, 5, 5), LocalDate.of(2026, 8, 30)),
                buildSemester("Fall 2026", LocalDate.of(2026, 9, 5), LocalDate.of(2026, 12, 25)),

                // Năm 2027
                buildSemester("Spring 2027", LocalDate.of(2027, 1, 5), LocalDate.of(2027, 4, 30)),
                buildSemester("Summer 2027", LocalDate.of(2027, 5, 5), LocalDate.of(2027, 8, 30)),
                buildSemester("Fall 2027", LocalDate.of(2027, 9, 5), LocalDate.of(2027, 12, 25))
        );

        semesterRepository.saveAll(semesters);
        log.info("Initialized 12 Semesters (from 2024 to 2027).");
    }

    private Semester buildSemester(String name, LocalDate start, LocalDate end)
    {
        Semester s = new Semester();
        s.setName(name);
        s.setStartDate(start);
        s.setEndDate(end);
        return s;
    }

    private void initializeTrainingClasses()
    {
        if (trainingClassRepository.count() > 0)
        {
            log.info("Training classes already exist, skipping initialization");
            return;
        }

        User admin = userRepository.findByEmail("admin@example.com")
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        User manager = userRepository.findByEmail("manager1@example.com")
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Map<String, Semester> semesterMap = semesterRepository.findAll().stream()
                .collect(Collectors.toMap(Semester::getName, s -> s));

        if (semesterMap.isEmpty())
        {
            log.warn("No semesters found! Please run initializeSemester() first.");
            return;
        }

        List<TrainingClass> classes = List.of(
                buildTrainingClass("Kỹ sư phần mềm - Khóa 1", "SE-K1-01", admin, semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 10), LocalDate.of(2025, 12, 20)),
                buildTrainingClass("Hệ thống thông tin - Khóa 1", "IS-K1-01", manager, semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 15), LocalDate.of(2025, 12, 25)),

                buildTrainingClass("Kỹ sư phần mềm - Khóa 2", "SE-K2-01", admin, semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 10), LocalDate.of(2026, 4, 20)),
                buildTrainingClass("Khoa học dữ liệu - Khóa 1", "DS-K1-01", admin, semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 15), LocalDate.of(2026, 4, 25)),

                buildTrainingClass("Trí tuệ nhân tạo - Khóa 1", "AI-K1-01", manager, semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 10), LocalDate.of(2026, 8, 20)),
                buildTrainingClass("An toàn thông tin - Khóa 1", "CS-K1-01", admin, semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 15), LocalDate.of(2026, 8, 25)),

                buildTrainingClass("Kỹ sư phần mềm - Khóa 3", "SE-K3-01", manager, semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 10), LocalDate.of(2026, 12, 20)),
                buildTrainingClass("Thiết kế đồ họa - Khóa 1", "GD-K1-01", admin, semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 15), LocalDate.of(2026, 12, 25))
        );

        List<TrainingClass> validClasses = classes.stream()
                .filter(c -> c.getSemester() != null)
                .toList();

        trainingClassRepository.saveAll(validClasses);
        log.info("Initialized {} Training Classes distributed across multiple Semesters.", validClasses.size());
    }

    private TrainingClass buildTrainingClass(String name, String code, User creator, Semester semester, LocalDate start, LocalDate end)
    {
        TrainingClass tc = new TrainingClass();
        tc.setClassName(name);
        tc.setClassCode(code);
        tc.setIsActive(true);
        tc.setCreator(creator);
        tc.setSemester(semester);
        tc.setStartDate(start);
        tc.setEndDate(end);
        return tc;
    }

    private void initializeCourseClasses()
    {
        if (courseClassRepository.count() > 0)
        {
            log.info("Course classes already exist, skipping initialization");
            return;
        }

        User trainer1 = userRepository.findByEmail("trainer1@example.com")
                .orElseThrow(() -> new RuntimeException("Trainer 1 not found"));
        User trainer2 = userRepository.findByEmail("trainer2@example.com")
                .orElseThrow(() -> new RuntimeException("Trainer 2 not found"));
        User trainer3 = userRepository.findByEmail("trainer3@example.com")
                .orElseThrow(() -> new RuntimeException("Trainer 3 not found"));

        User manager1 = userRepository.findByEmail("manager1@example.com")
                .orElseThrow(() -> new RuntimeException("Manager 1 not found"));

        Map<String, Course> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getCourseCode, c -> c));

        if (courseMap.isEmpty())
        {
            log.warn("No courses found! Please run initializeCourses() first.");
            return;
        }

        List<TrainingClass> trainingClasses = trainingClassRepository.findAll();
        if (trainingClasses.isEmpty())
        {
            log.warn("No TrainingClasses found! Please initialize TrainingClasses before CourseClasses.");
            return;
        }
        int classCount = trainingClasses.size();

        List<CourseClass> courseClasses = List.of(
                buildCourseClass(courseMap.get("JBM-01"), trainingClasses.get(0 % classCount), trainer1),
                buildCourseClass(courseMap.get("RFP-01"), trainingClasses.get(1 % classCount), trainer2),
                buildCourseClass(courseMap.get("PDS-01"), trainingClasses.get(2 % classCount), trainer3),
                buildCourseClass(courseMap.get("AWS-01"), trainingClasses.get(3 % classCount), trainer1),

                buildCourseClass(courseMap.get("DVO-01"), trainingClasses.get(4 % classCount), manager1),
                buildCourseClass(courseMap.get("FLT-01"), trainingClasses.get(5 % classCount), trainer2),
                buildCourseClass(courseMap.get("UIX-01"), trainingClasses.get(6 % classCount), trainer3),

                buildCourseClass(courseMap.get("NOD-01"), trainingClasses.get(7 % classCount), trainer1),
                buildCourseClass(courseMap.get("SQL-01"), trainingClasses.get(8 % classCount), trainer2),
                buildCourseClass(courseMap.get("CYB-01"), trainingClasses.get(9 % classCount), manager1)
        );

        List<CourseClass> validCourseClasses = courseClasses.stream()
                .filter(cc -> cc.getCourse() != null)
                .toList();

        courseClassRepository.saveAll(validCourseClasses);

        log.info("Initialized {} Course Classes with diverse Trainers and Courses.", validCourseClasses.size());
    }

    private CourseClass buildCourseClass(Course course, TrainingClass classInfo, User trainer)
    {
        CourseClass cc = new CourseClass();
        cc.setCourse(course);
        cc.setClassInfo(classInfo);
        cc.setTrainer(trainer);
        return cc;
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