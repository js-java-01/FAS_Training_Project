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
import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.course.entity.Course;
// import com.example.starter_project_2025.system.course.entity.CourseCohort;
import com.example.starter_project_2025.system.course.entity.CourseLesson;
// import com.example.starter_project_2025.system.course.enums.CohortStatus;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseLessonRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;

import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import java.util.function.Function;
import java.util.stream.Collectors;

@Component
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
        private final CourseLessonRepository courseLessonRepository;
        private final UserRoleRepository userRoleRepository;
        private final SemesterRepository semesterRepository;
        private final TrainingClassRepository trainingClassRepository;
        private final CourseClassRepository courseClassRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final LocationRepository locationRepository;

        @Override
        @Transactional
        public void run(String... args) {
                log.info("Initializing database with sample data...");

                if (roleRepository.count() == 0) {
                        initializePermissions();
                        initializeRoles();
                        initializeUsers();

                        initializeLocations();
                        initializeModuleGroups();
                        initializeAssessmentType();
                        initializeAssessments();
                        initializeQuestionCategories();
                        initializeQuestions();
                        initializeCourses();
                        // initializeCohorts(); // disabled - cohort feature temporarily not in use
                        initializeUserRoles();
                        initializeSemester();
                        ensureProgrammingLanguagePermissions();
                        initializeProgrammingLanguages();
                        initializeCourses();
                        initializeTrainingClasses();
                        initializeCourseClasses();
                        log.info("Database initialization completed successfully!");
                } else {
                        log.info("Database already initialized, checking for missing permissions...");
                        // Check if programming language permissions exist, if not, add them

                }
                ensureOutlinePermissions();
                if (userRoleRepository.count() == 0)

                {
                        initializeUserRoles();
                        initializeLessons();
                }

                initializeEnrollments();
        }

        private void initializePermissions() {
                List<Permission> permissions = Arrays.asList(
                        createPermission("DASHBOARD_READ", "AHIHI", "DASHBOARD",
                                "READ"),
                        createPermission("SIDEBAR_READ", "View Sidebar", "SIDEBAR", "READ"),

                                /* ================= MODULE GROUP ================= */
                                createPermission("MODULE_GROUP_CREATE", "Create new module groups", "MODULE_GROUP",
                                                "CREATE"),
                                createPermission("MODULE_GROUP_READ", "View module groups", "MODULE_GROUP", "READ"),
                                createPermission("MODULE_GROUP_UPDATE", "Update existing module groups", "MODULE_GROUP",
                                                "UPDATE"),
                                createPermission("MODULE_GROUP_DELETE", "Delete module groups", "MODULE_GROUP",
                                                "DELETE"),
                                createPermission("MODULE_GROUP_IMPORT", "Import module groups", "MODULE_GROUP",
                                                "IMPORT"),
                                createPermission("MODULE_GROUP_EXPORT", "Export module groups", "MODULE_GROUP",
                                                "EXPORT"),

                                /* ================= MODULE ================= */
                                createPermission("MODULE_CREATE", "Create new modules", "MODULE", "CREATE"),
                                createPermission("MODULE_READ", "View modules", "MODULE", "READ"),
                                createPermission("MODULE_UPDATE", "Update existing modules", "MODULE", "UPDATE"),
                                createPermission("MODULE_DELETE", "Delete modules", "MODULE", "DELETE"),
                                createPermission("MODULE_IMPORT", "Import modules", "MODULE", "IMPORT"),
                                createPermission("MODULE_EXPORT", "Export modules", "MODULE", "EXPORT"),
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
                                createPermission("DEPARTMENT_READ", "View departments", "DEPARTMENT", "READ"),
                                createPermission("DEPARTMENT_CREATE", "Create new departments", "DEPARTMENT", "CREATE"),
                                createPermission("DEPARTMENT_UPDATE", "Update existing departments", "DEPARTMENT",
                                                "UPDATE"),
                                createPermission("DEPARTMENT_DELETE", "Delete departments", "DEPARTMENT", "DELETE"),
                                createPermission("DEPARTMENT_IMPORT", "Import departments", "DEPARTMENT", "IMPORT"),
                                createPermission("DEPARTMENT_EXPORT", "Export departments", "DEPARTMENT", "EXPORT"),
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
                                createPermission("LESSON_CREATE", "Create new lessons", "LESSON", "CREATE"),
                                createPermission("LESSON_UPDATE", "Update existing lessons", "LESSON", "UPDATE"),
                                createPermission("LESSON_DELETE", "Delete lessons", "LESSON", "DELETE"),
                                createPermission("SESSION_CREATE", "Create new sessions", "SESSION", "CREATE"),
                                createPermission("SESSION_READ", "View sessions", "SESSION", "READ"),
                                createPermission("SESSION_UPDATE", "Update existing sessions", "SESSION", "UPDATE"),
                                createPermission("SESSION_DELETE", "Delete sessions", "SESSION", "DELETE"),
                                createPermission("COURSE_OUTLINE_EDIT", "Edit course outline", "COURSE", "EDIT"),
                                createPermission("CLASS_CREATE", "Create new classes", "CLASS", "CREATE"),
                                createPermission("CLASS_READ", "View classes", "CLASS", "READ"),
                                createPermission("CLASS_UPDATE", "Update existing classes", "CLASS", "UPDATE"),
                                createPermission("SEMESTER_CREATE", "Create new semesters", "SEMESTER", "CREATE"),
                                createPermission("SEMESTER_READ", "View semesters", "SEMESTER", "READ"),
                                createPermission("SEMESTER_UPDATE", "Update semesters", "SEMESTER", "UPDATE"),
                                createPermission("CLASS_VIEW_OWN_CLASSES_READ", "View own classes", "CLASS", "READ"),
                                createPermission("SEMESTER_DELETE", "Delete semesters", "SEMESTER", "DELETE"),
                                createPermission("SWITCH_ROLE", "Switch to another role view", "ROLE", "SWITCH"),

                        /* ================= PERMISSION ================= */
                        createPermission("PERMISSION_CREATE", "Create new permissions", "PERMISSION", "CREATE"),
                        createPermission("PERMISSION_READ", "View permissions", "PERMISSION", "READ"),
                        createPermission("PERMISSION_UPDATE", "Update existing permissions", "PERMISSION",
                                "UPDATE"),
                        createPermission("PERMISSION_DELETE", "Delete permissions", "PERMISSION", "DELETE"),
                        createPermission("PERMISSION_IMPORT", "Import permissions", "PERMISSION", "IMPORT"),
                        createPermission("PERMISSION_EXPORT", "Export permissions", "PERMISSION", "EXPORT"),
                        createPermission("TOPIC_CREATE", "Create new topics", "TOPIC", "CREATE"),
                        createPermission("TOPIC_READ", "View topics", "TOPIC", "READ"),
                        createPermission("TOPIC_UPDATE", "Update existing topics", "TOPIC", "UPDATE"),
                        createPermission("TOPIC_DELETE", "Delete topics", "TOPIC", "DELETE"),
                        createPermission("TOPIC_IMPORT", "Import topics from Excel", "TOPIC", "IMPORT"),
                        createPermission("TOPIC_EXPORT", "Export topics to Excel", "TOPIC", "EXPORT"));
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

        private void initializeTrainerRole() {

                if (roleRepository.findByName("TRAINER").isPresent()) {
                        return;
                }

                List<Permission> allPermissions = permissionRepository.findAll();

                Set<Permission> trainerPermissions = allPermissions.stream()
                        .filter(p ->
                                ("READ".equals(p.getAction())
                                        && Arrays.asList("SIDEBAR", "CLASS", "COURSE", "SEMESTER", "STUDENT", "MODULE", "DASHBOARD")
                                        .contains(p.getResource()))
                        )
                        .collect(Collectors.toSet());

                List<String> extraPermissionNames = Arrays.asList(
                        "LESSON_CREATE", "LESSON_UPDATE", "LESSON_DELETE",
                        "SESSION_CREATE", "SESSION_UPDATE", "SESSION_DELETE",
                        "COURSE_OUTLINE_EDIT",
                        "ASSESSMENT_CREATE", "ASSESSMENT_UPDATE", "ASSESSMENT_DELETE",
                        "ASSESSMENT_ASSIGN", "ASSESSMENT_PUBLISH", "ASSESSMENT_SUBMIT",
                        "QUESTION_CREATE", "QUESTION_UPDATE", "QUESTION_DELETE",
                        "QUESTION_CATEGORY_CREATE", "QUESTION_CATEGORY_UPDATE", "QUESTION_CATEGORY_DELETE",
                        "ENROLL_COURSE"
                );

                for (String name : extraPermissionNames) {
                        permissionRepository.findByName(name)
                                .ifPresent(trainerPermissions::add);
                }

                Role trainerRole = new Role();
                trainerRole.setName("TRAINER");
                trainerRole.setHierarchyLevel(4);
                trainerRole.setDescription("Trainer with course/lesson/assessment management access");
                trainerRole.setPermissions(trainerPermissions);

                roleRepository.save(trainerRole);

                log.info("Initialized TRAINER role with {} permissions", trainerPermissions.size());
        }

        private void initializeRoles() {


                // ADMIN
                Role adminRole = new Role();
                adminRole.setName("ADMIN");
                adminRole.setDescription("Administrator with full system access");
                adminRole.setHierarchyLevel(2);
                List<String> excludedAdminPermissions = List.of(
                        "MODULE_GROUP_CREATE",
                        "MODULE_CREATE");

                List<Permission> adminPermissions = permissionRepository.findAll()
                        .stream()
                        .filter(p -> !excludedAdminPermissions.contains(p.getName()))
                        .toList();

                adminRole.setPermissions(new HashSet<>(adminPermissions));
                roleRepository.save(adminRole);

                // MANAGER
                Role departmentManagerRole = new Role();
                departmentManagerRole.setName("MANAGER");
                departmentManagerRole.setDescription("Department Manager with class management permissions");
                departmentManagerRole.setHierarchyLevel(3);
                List<Permission> departmentPermissions = permissionRepository.findAll()
                                .stream()
                                .filter(p -> "CLASS".equals(p.getResource()))
                                .toList();

                departmentManagerRole.setPermissions(new HashSet<>(departmentPermissions));
                roleRepository.save(departmentManagerRole);

                // STUDENT
                Role studentRole = new Role();
                studentRole.setName("STUDENT");
                studentRole.setHierarchyLevel(5);
                studentRole.setDescription("Student with limited access to educational resources");

                List<Permission> studentPermissions = new ArrayList<>(
                        permissionRepository.findByAction("READ")
                );

                permissionRepository.findByName("ENROLL_COURSE")
                        .ifPresent(studentPermissions::add);

                List<String> excludedStudentPermissions = List.of(
                        "ROLE_READ",
                        "USER_READ",
                        "PERMISSION_READ",
                        "SEMESTER_READ",
                        "STUDENT_READ",
                        "LOCATION_READ",
                        "DEPARTMENT_READ"
                );

                Set<Permission> filteredPermissions = studentPermissions.stream()
                        .filter(p -> !excludedStudentPermissions.contains(p.getName()))
                        .collect(Collectors.toSet());

                studentRole.setPermissions(filteredPermissions);

                roleRepository.save(studentRole);

                // TRAINER
                initializeTrainerRole();


                // SUPER_ADMIN
                Role superAdminRole = new Role();
                superAdminRole.setName("SUPER_ADMIN");
                superAdminRole.setHierarchyLevel(1);
                superAdminRole.setDescription("Super Administrator with all permissions and role-switch capability");
                superAdminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
                roleRepository.save(superAdminRole);

                log.info("Initialized 4 roles: ADMIN, MANAGER, STUDENT, TRAINER, SUPER_ADMIN");


                List<Permission> allPermissions = permissionRepository.findAll();

                Set<Permission> managerPermissions = allPermissions.stream()
                        .filter(p -> "UPDATE".equals(p.getAction())
                                && Arrays.asList("STUDENT").contains(p.getResource())
                                || "READ".equals(p.getAction()) && Arrays.asList("MENU", "SEMESTER")
                                .contains(p.getResource())
                                || "CLASS".equals(p.getResource())
                                || "COURSE".equals(p.getResource())
                                || "SEMESTER".equals(p.getResource()))
                        .collect(Collectors.toSet());
                createRoleIfNotFound("MANAGER", "Manager with class and course management permissions",
                        managerPermissions);



        }



        private void initializeUsers() {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPasswordHash(passwordEncoder.encode("password123"));
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setIsActive(true);
                userRepository.save(admin);

                User superAdmin = new User();
                superAdmin.setEmail("superadmin@example.com");
                superAdmin.setPasswordHash(passwordEncoder.encode("password123"));
                superAdmin.setFirstName("Super");
                superAdmin.setLastName("Admin");
                superAdmin.setIsActive(true);
                userRepository.save(superAdmin);

                User trainer = new User();
                trainer.setEmail("trainer@example.com");
                trainer.setPasswordHash(passwordEncoder.encode("password123"));
                trainer.setFirstName("Trainer");
                trainer.setLastName("User");
                trainer.setIsActive(true);
                userRepository.save(trainer);



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

                // MANAGER (2)
                createUserIfNotFound("manager1@example.com", "Alice", "Manager");
                createUserIfNotFound("manager2@example.com", "David", "Manager");
                createUserIfNotFound("trainer1@example.com", "Bob", "Teacher");
                createUserIfNotFound("trainer2@example.com", "Michael", "Trainer");
                createUserIfNotFound("trainer3@example.com", "Sarah", "Instructor");



                log.info("Initialized 5 users: admin, superadmin, trainer, student, jane.smith");
        }

        private void createUserIfNotFound(String email, String firstName, String lastName) {
                if (!userRepository.existsByEmail(email)) {
                        User user = new User();
                        user.setEmail(email);
                        user.setPasswordHash(passwordEncoder.encode("password123"));
                        user.setFirstName(firstName);
                        user.setLastName(lastName);
                        user.setIsActive(true);
                        userRepository.save(user);
                }
        }

        private void initializeUserRoles() {
                Role adminRole = roleRepository.findByName("ADMIN")
                                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
                Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                                .orElseThrow(() -> new RuntimeException("Role SUPER_ADMIN not found"));
                Role trainerRole = roleRepository.findByName("TRAINER")
                                .orElseThrow(() -> new RuntimeException("Role TRAINER not found"));
                Role departmentManagerRole = roleRepository.findByName("MANAGER")
                                .orElseThrow(() -> new RuntimeException("Role MANAGER not found"));
                Role studentRole = roleRepository.findByName("STUDENT")
                                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));
                User manager1 = userRepository.findByEmail("manager1@example.com").orElseThrow();
                User manager2 = userRepository.findByEmail("manager2@example.com").orElseThrow();


                User trainer1 = userRepository.findByEmail("trainer1@example.com").orElseThrow();
                User trainer2 = userRepository.findByEmail("trainer2@example.com").orElseThrow();
                User trainer3 = userRepository.findByEmail("trainer3@example.com").orElseThrow();


                User adminUser = userRepository.findByEmail("admin@example.com")
                                .orElseThrow(() -> new RuntimeException("Admin user not found"));
                User superAdminUser = userRepository.findByEmail("superadmin@example.com")
                                .orElseThrow(() -> new RuntimeException("Super admin user not found"));
                User trainerUser = userRepository.findByEmail("trainer@example.com")
                                .orElseThrow(() -> new RuntimeException("Trainer user not found"));
                User student1 = userRepository.findByEmail("student@example.com")
                                .orElseThrow(() -> new RuntimeException("Student 1 not found"));
                User student2 = userRepository.findByEmail("jane.smith@example.com")
                                .orElseThrow(() -> new RuntimeException("Student 2 not found"));

                // Admin user: all roles, ADMIN is default
                saveUserRole(adminUser, adminRole, true);
                saveUserRole(adminUser, superAdminRole, false);
                saveUserRole(adminUser, trainerRole, false);
                saveUserRole(adminUser, departmentManagerRole, false);
                saveUserRole(adminUser, studentRole, false);

                // Super Admin user: all roles, SUPER_ADMIN is default
                saveUserRole(superAdminUser, superAdminRole, true);
                saveUserRole(superAdminUser, adminRole, false);
                saveUserRole(superAdminUser, trainerRole, false);
                saveUserRole(superAdminUser, departmentManagerRole, false);
                saveUserRole(superAdminUser, studentRole, false);

                // Trainer user: only TRAINER
                saveUserRole(trainerUser, trainerRole, true);
                saveUserRole(trainer1, trainerRole, true);
                saveUserRole(trainer2, trainerRole, true);
                saveUserRole(trainer3, trainerRole, true);

                // Student users
                saveUserRole(student1, studentRole, true);
                saveUserRole(student2, studentRole, true);

                // Manager
                saveUserRole(manager1, departmentManagerRole, true);
                saveUserRole(manager2, departmentManagerRole, true);

                log.info("Successfully assigned roles to users in UserRole table.");
        }

        private void saveUserRole(User user, Role role, boolean isDefault) {
                UserRole ur = new UserRole();
                ur.setUser(user);
                ur.setRole(role);
                ur.setDefault(isDefault);
                userRoleRepository.save(ur);
        }

        private void assignRoleIfNotFound(User user, Role role, boolean isDefault) {
                if (userRoleRepository.findByUserAndRole(user, role).isEmpty()) {
                        UserRole userRole = new UserRole();
                        userRole.setUser(user);
                        userRole.setRole(role);
                        userRole.setDefault(isDefault);
                        userRoleRepository.save(userRole);
                }
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

        private void initializeModuleGroups() {

                /*
                 * =======================================================
                 * MODULE GROUP: Main Menu
                 * =======================================================
                 */
                ModuleGroups mainGroup = new ModuleGroups();
                mainGroup.setName("Main Menu");
                mainGroup.setDescription("Main navigation menu of the application");
                mainGroup.setDisplayOrder(1);
                mainGroup.setIsActive(true);
                mainGroup = moduleGroupsRepository.save(mainGroup);

                moduleRepository.save(
                                createModule(
                                                mainGroup,
                                                "Dashboard",
                                                "/dashboard",
                                                "home",
                                                1,
                                                "DASHBOARD_READ",
                                                "System dashboard overview"));

                /*
                 * =======================================================
                 * MODULE GROUP: System Management
                 * =======================================================
                 */
                ModuleGroups systemGroup = new ModuleGroups();
                systemGroup.setName("System Management");
                systemGroup.setDescription("System configuration and administration");
                systemGroup.setDisplayOrder(4);
                systemGroup.setIsActive(true);
                systemGroup = moduleGroupsRepository.save(systemGroup);

                moduleRepository.saveAll(Arrays.asList(

                                createModule(systemGroup, "Modules", "/modules", "menu", 1,
                                                "MODULE_CREATE",
                                                "Manage system modules"),

                                createModule(systemGroup, "Module Groups", "/moduleGroups", "layers", 2,
                                                "MODULE_GROUP_CREATE",
                                                "Manage module groups"),

                                createModule(systemGroup, "Users", "/users", "users", 3,
                                                "USER_READ",
                                                "Manage system users"),

                        createModule(systemGroup, "Roles", "/roles", "shield", 4,
                                "ROLE_READ",
                                "Manage roles and permissions"),

                        createModule(systemGroup, "Permissions", "/permissions", "key", 5,
                                "PERMISSION_READ",
                                "Manage system permissions"),
                        createModule(systemGroup, "Locations", "/locations", "map-pin", 5,
                                                "LOCATION_READ",
                                                "Manage office locations"),

                                createModule(systemGroup, "Departments", "/departments", "university", 6,
                                                "DEPARTMENT_READ",
                                                "Manage departments")));

                /*
                 * =======================================================
                 * MODULE GROUP: Training
                 * =======================================================
                 */
                ModuleGroups trainingGroup = new ModuleGroups();
                trainingGroup.setName("Training");
                trainingGroup.setDescription("Manage training programs and related activities");
                trainingGroup.setDisplayOrder(5);
                trainingGroup.setIsActive(true);
                trainingGroup = moduleGroupsRepository.save(trainingGroup);

                moduleRepository.saveAll(Arrays.asList(

                                createModule(trainingGroup, "Courses", "/courses", "book-open", 1,
                                                "COURSE_READ",
                                                "Manage training courses"),

                                createModule(trainingGroup, "Course Catalog", "/my-courses", "graduation-cap", 2,
                                                "ENROLL_COURSE",
                                                "Browse and enroll in available courses"),

                                createModule(trainingGroup, "Programming Languages", "/programming-languages", "code",
                                                3,
                                                "PROGRAMMING_LANGUAGE_READ",
                                                "Manage programming languages"),

                                createModule(trainingGroup, "Students", "/v1/student", "person", 4,
                                                "STUDENT_READ",
                                                "Manage students"),

                                createModule(trainingGroup, "Classes", "/classes", "people", 6,
                                                "CLASS_READ",
                                                "User search and view classes"),
                                createModule(trainingGroup, "My Classes", "/my-classes", "user-round", 6,
                                                "CLASS_VIEW_OWN_CLASSES_READ",
                                                "View and manage personal profile"),
                                createModule(
                                                trainingGroup,
                                                "Trainer Semesters",
                                                "/trainer-semesters",
                                                "calendar",
                                                1,
                                                "SEMESTER_READ",
                                                "Manage academic semesters")));

                   /* =======================================================
       MODULE GROUP: Assessment
    ======================================================= */
                ModuleGroups assessmentGroup = new ModuleGroups();
                assessmentGroup.setName("Assessment");
                assessmentGroup.setDescription("Manage assessments and related permissions");
                assessmentGroup.setDisplayOrder(6);
                assessmentGroup.setIsActive(true);
                assessmentGroup = moduleGroupsRepository.save(assessmentGroup);

                moduleRepository.save(
                        createModule(
                                assessmentGroup,
                                "Assessment Type",
                                "/assessment-type",
                                "shield",
                                1,
                                "ASSESSMENTTYPE_READ",
                                "Manage assessment types"
                        )
                );

                log.info("Initialized module groups and modules successfully.");
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

                questionRepository.save(q1);

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

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record LocationDataJson(List<ProvinceJson> province, List<CommuneJson> commune) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record ProvinceJson(String idProvince, String name) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record CommuneJson(String idProvince, String idCommune, String name) {
        }

        private void ensureOutlinePermissions() {
                boolean hasOutlinePerm = permissionRepository.existsByName("COURSE_OUTLINE_EDIT");

                if (!hasOutlinePerm) {
                        log.info("Course outline permissions not found, adding them...");

                        List<Permission> outlinePermissions = Arrays.asList(
                                        createPermission("COURSE_OUTLINE_EDIT", "Edit course outline", "COURSE",
                                                        "EDIT"));

                        permissionRepository.saveAll(outlinePermissions);

                        // Add to all existing roles that have COURSE_UPDATE
                        List<Role> roles = roleRepository.findAll();
                        for (Role role : roles) {
                                boolean hasCourseUpdate = role.getPermissions().stream()
                                                .anyMatch(p -> "COURSE_UPDATE".equals(p.getName()));
                                if (hasCourseUpdate || "ADMIN".equals(role.getName())) {
                                        role.getPermissions().addAll(outlinePermissions);
                                        roleRepository.save(role);
                                        log.info("Added outline permissions to role: {}", role.getName());
                                }
                        }
                }
        }

        private CourseClass buildCourseClass(Course course, TrainingClass classInfo, User trainer) {
                CourseClass cc = new CourseClass();
                cc.setCourse(course);
                cc.setClassInfo(classInfo);
                cc.setTrainer(trainer);
                return cc;
        }

        private void initializeEnrollments() {
                if (enrollmentRepository.count() > 0) {
                        log.info("Enrollments already exist, skipping initialization");
                        return;
                }

                User student1 = userRepository.findByEmail("student1@example.com").orElse(null);
                User student2 = userRepository.findByEmail("student2@example.com").orElse(null);
                User student3 = userRepository.findByEmail("student3@example.com").orElse(null);
                User student4 = userRepository.findByEmail("student4@example.com").orElse(null);
                User student5 = userRepository.findByEmail("student5@example.com").orElse(null);

                List<TrainingClass> classes = trainingClassRepository.findAll();

                if (classes.isEmpty() || student1 == null) {
                        log.warn("Missing Students or Training Classes! Please run their initializers first.");
                        return;
                }

                List<Enrollment> enrollments = new ArrayList<>();

                int totalClasses = classes.size();

                if (totalClasses > 0) {
                        enrollments.add(buildEnrollment(student1, classes.get(0)));
                        enrollments.add(buildEnrollment(student2, classes.get(0)));
                        enrollments.add(buildEnrollment(student3, classes.get(0)));
                }

                if (totalClasses > 1) {
                        enrollments.add(buildEnrollment(student4, classes.get(1)));
                        enrollments.add(buildEnrollment(student5, classes.get(1)));
                }

                if (totalClasses > 2) {
                        enrollments.add(buildEnrollment(student1, classes.get(2)));
                        enrollments.add(buildEnrollment(student2, classes.get(2)));
                        enrollments.add(buildEnrollment(student4, classes.get(2)));
                        enrollments.add(buildEnrollment(student5, classes.get(2)));
                }

                if (totalClasses > 3) {
                        enrollments.add(buildEnrollment(student3, classes.get(3)));
                }

                if (totalClasses > 4) {
                        enrollments.add(buildEnrollment(student1, classes.get(4)));
                }
                if (totalClasses > 5) {
                        enrollments.add(buildEnrollment(student2, classes.get(5)));
                }
                if (totalClasses > 6) {
                        enrollments.add(buildEnrollment(student3, classes.get(6)));
                }
                if (totalClasses > 7) {
                        enrollments.add(buildEnrollment(student4, classes.get(7)));
                }

                enrollmentRepository.saveAll(enrollments);

                log.info("Initialized {} Enrollments successfully. Students are now in classes!", enrollments.size());
        }

        private Enrollment buildEnrollment(User student, TrainingClass trainingClass) {
                Enrollment enrollment = new Enrollment();
                enrollment.setUser(student);
                // enrollment.setTrainingClass(trainingClass);
                return enrollment;
        }

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

        // -----------------------------------------------------------------------
        // initializeCohorts() - temporarily disabled, cohort feature not in use
        // -----------------------------------------------------------------------
        // private void initializeCohorts() {
        // Course java01 = courseRepository.findAll().stream()
        // .filter(c -> "JBM-01".equals(c.getCourseCode()))
        // .findFirst().orElse(null);
        // Course react01 = courseRepository.findAll().stream()
        // .filter(c -> "RFP-01".equals(c.getCourseCode()))
        // .findFirst().orElse(null);
        //
        // if (java01 != null) {
        // CourseCohort jbm1 = CourseCohort.builder()
        // .code("JBM-01-2026-C1")
        // .startDate(java.time.LocalDate.of(2026, 3, 1))
        // .endDate(java.time.LocalDate.of(2026, 5, 31))
        // .capacity(30)
        // .status(CohortStatus.OPEN)
        // .course(java01)
        // .build();
        // CourseCohort jbm2 = CourseCohort.builder()
        // .code("JBM-01-2026-C2")
        // .startDate(java.time.LocalDate.of(2026, 6, 1))
        // .endDate(java.time.LocalDate.of(2026, 8, 31))
        // .capacity(25)
        // .status(CohortStatus.DRAFT)
        // .course(java01)
        // .build();
        // courseCohortRepository.saveAll(List.of(jbm1, jbm2));
        // }
        //
        // if (react01 != null) {
        // CourseCohort rfp1 = CourseCohort.builder()
        // .code("RFP-01-2026-C1")
        // .startDate(java.time.LocalDate.of(2026, 4, 1))
        // .endDate(java.time.LocalDate.of(2026, 5, 31))
        // .capacity(20)
        // .status(CohortStatus.OPEN)
        // .course(react01)
        // .build();
        // courseCohortRepository.save(rfp1);
        // }
        // log.info("Initialized cohorts for Java and React courses");
        // }
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

        private void initializeLessons() {
                if (courseLessonRepository.count() > 0) {
                        log.info("Lessons already exist, skipping initialization");
                        return;
                }

                // Tìm khóa học Java
                Course java01 = courseRepository.findAll().stream()
                                .filter(c -> "JBM-01".equals(c.getCourseCode()))
                                .findFirst().orElse(null);

                // Tìm khóa học React
                Course react01 = courseRepository.findAll().stream()
                                .filter(c -> "RFP-01".equals(c.getCourseCode()))
                                .findFirst().orElse(null);

                if (java01 != null) {
                        List<CourseLesson> javaLessons = Arrays.asList(
                                        createLesson(java01, "Introduction to Spring Boot",
                                                        "Overview of Spring ecosystem and setup.", 1),
                                        createLesson(java01, "Spring Data JPA & Hibernate",
                                                        "Deep dive into database ORM mapping.", 2),
                                        createLesson(java01, "Spring Security & JWT",
                                                        "Securing APIs with token-based authentication.", 3));
                        courseLessonRepository.saveAll(javaLessons);
                }

                if (react01 != null) {
                        List<CourseLesson> reactLessons = Arrays.asList(
                                        createLesson(react01, "React Fundamentals",
                                                        "Components, Props, and State basics.", 1),
                                        createLesson(react01, "Hooks & Context API",
                                                        "Managing global state and side effects.", 2),
                                        createLesson(react01, "TanStack Query & Axios",
                                                        "Handling server-side state and API calls.", 3));
                        courseLessonRepository.saveAll(reactLessons);
                }

                log.info("Initialized lessons for Java and React courses");
        }

        private CourseLesson createLesson(Course course, String name, String desc, int order) {
                return CourseLesson.builder()
                                .course(course)
                                .lessonName(name)
                                .description(desc)
                                .sortOrder(order)
                                .build();
        }

        private void initializeCourseClasses() {
                if (courseClassRepository.count() > 0) {
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

                if (courseMap.isEmpty()) {
                        log.warn("No courses found! Please run initializeCourses() first.");
                        return;
                }

                List<TrainingClass> trainingClasses = trainingClassRepository.findAll();
                if (trainingClasses.isEmpty()) {
                        log.warn("No TrainingClasses found! Please initialize TrainingClasses before CourseClasses.");
                        return;
                }
                int classCount = trainingClasses.size();

                List<CourseClass> courseClasses = List.of(
                                buildCourseClass(courseMap.get("JBM-01"), trainingClasses.get(0 % classCount),
                                                trainer1),
                                buildCourseClass(courseMap.get("RFP-01"), trainingClasses.get(1 % classCount),
                                                trainer2),
                                buildCourseClass(courseMap.get("PDS-01"), trainingClasses.get(2 % classCount),
                                                trainer3),
                                buildCourseClass(courseMap.get("AWS-01"), trainingClasses.get(3 % classCount),
                                                trainer1),

                                buildCourseClass(courseMap.get("DVO-01"), trainingClasses.get(4 % classCount),
                                                manager1),
                                buildCourseClass(courseMap.get("FLT-01"), trainingClasses.get(5 % classCount),
                                                trainer2),
                                buildCourseClass(courseMap.get("UIX-01"), trainingClasses.get(6 % classCount),
                                                trainer3),

                                buildCourseClass(courseMap.get("NOD-01"), trainingClasses.get(7 % classCount),
                                                trainer1),
                                buildCourseClass(courseMap.get("SQL-01"), trainingClasses.get(8 % classCount),
                                                trainer2),
                                buildCourseClass(courseMap.get("CYB-01"), trainingClasses.get(9 % classCount),
                                                manager1));

                List<CourseClass> validCourseClasses = courseClasses.stream()
                                .filter(cc -> cc.getCourse() != null)
                                .toList();

                courseClassRepository.saveAll(validCourseClasses);

                log.info("Initialized {} Course Classes with diverse Trainers and Courses.", validCourseClasses.size());
        }

        private TrainingClass buildTrainingClass(String name, String code, User creator, Semester semester,
                        LocalDate start, LocalDate end) {
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

        private void initializeTrainingClasses() {
                if (trainingClassRepository.count() > 0) {
                        log.info("Training classes already exist, skipping initialization");
                        return;
                }

                User admin = userRepository.findByEmail("admin@example.com")
                                .orElseThrow(() -> new RuntimeException("Admin not found"));
                User manager = userRepository.findByEmail("manager1@example.com")
                                .orElseThrow(() -> new RuntimeException("Manager not found"));

                Map<String, Semester> semesterMap = semesterRepository.findAll().stream()
                                .collect(Collectors.toMap(Semester::getName, s -> s));

                if (semesterMap.isEmpty()) {
                        log.warn("No semesters found! Please run initializeSemester() first.");
                        return;
                }

                List<TrainingClass> classes = List.of(
                                buildTrainingClass("Kỹ sư phần mềm - Khóa 1", "SE-K1-01", admin,
                                                semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 10),
                                                LocalDate.of(2025, 12, 20)),
                                buildTrainingClass("Hệ thống thông tin - Khóa 1", "IS-K1-01", manager,
                                                semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 15),
                                                LocalDate.of(2025, 12, 25)),

                                buildTrainingClass("Kỹ sư phần mềm - Khóa 2", "SE-K2-01", admin,
                                                semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 10),
                                                LocalDate.of(2026, 4, 20)),
                                buildTrainingClass("Khoa học dữ liệu - Khóa 1", "DS-K1-01", admin,
                                                semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 15),
                                                LocalDate.of(2026, 4, 25)),

                                buildTrainingClass("Trí tuệ nhân tạo - Khóa 1", "AI-K1-01", manager,
                                                semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 10),
                                                LocalDate.of(2026, 8, 20)),
                                buildTrainingClass("An toàn thông tin - Khóa 1", "CS-K1-01", admin,
                                                semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 15),
                                                LocalDate.of(2026, 8, 25)),

                                buildTrainingClass("Kỹ sư phần mềm - Khóa 3", "SE-K3-01", manager,
                                                semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 10),
                                                LocalDate.of(2026, 12, 20)),
                                buildTrainingClass("Thiết kế đồ họa - Khóa 1", "GD-K1-01", admin,
                                                semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 15),
                                                LocalDate.of(2026, 12, 25)));

                List<TrainingClass> validClasses = classes.stream()
                                .filter(c -> c.getSemester() != null)
                                .toList();

                trainingClassRepository.saveAll(validClasses);
                log.info("Initialized {} Training Classes distributed across multiple Semesters.", validClasses.size());
        }

        private void createRoleIfNotFound(String roleName, String description, Set<Permission> permissions) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                        Role role = new Role();
                        role.setName(roleName);
                        role.setDescription(description);
                        role.setPermissions(permissions);

                        roleRepository.save(role);
                        log.info("Created role: {}", roleName);
                }
        }
}
