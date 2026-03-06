package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.rbac.role.RoleRepository;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import com.example.starter_project_2025.system.rbac.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserRoleInitializer {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private void assignRoleIfNotFound(User user, Role role, boolean isDefault) {
        if (userRoleRepository.findByUserAndRole(user, role).isEmpty()) {
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRole.setDefault(isDefault);
            userRoleRepository.save(userRole);
        }
    }

    public void initializeUserRoles() {

        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new RuntimeException("Role SUPER ADMIN not found"));
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
        Role managerRole = roleRepository.findByName("MANAGER")
                .orElseThrow(() -> new RuntimeException("Role MANAGER not found"));
        Role trainerRole = roleRepository.findByName("TRAINER")
                .orElseThrow(() -> new RuntimeException("Role TRAINER not found"));
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));

        User admin1 = userRepository.findByEmail("admin@example.com").orElseThrow();
        User superadmin = userRepository.findByEmail("superadmin@example.com").orElseThrow();

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

        assignRoleIfNotFound(superadmin, superAdminRole, true);

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
    }

}
