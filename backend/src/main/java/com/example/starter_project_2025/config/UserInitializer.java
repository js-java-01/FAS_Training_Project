package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
    public void initializeUsers() {
        // SUPER ADMIN
        createUserIfNotFound("superadmin@example.com", "Super", "Admin");
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
    }

}
