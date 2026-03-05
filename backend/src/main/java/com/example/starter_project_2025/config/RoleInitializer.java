package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;

import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RoleInitializer {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private void createRoleIfNotFound(String roleName, String description, Set<Permission> permissions) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(description);
            role.setPermissions(permissions);

            roleRepository.save(role);
        }
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
        trainerRole.setHierarchyLevel(4);
        trainerRole.setDescription("Trainer with course/lesson/assessment management access");
        trainerRole.setPermissions(trainerPermissions);

        roleRepository.save(trainerRole);

    }

    public void initializeRoles() {

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

}
