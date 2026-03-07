package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentStatus;
import com.example.starter_project_2025.system.assessment_mgt.assessment.Assessment;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment_mgt.question.Question;
import com.example.starter_project_2025.system.assessment_mgt.question.QuestionRepository;
import com.example.starter_project_2025.system.assessment_mgt.question.QuestionType;
import com.example.starter_project_2025.system.assessment_mgt.question_category.QuestionCategory;
import com.example.starter_project_2025.system.assessment_mgt.question_category.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment_mgt.question_option.QuestionOption;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTag;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTagRepository;
import com.example.starter_project_2025.system.rbac.permission.Permission;
import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.rbac.permission.PermissionRepository;
import com.example.starter_project_2025.system.rbac.role.RoleRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseLessonOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_online.repository.CourseLessonOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.data.entity.Province;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.skill.entity.Skill;
import com.example.starter_project_2025.system.skill.entity.SkillGroup;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.skill.repository.SkillGroupRepository;
import com.example.starter_project_2025.system.skill.repository.SkillRepository;
import com.example.starter_project_2025.system.menu.repository.MenuItemRepository;
import com.example.starter_project_2025.system.menu.repository.MenuRepository;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import com.example.starter_project_2025.system.programming_language.ProgrammingLanguage;
import com.example.starter_project_2025.system.programming_language.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import com.example.starter_project_2025.system.rbac.user.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
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
        private final PermissionRepository permissionRepository;
        private final ProvinceRepository provinceRepository;
        private final CommuneRepository communeRepository;
        private final ObjectMapper objectMapper;
        private final ProgrammingLanguageRepository programmingLanguageRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AssessmentTypeRepository assessmentTypeRepository;
        private final AssessmentRepository assessmentRepository;
        private final QuestionCategoryRepository questionCategoryRepository;
        private final QuestionRepository questionRepository;
        private final AssessmentQuestionRepository assessmentQuestionRepository;
        private final UserRoleRepository userRoleRepository;
        private final RoleRepository roleRepository;
        private final SemesterRepository semesterRepository;
        private final TrainingClassRepository trainingClassRepository;
        private final CourseClassRepository courseClassRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final LocationRepository locationRepository;
        private final ModuleInitializer moduleInitializer;
        private final UserRoleInitializer userRoleInitializer;
        private final TrainingClassInitializer trainingClassInitializer;
        private final TrainingProgramInitializer trainingProgramInitializer;
        private final RoleInitializer roleInitializer;
        private final UserInitializer userInitializer;
        private final TopicInitializer topicInitializer;
        private final AssessmentTypeInitializer assessmentTypeInitializer;
        private final SkillInitializer skillInitializer;
        private final CourseInitializer courseInitializer;
        private final QuestionTagRepository tagRepository;

        @Override
        public void run(String... args) {
                log.info("Initializing database with sample data...");

                if (roleRepository.count() == 0) {
                        initializePermissions();
                        roleInitializer.initializeRoles();
                        userInitializer.initializeUsers();
                        // initializeLocationData();

                        // initializeLocations();
                        assessmentTypeInitializer.init();
                        initializeAssessments();
                        initializeQuestionCategories();
                        initializeQuestions();
                        linkQuestionsToAssessments();
                        // initializeCourses();
                        userRoleInitializer.initializeUserRoles();
                        // initializeSemester();
                        ensureProgrammingLanguagePermissions();
                        initializeProgrammingLanguages();
                        // initializeCourses();
                        trainingProgramInitializer.initializeTrainingProgram();
                        trainingClassInitializer.initializeTrainingClasses();
                        // initializeCourseClasses(); initializeTags();
                        initializeProgrammingLanguages();

                        log.info("Database initialization completed successfully!");
                } else {
                        log.info("Database already initialized, checking for missing permissions...");
                        // Ensure all roles and users exist in case a previous run failed
                        // mid-initialization
                        roleInitializer.initializeRoles();
                        userInitializer.initializeUsers();
                }
                // ensureOutlinePermissions();
                if (userRoleRepository.count() == 0) {
                        userRoleInitializer.initializeUserRoles();
                        // initializeLessons();
                }

                // initializeEnrollments();
                userRoleInitializer.initializeUserRoles();
                moduleInitializer.initializeModuleGroups();
                topicInitializer.init();
                courseInitializer.init();
                skillInitializer.init();
        }

        private void initializePermissions() {
                List<Permission> permissions = Arrays.asList(
                                createPermission("DASHBOARD_READ", "AHIHI", "DASHBOARD",
                                                "READ"),
                                createPermission("SIDEBAR_READ", "View Sidebar", "SIDEBAR", "READ"),
                                createPermission("SEMESTER_ADMIN_READ", "View semesters as admin", "SEMESTER",
                                                "ADMIN_READ"),
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
                                createPermission("USER_IMPORT", "Import users from file", "USER", "IMPORT"),
                                createPermission("USER_EXPORT", "Export users to file", "USER", "EXPORT"),
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
                                createPermission("TRAINING_PROGRAM_CREATE", "Create training programs",
                                                "TRAINING_PROGRAM", "CREATE"),
                                createPermission("TRAINING_PROGRAM_READ", "View training programs", "TRAINING_PROGRAM",
                                                "READ"),
                                createPermission("TRAINING_PROGRAM_UPDATE", "Update training programs",
                                                "TRAINING_PROGRAM", "UPDATE"),
                                createPermission("TRAINING_PROGRAM_DELETE", "Delete training programs",
                                                "TRAINING_PROGRAM", "DELETE"),
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
                                .filter(p -> ("READ".equals(p.getAction())
                                                && Arrays.asList("SIDEBAR", "CLASS", "COURSE", "SEMESTER", "STUDENT",
                                                                "MODULE", "DASHBOARD")
                                                                .contains(p.getResource())
                                                || "CREATE".equals(p.getAction()) && Arrays.asList("CLASS")
                                                                .contains(p.getResource())))
                                .collect(Collectors.toSet());

                List<String> extraPermissionNames = Arrays.asList(
                                "CLASS_CREATE",
                                "LESSON_CREATE", "LESSON_UPDATE", "LESSON_DELETE",
                                "SESSION_CREATE", "SESSION_UPDATE", "SESSION_DELETE",
                                "COURSE_OUTLINE_EDIT",
                                "ASSESSMENT_CREATE", "ASSESSMENT_UPDATE", "ASSESSMENT_DELETE",
                                "ASSESSMENT_ASSIGN", "ASSESSMENT_PUBLISH", "ASSESSMENT_SUBMIT",
                                "QUESTION_CREATE", "QUESTION_UPDATE", "QUESTION_DELETE",
                                "QUESTION_CATEGORY_CREATE", "QUESTION_CATEGORY_UPDATE", "QUESTION_CATEGORY_DELETE",
                                "ENROLL_COURSE");

                for (String name : extraPermissionNames) {
                        permissionRepository.findByName(name)
                                        .ifPresent(trainerPermissions::add);
                }

                Role trainerRole = new Role();
                trainerRole.setName("TRAINER");
                // trainerRole.setHierarchyLevel(4);
                trainerRole.setDescription("Trainer with course/lesson/assessment management access");
                trainerRole.setPermissions(trainerPermissions);

                roleRepository.save(trainerRole);

                log.info("Initialized TRAINER role with {} permissions", trainerPermissions.size());
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

        private void saveUserRole(User user, Role role, boolean isDefault) {
                UserRole ur = new UserRole();
                ur.setUser(user);
                ur.setRole(role);
                ur.setDefault(isDefault);
                userRoleRepository.save(ur);
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
                // entranceAssessment.setShuffleQuestion(true);
                // entranceAssessment.setShuffleOption(true);
                // entranceAssessment.setStatus(AssessmentStatus.PUBLISHED);

                Assessment midtermAssessment = new Assessment();
                midtermAssessment.setAssessmentType(midtermType);
                midtermAssessment.setCode("JAVA_MIDTERM_2025");
                midtermAssessment.setTitle("Java Midterm Test 2025");
                midtermAssessment.setDescription("Midterm evaluation for Java course");
                midtermAssessment.setTotalScore(100);
                midtermAssessment.setPassScore(50);
                midtermAssessment.setTimeLimitMinutes(90);
                midtermAssessment.setAttemptLimit(1);
                // midtermAssessment.setShuffleQuestion(false);
                // midtermAssessment.setShuffleOption(false);
                // midtermAssessment.setStatus(AssessmentStatus.PUBLISHED);

                Assessment finalAssessment = new Assessment();
                finalAssessment.setAssessmentType(finalType);
                finalAssessment.setCode("JAVA_FINAL_2025");
                finalAssessment.setTitle("Java Final Exam 2025");
                finalAssessment.setDescription("Final assessment for Java course");
                finalAssessment.setTotalScore(100);
                finalAssessment.setPassScore(60);
                finalAssessment.setTimeLimitMinutes(120);
                finalAssessment.setAttemptLimit(1);
                // finalAssessment.setShuffleQuestion(false);
                // finalAssessment.setShuffleOption(false);
                // finalAssessment.setStatus(AssessmentStatus.PUBLISHED);

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

                QuestionCategory oop = questionCategoryRepository
                                .findByName("OOP")
                                .orElseThrow(() -> new RuntimeException("OOP category not found"));

                QuestionCategory sql = questionCategoryRepository
                                .findByName("SQL")
                                .orElseThrow(() -> new RuntimeException("SQL category not found"));

                // ===== QUESTION 1 =====
                Question q1 = new Question();
                q1.setContent("Which keyword is used to inherit a class in Java?");
                q1.setQuestionType(QuestionType.SINGLE_CHOICE);
                q1.setCategory(javaCore);
                q1.setOptions(List.of(
                                createOption(q1, "extends", true, 1),
                                createOption(q1, "implements", false, 2),
                                createOption(q1, "inherits", false, 3),
                                createOption(q1, "super", false, 4)));

                // ===== QUESTION 2 =====
                Question q2 = new Question();
                q2.setContent("What is the default value of a boolean variable in Java?");
                q2.setQuestionType(QuestionType.SINGLE_CHOICE);
                q2.setCategory(javaCore);
                q2.setOptions(List.of(
                                createOption(q2, "true", false, 1),
                                createOption(q2, "false", true, 2),
                                createOption(q2, "null", false, 3),
                                createOption(q2, "0", false, 4)));

                // ===== QUESTION 3 =====
                Question q3 = new Question();
                q3.setContent("Which method must be implemented by all threads in Java?");
                q3.setQuestionType(QuestionType.SINGLE_CHOICE);
                q3.setCategory(javaCore);
                q3.setOptions(List.of(
                                createOption(q3, "start()", false, 1),
                                createOption(q3, "run()", true, 2),
                                createOption(q3, "execute()", false, 3),
                                createOption(q3, "begin()", false, 4)));

                // ===== QUESTION 4 =====
                Question q4 = new Question();
                q4.setContent("What are the principles of OOP? (Select all that apply)");
                q4.setQuestionType(QuestionType.MULTIPLE_CHOICE);
                q4.setCategory(oop);
                q4.setOptions(List.of(
                                createOption(q4, "Encapsulation", true, 1),
                                createOption(q4, "Inheritance", true, 2),
                                createOption(q4, "Polymorphism", true, 3),
                                createOption(q4, "Compilation", false, 4),
                                createOption(q4, "Abstraction", true, 5)));

                // ===== QUESTION 5 =====
                Question q5 = new Question();
                q5.setContent("Which keyword is used to prevent method overriding in Java?");
                q5.setQuestionType(QuestionType.SINGLE_CHOICE);
                q5.setCategory(oop);
                q5.setOptions(List.of(
                                createOption(q5, "static", false, 1),
                                createOption(q5, "final", true, 2),
                                createOption(q5, "abstract", false, 3),
                                createOption(q5, "private", false, 4)));

                // ===== QUESTION 6 =====
                Question q6 = new Question();
                q6.setContent("What is the purpose of a constructor in Java?");
                q6.setQuestionType(QuestionType.SINGLE_CHOICE);
                q6.setCategory(oop);
                q6.setOptions(List.of(
                                createOption(q6, "To initialize an object", true, 1),
                                createOption(q6, "To destroy an object", false, 2),
                                createOption(q6, "To copy an object", false, 3),
                                createOption(q6, "To compile a class", false, 4)));

                // ===== QUESTION 7 =====
                Question q7 = new Question();
                q7.setContent("Which SQL command is used to retrieve data from a database?");
                q7.setQuestionType(QuestionType.SINGLE_CHOICE);
                q7.setCategory(sql);
                q7.setOptions(List.of(
                                createOption(q7, "GET", false, 1),
                                createOption(q7, "SELECT", true, 2),
                                createOption(q7, "FETCH", false, 3),
                                createOption(q7, "RETRIEVE", false, 4)));

                // ===== QUESTION 8 =====
                Question q8 = new Question();
                q8.setContent("Which SQL clause is used to filter records?");
                q8.setQuestionType(QuestionType.SINGLE_CHOICE);
                q8.setCategory(sql);
                q8.setOptions(List.of(
                                createOption(q8, "FILTER", false, 1),
                                createOption(q8, "WHERE", true, 2),
                                createOption(q8, "HAVING", false, 3),
                                createOption(q8, "SORT", false, 4)));

                // ===== QUESTION 9 =====
                Question q9 = new Question();
                q9.setContent("What does JVM stand for?");
                q9.setQuestionType(QuestionType.SINGLE_CHOICE);
                q9.setCategory(javaCore);
                q9.setOptions(List.of(
                                createOption(q9, "Java Virtual Machine", true, 1),
                                createOption(q9, "Java Visual Monitor", false, 2),
                                createOption(q9, "Java Verified Method", false, 3),
                                createOption(q9, "Java Variable Manager", false, 4)));

                // ===== QUESTION 10 =====
                Question q10 = new Question();
                q10.setContent("Which of the following are access modifiers in Java? (Select all that apply)");
                q10.setQuestionType(QuestionType.MULTIPLE_CHOICE);
                q10.setCategory(javaCore);
                q10.setOptions(List.of(
                                createOption(q10, "public", true, 1),
                                createOption(q10, "private", true, 2),
                                createOption(q10, "protected", true, 3),
                                createOption(q10, "default", false, 4),
                                createOption(q10, "internal", false, 5)));

                questionRepository.saveAll(List.of(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10));

                log.info("Initialized 10 questions with options");
        }

        private QuestionOption createOption(Question question, String content, boolean isCorrect, int order) {
                QuestionOption option = new QuestionOption();
                option.setContent(content);
                option.setIsCorrect(isCorrect);
                option.setOrderIndex(order);
                option.setQuestion(question);
                return option;
        }

        private void linkQuestionsToAssessments() {
                if (assessmentQuestionRepository.count() > 0) {
                        return;
                }

                List<Assessment> assessments = assessmentRepository.findAll();
                List<Question> questions = questionRepository.findAll();

                if (assessments.isEmpty() || questions.isEmpty()) {
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
                if (entranceAssessment != null && questions.size() >= 4) {
                        for (int i = 0; i < 4; i++) {
                                assessmentQuestions.add(createAssessmentQuestion(entranceAssessment, questions.get(i),
                                                10.0, i + 1));
                        }
                }

                // Link questions 3-7 to Midterm Assessment (50 points total)
                if (midtermAssessment != null && questions.size() >= 7) {
                        for (int i = 2; i < 7; i++) {
                                assessmentQuestions.add(createAssessmentQuestion(midtermAssessment, questions.get(i),
                                                10.0, i - 1));
                        }
                }

                // Link all 10 questions to Final Assessment (100 points total)
                if (finalAssessment != null) {
                        for (int i = 0; i < questions.size(); i++) {
                                assessmentQuestions.add(createAssessmentQuestion(finalAssessment, questions.get(i),
                                                10.0, i + 1));
                        }
                }

                assessmentQuestionRepository.saveAll(assessmentQuestions);

                log.info("Linked {} questions to {} assessments", questions.size(), assessments.size());
        }

        private AssessmentQuestion createAssessmentQuestion(Assessment assessment, Question question, Double score,
                        int order) {
                AssessmentQuestion aq = new AssessmentQuestion();
                aq.setAssessment(assessment);
                aq.setQuestion(question);
                aq.setScore(score);
                aq.setOrderIndex(order);
                return aq;
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
                ProgrammingLanguage language = new ProgrammingLanguage();
                language.setName(name);
                language.setVersion(version);
                language.setDescription(description);
                language.setSupported(isSupported);
                return language;
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
