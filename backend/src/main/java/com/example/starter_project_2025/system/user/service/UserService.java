package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface UserService {

    Page<UserResponse> getUsersPage(
            Pageable pageable,
            String search,
            UUID roleId,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive
    );

    UserResponse getUserById(UUID id);

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(UUID id, UserUpdateRequest request);

    void deleteUser(UUID id);

    UserResponse toggleUserStatus(UUID id);

    UserResponse assignRole(UUID userId, UUID roleId);

    User getCurrentUser();
}
