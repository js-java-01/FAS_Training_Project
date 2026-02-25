package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.SubmissionRepository;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        @PersistenceContext
        private EntityManager entityManager;

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
        private final SubmissionRepository submissionRepository;
        private final CourseAssessmentTypeWeightRepository courseAssessmentTypeWeightRepository;
        private final TrainingClassRepository trainingClassRepository;
        private final CourseClassRepository courseClassRepository;
        private final EnrollmentRepository enrollmentRepository;

        @Override
        @Transactional
        public void run(String... args) {
                log.info("Initializing database with sample data...");

                if (roleRepository.count() == 0) {
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
                        
                        log.info("Database initialization completed successfully!");
                } else {
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

        private void initializePermissions() {
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

        private void initializeUsers() {
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
                        String permission) {
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
                                        .map(c -> new Commune(c.idCommune(), c.name(),
                                                        provinceById.get(c.idProvince())))
                                        .toList();
                        communeRepository.saveAll(communes);

                        log.info("Initialized {} provinces and {} communes", provinces.size(), communes.size());
                } catch (IOException e) {
                        log.error("Failed to import location data from LocationData.json", e);
                }
        }

        private void initializeAssessments() {

                if (assessmentRepository.count() > 0) {
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

                log.info("Initialized {} assessments", 3);
        }

        private void ensureProgrammingLanguagePermissions() {
                boolean hasProgLangPerms = permissionRepository.existsByName("PROGRAMMING_LANGUAGE_READ");

                if (!hasProgLangPerms) {
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
                        if (adminRole != null) {
                                adminRole.getPermissions().addAll(progLangPermissions);
                                roleRepository.save(adminRole);
                                log.info("Added programming language permissions to ADMIN role");
                        }
                }
        }

        private void initializeQuestions() {

                if (questionRepository.count() > 0) {
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

        private void initializeProgrammingLanguages() {
                // Only initialize if no programming languages exist
                if (programmingLanguageRepository.count() == 0) {
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
                } else {
                        log.info("Programming languages already exist, skipping initialization");
                }
        }

        private ProgrammingLanguage createProgrammingLanguage(String name, String version, String description,
                        boolean isSupported) {
                ProgrammingLanguage language = new ProgrammingLanguage(name, version, description, isSupported);
                return language;
        }

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
                                .estimatedTime(90 * 24 * 60) // 3 months ≈ minutes
                                .thumbnailUrl("https://example.com/java.jpg")

                                .creator(admin)
                                // .trainer(admin)

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

        /**
         * Initialize Topic Mark sample data with complete test scenario:
         * - 1 student user
         * - 3 assessment types (Quiz, Exam, Lab) with weights
         * - 1 demo course with minGpaToPass = 60.0
         * - 1 training class
         * - 1 course class linking course + training class
         * - 1 enrollment (student enrolled in training class)
         * - 4 assessments with different grading methods
         * - Multiple submissions per assessment to demonstrate HIGHEST, LATEST, AVERAGE
         * 
         * Expected final score calculation:
         * - Quiz type: (90 + 75) / 2 = 82.5, weight 30% → 24.75
         * - Exam type: 70, weight 50% → 35.0
         * - Lab type: 90, weight 20% → 18.0
         * - Final score: 77.75 (PASS)
         */
        private void initializeTopicMarkData() {
                if (userRepository.count() < 3) {
                        log.info("Not enough users, skipping topic mark data initialization");
                        return;
                }

                // Check for corrupted AssessmentType data in database
                try {
                        Object result = entityManager
                                .createNativeQuery("SELECT COUNT(*) FROM assessment_type WHERE LENGTH(name) > 255")
                                .getSingleResult();
                        Long corruptCount = ((Number) result).longValue();
                        
                        if (corruptCount > 0) {
                                log.error("Found {} AssessmentType records with name > 255 characters in database. Please run: DELETE FROM assessment_type WHERE LENGTH(name) > 255;", corruptCount);
                                return;
                        }
                } catch (Exception e) {
                        log.warn("Could not check for corrupt data: {}", e.getMessage());
                }

                log.info("Initializing topic mark sample data...");
                
                // Set flush mode to MANUAL to prevent auto-flush of pending invalid entities
                entityManager.setFlushMode(jakarta.persistence.FlushModeType.COMMIT);
                
                try {
                        // Clear persistence context to detach any pending entities (without validation)
                        entityManager.clear();

                        // 1. Create or get sample student user
                User student = userRepository.findByEmail("student@test.com")
                        .orElseGet(() -> {
                                User u = User.builder()
                                        .email("student@test.com")
                                        .firstName("John")
                                        .lastName("Doe")
                                        .passwordHash(passwordEncoder.encode("password123"))
                                        .isActive(true)
                                        .build();
                                return userRepository.save(u);
                        });
                log.info("✓ Created/found student user: {}", student.getEmail());

                // 2. Create or get assessment types
                AssessmentType quizType = createOrGetAssessmentType("Quiz", "Short quizzes to test understanding");
                AssessmentType examType = createOrGetAssessmentType("Exam", "Comprehensive examinations");
                AssessmentType labType = createOrGetAssessmentType("Lab", "Hands-on practical exercises");
                log.info("✓ Created/found 3 assessment types: Quiz, Exam, Lab");

                // 3. Create demo course
                User admin = userRepository.findByEmail("admin@example.com")
                        .orElseThrow(() -> new RuntimeException("Admin user not found"));

                Course demoCourse = entityManager
                        .createQuery("SELECT c FROM Course c WHERE c.courseCode = :code", Course.class)
                        .setParameter("code", "DEMO-COURSE-TM")
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                Course course = Course.builder()
                                        .courseName("Demo Course for Topic Marks")
                                        .courseCode("DEMO-COURSE-TM")
                                        .topicId(1L)
                                        .price(BigDecimal.valueOf(5_000_000))
                                        .discount(0.0)
                                        .level(CourseLevel.BEGINNER)
                                        .estimatedTime(30 * 24 * 60) // 1 month
                                        .thumbnailUrl("https://example.com/demo-tm.jpg")
                                        .status(CourseStatus.ACTIVE)
                                        .description("Demo course for testing Topic Mark calculations")
                                        .note("Test data")
                                        .minGpaToPass(60.0)
                                        .minAttendancePercent(70.0)
                                        .allowFinalRetake(true)
                                        .creator(admin)
                                        .build();
                                return courseRepository.save(course);
                        });
                log.info("✓ Created/found demo course: {}", demoCourse.getCourseCode());

                // 4. Create course assessment type weights (Quiz 30%, Exam 50%, Lab 20%)
                createWeightIfNotExists(demoCourse, quizType, 0.3);
                createWeightIfNotExists(demoCourse, examType, 0.5);
                createWeightIfNotExists(demoCourse, labType, 0.2);
                log.info("✓ Set assessment type weights: Quiz 30%, Exam 50%, Lab 20%");

                // 5. Create training class (with semester)
                // First, get or create a semester
                Semester semester = entityManager
                        .createQuery("SELECT s FROM Semester s WHERE s.name = :name", Semester.class)
                        .setParameter("name", "Demo Semester 2026")
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                Semester s = new Semester();
                                s.setName("Demo Semester 2026");
                                s.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                                s.setEndDate(Date.valueOf("2026-12-31").toLocalDate());
                                entityManager.persist(s);
                                return s;
                        });

                TrainingClass trainingClass = entityManager
                        .createQuery("SELECT tc FROM TrainingClass tc WHERE tc.classCode = :code", TrainingClass.class)
                        .setParameter("code", "TC-DEMO-01")
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                TrainingClass tc = new TrainingClass();
                                tc.setClassCode("TC-DEMO-01");
                                tc.setClassName("Demo Training Class 01");
                                tc.setCreator(admin);
                                tc.setSemester(semester);
                                tc.setIsActive(true);
                                tc.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                                tc.setEndDate(Date.valueOf("2026-06-30").toLocalDate());
                                entityManager.persist(tc);
                                return tc;
                        });
                log.info("✓ Created/found training class: {}", trainingClass.getClassCode());

                // 6. Create course class (links course + training class)
                CourseClass courseClass = entityManager
                        .createQuery("SELECT cc FROM CourseClass cc WHERE cc.course.id = :courseId AND cc.classInfo.id = :classId", CourseClass.class)
                        .setParameter("courseId", demoCourse.getId())
                        .setParameter("classId", trainingClass.getId())
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                CourseClass cc = new CourseClass();
                                cc.setCourse(demoCourse);
                                cc.setClassInfo(trainingClass);
                                cc.setTrainer(admin);
                                return courseClassRepository.save(cc);
                        });
                log.info("✓ Created/found course class linking course and training class");

                // 7. Create enrollment (student enrolled in training class)
                Enrollment enrollment = entityManager
                        .createQuery("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.trainingClass.id = :classId", Enrollment.class)
                        .setParameter("userId", student.getId())
                        .setParameter("classId", trainingClass.getId())
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                Enrollment e = Enrollment.builder()
                                        .user(student)
                                        .trainingClass(trainingClass)
                                        .status(EnrollmentStatus.ACTIVE)
                                        .enrolledAt(Instant.now())
                                        .build();
                                return enrollmentRepository.save(e);
                        });
                log.info("✓ Created/found enrollment for student in training class");

                // 8. Create assessments and submissions
                // Assessment 1: Quiz 1 with HIGHEST grading (submissions: 80, 85, 90 → best: 90)
                createAssessmentWithSubmissions(
                        courseClass, student, quizType,
                        "Quiz 1", GradingMethod.HIGHEST,
                        List.of(80.0, 85.0, 90.0)
                );

                // Assessment 2: Quiz 2 with HIGHEST grading (submissions: 70, 75 → best: 75)
                createAssessmentWithSubmissions(
                        courseClass, student, quizType,
                        "Quiz 2", GradingMethod.HIGHEST,
                        List.of(70.0, 75.0)
                );

                // Assessment 3: Midterm Exam with LATEST grading (submissions: 65, 70 → latest: 70)
                createAssessmentWithSubmissions(
                        courseClass, student, examType,
                        "Midterm Exam", GradingMethod.LATEST,
                        List.of(65.0, 70.0)
                );

                // Assessment 4: Lab Assignment with AVERAGE grading (submissions: 85, 90, 95 → avg: 90)
                createAssessmentWithSubmissions(
                        courseClass, student, labType,
                        "Lab Assignment", GradingMethod.AVERAGE,
                        List.of(85.0, 90.0, 95.0)
                );

                log.info("✓ Created 4 assessments with multiple submissions");
                log.info("=====================================");
                log.info("Topic mark sample data initialized successfully!");
                log.info("Expected calculation:");
                log.info("  - Quiz 1 (HIGHEST): 90");
                log.info("  - Quiz 2 (HIGHEST): 75");
                log.info("  - Quiz type average: (90 + 75) / 2 = 82.5");
                log.info("  - Quiz contribution: 82.5 × 0.3 = 24.75");
                log.info("  - Midterm (LATEST): 70");
                log.info("  - Exam contribution: 70 × 0.5 = 35.0");
                log.info("  - Lab (AVERAGE): 90");
                log.info("  - Lab contribution: 90 × 0.2 = 18.0");
                        log.info("  - Final score: 24.75 + 35.0 + 18.0 = 77.75");
                        log.info("  - Pass status: 77.75 >= 60.0 = PASS ✓");
                        log.info("=====================================");
                } finally {
                        // Always restore flush mode to AUTO
                        entityManager.setFlushMode(jakarta.persistence.FlushModeType.AUTO);
                }
        }

        /**
         * Create or get existing AssessmentType by name
         * Uses EntityManager to bypass validation errors from corrupted data
         */
        private AssessmentType createOrGetAssessmentType(String name, String description) {
                try {
                        // Clear to detach pending entities without triggering validation
                        entityManager.clear();
                        
                        // Use JPQL query instead of findAll() to avoid loading corrupted records
                        AssessmentType existing = entityManager
                                .createQuery("SELECT a FROM AssessmentType a WHERE a.name = :name", AssessmentType.class)
                                .setParameter("name", name)
                                .getResultStream()
                                .findFirst()
                                .orElse(null);
                        
                        if (existing != null) {
                                return existing;
                        }
                        
                        // Create new if not found
                        AssessmentType newType = new AssessmentType();
                        newType.setName(name);
                        newType.setDescription(description);
                        return assessmentTypeRepository.save(newType);
                } catch (Exception e) {
                        log.error("Failed to create/get AssessmentType '{}': {}", name, e.getMessage());
                        throw new RuntimeException("Cannot create AssessmentType: " + name, e);
                }
        }

        /**
         * Create CourseAssessmentTypeWeight if not exists
         */
        private void createWeightIfNotExists(Course course, AssessmentType type, Double weight) {
                // Use targeted query instead of findAll()
                Long count = entityManager
                        .createQuery("SELECT COUNT(w) FROM CourseAssessmentTypeWeight w WHERE w.course.id = :courseId AND w.assessmentType.id = :typeId", Long.class)
                        .setParameter("courseId", course.getId())
                        .setParameter("typeId", type.getId())
                        .getSingleResult();

                if (count == 0) {
                        CourseAssessmentTypeWeight w = CourseAssessmentTypeWeight.builder()
                                .course(course)
                                .assessmentType(type)
                                .weight(weight)
                                .build();
                        courseAssessmentTypeWeightRepository.save(w);
                }
        }

        /**
         * Create an assessment with multiple submissions to demonstrate grading methods
         * 
         * @param courseClass The course class
         * @param student The student user
         * @param assessmentType Type of assessment (Quiz, Exam, Lab)
         * @param title Assessment title
         * @param gradingMethod How to calculate final score (HIGHEST, LATEST, AVERAGE)
         * @param scores List of scores for multiple submission attempts
         */
        private void createAssessmentWithSubmissions(
                        CourseClass courseClass,
                        User student,
                        AssessmentType assessmentType,
                        String title,
                        GradingMethod gradingMethod,
                        List<Double> scores) {

                // Check if assessment already exists by title (Assessment doesn't have courseClass field)
                Assessment assessment = entityManager
                        .createQuery("SELECT a FROM Assessment a WHERE a.title = :title", Assessment.class)
                        .setParameter("title", title)
                        .getResultStream()
                        .findFirst()
                        .orElseGet(() -> {
                                Assessment a = new Assessment();
                                a.setCode("ASM-" + title.replaceAll("\\s+", "-").toUpperCase());
                                a.setTitle(title);
                                a.setDescription("Demo assessment: " + title);
                                a.setAssessmentType(assessmentType);
                                a.setGradingMethod(gradingMethod);
                                a.setTotalScore(100);
                                a.setPassScore(50);
                                a.setTimeLimitMinutes(60);
                                a.setAttemptLimit(scores.size());
                                a.setIsShuffleQuestion(false);
                                a.setIsShuffleOption(false);
                                a.setStatus(AssessmentStatus.ACTIVE);
                                return assessmentRepository.save(a);
                        });

                // Create submissions for each score
                for (int i = 0; i < scores.size(); i++) {
                        final int attemptNumber = i + 1;
                        final Double score = scores.get(i);

                        // Check if submission already exists
                        Long count = entityManager
                                .createQuery("SELECT COUNT(s) FROM Submission s WHERE s.assessment.id = :assessmentId AND s.user.id = :userId AND s.courseClass.id = :courseClassId AND s.attemptNumber = :attemptNumber", Long.class)
                                .setParameter("assessmentId", assessment.getId())
                                .setParameter("userId", student.getId())
                                .setParameter("courseClassId", courseClass.getId())
                                .setParameter("attemptNumber", attemptNumber)
                                .getSingleResult();

                        if (count == 0) {
                                Submission submission = Submission.builder()
                                        .assessment(assessment)
                                        .courseClass(courseClass)
                                        .user(student)
                                        .status(SubmissionStatus.SUBMITTED)
                                        .startedAt(LocalDateTime.now().minusDays(20 - i))
                                        .submittedAt(LocalDateTime.now().minusDays(20 - i).plusHours(1))
                                        .totalScore(score)
                                        .isPassed(score >= 50.0)
                                        .attemptNumber(attemptNumber)
                                        .build();
                                submissionRepository.save(submission);
                        }
                }
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record LocationDataJson(List<ProvinceJson> province, List<CommuneJson> commune) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record ProvinceJson(String idProvince, String name) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record CommuneJson(String idProvince, String idCommune, String name) {
        }

}