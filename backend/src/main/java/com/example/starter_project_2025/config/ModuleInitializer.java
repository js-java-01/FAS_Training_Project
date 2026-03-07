package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@RequiredArgsConstructor
@Service
public class ModuleInitializer {
        private final ModuleGroupsRepository moduleGroupsRepository;
        private final ModuleRepository moduleRepository;

        private com.example.starter_project_2025.system.modulegroups.entity.Module createModule(ModuleGroups group,
                        String title, String url, String icon,
                        int order, String permission, String description) {
                com.example.starter_project_2025.system.modulegroups.entity.Module module = new Module();
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

        public void initializeModuleGroups() {

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

                                createModule(trainingGroup, "Classes", "/classes", "people", 6,
                                                "CLASS_READ",
                                                "User search and view classes"),
                                createModule(trainingGroup, "Semesters", "/semesters", "LayoutGrid", 6,
                                                "SEMESTER_ADMIN_READ",
                                                "User search and view classes"),
                                createModule(trainingGroup, "Topics", "/topics", "library", 1,
                                                "TOPIC_READ",
                                                "User search and view topics"),
                                createModule(trainingGroup, "Programs", "/programs", "book", 7,
                                                "TRAINING_PROGRAM_READ",
                                                "Manage training programs"),

                                createModule(trainingGroup, "Skills", "/skills", "award", 8,
                                                "TOPIC_READ",
                                                "Manage training skills"),

                                createModule(trainingGroup, "Skill Groups", "/skillGroups", "users", 9,
                                                "TOPIC_READ",
                                                "Manage skill groups")));

                /*
                 * =======================================================
                 * MODULE GROUP: Assessment
                 * =======================================================
                 */
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
                                                "Manage assessment types"));
        }

}
