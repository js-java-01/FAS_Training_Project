package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UserService {

    List<User> findAll();

    Page<UserDTO> getAllUsers(
            String searchContent,
            UUID roleId,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive,
            Pageable pageable
    );

    UserDTO getUserById(UUID id);

    UserDTO createUser(CreateUserRequest request);

    UserDTO updateUser(UUID id, UserDTO request);

    void deleteUser(UUID id);

    UserDTO toggleUserStatus(UUID id);

    UserDTO assignRole(UUID userId, UUID roleId);

    User findByEmail(String email);

    User getCurrentUser();
}
