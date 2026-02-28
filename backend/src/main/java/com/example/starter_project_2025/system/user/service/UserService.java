package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UserService {

    Page<UserResponse> getAll(
            Pageable pageable,
            String search,
            List<UUID> roleIds,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive
    );

    UserResponse getById(UUID id);

    UserResponse create(UserCreateRequest request);

    UserResponse update(UUID id, UserUpdateRequest request);

    void delete(UUID id);

    User getCurrentUser();
}
