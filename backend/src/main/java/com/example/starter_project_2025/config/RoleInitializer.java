package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.rbac.permission.Permission;
import com.example.starter_project_2025.system.rbac.permission.PermissionRepository;
import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.rbac.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RoleInitializer {
        private final RoleRepository roleRepository;
        private final PermissionRepository permissionRepository;

        private void createRoleIfNotFound(String roleName, String description, Set<Permission> permissions,
                        int hierarchyLevel) {
                var existing = roleRepository.findByName(roleName);
                if (existing.isEmpty()) {
                        Role role = new Role();
                        role.setName(roleName);
                        role.setDescription(description);
                        role.setPermissions(permissions);
                        role.setHierarchyLevel(hierarchyLevel);
                        roleRepository.save(role);
                } else {
                        // Always sync permissions so newly added permissions are picked up
                        Role role = existing.get();
                        role.setPermissions(permissions);
                        if (role.getHierarchyLevel() == null || role.getHierarchyLevel() == 0) {
                                role.setHierarchyLevel(hierarchyLevel);
                        }
                        roleRepository.save(role);
                }
        }

        private void initializeTrainerRole() {

                var existing = roleRepository.findByName("TRAINER");
                if (existing.isPresent()) {
                        // Ensure hierarchyLevel is set
                        Role role = existing.get();
                        if (role.getHierarchyLevel() == null || role.getHierarchyLevel() == 0) {
                                role.setHierarchyLevel(4);
                                roleRepository.save(role);
                        }
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
                trainerRole.setDescription("Trainer with course/lesson/assessment management access");
                trainerRole.setPermissions(trainerPermissions);
                trainerRole.setHierarchyLevel(4);

                roleRepository.save(trainerRole);

        }

        public void initializeRoles() {

                // ADMIN
                List<String> excludedAdminPermissions = List.of(
                                "MODULE_GROUP_CREATE",
                                "MODULE_CREATE");
                Set<Permission> adminPermissions = new HashSet<>(permissionRepository.findAll()
                                .stream()
                                .filter(p -> !excludedAdminPermissions.contains(p.getName()))
                                .toList());
                createRoleIfNotFound("ADMIN", "Administrator with full system access", adminPermissions, 2);

                // STUDENT
                List<Permission> studentPermissions = new ArrayList<>(
                                permissionRepository.findByAction("READ"));
                permissionRepository.findByName("ENROLL_COURSE")
                                .ifPresent(studentPermissions::add);
                List<String> excludedStudentPermissions = List.of(
                                "ROLE_READ",
                                "USER_READ",
                                "PERMISSION_READ",
                                "SEMESTER_READ",
                                "STUDENT_READ",
                                "LOCATION_READ",
                                "DEPARTMENT_READ");
                Set<Permission> filteredPermissions = studentPermissions.stream()
                                .filter(p -> !excludedStudentPermissions.contains(p.getName()))
                                .collect(Collectors.toSet());
                createRoleIfNotFound("STUDENT", "Student with limited access to educational resources",
                                filteredPermissions, 5);

                // TRAINER
                initializeTrainerRole();

                // SUPER_ADMIN
                createRoleIfNotFound("SUPER_ADMIN",
                                "Super Administrator with all permissions and role-switch capability",
                                new HashSet<>(permissionRepository.findAll()), 1);

                // MANAGER
                List<Permission> allPermissions = permissionRepository.findAll();
                Set<Permission> managerPermissions = allPermissions.stream()
                                .filter(p -> "UPDATE".equals(p.getAction())
                                                && Arrays.asList("STUDENT").contains(p.getResource())
                                                || "READ".equals(p.getAction()) && Arrays.asList("MENU", "SEMESTER",
                                                                "SIDEBAR", "DASHBOARD", "MODULE")
                                                                .contains(p.getResource())
                                                || "CLASS".equals(p.getResource())
                                                || "COURSE".equals(p.getResource())
                                                || "SEMESTER".equals(p.getResource()))
                                .collect(Collectors.toSet());
                createRoleIfNotFound("MANAGER", "Manager with class and course management permissions",
                                managerPermissions, 3);

        }

}
