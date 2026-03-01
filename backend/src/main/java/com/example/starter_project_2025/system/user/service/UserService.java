package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserFilter;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;

import java.util.UUID;

public interface UserService extends CrudService<
        UUID,
        UserResponse,
        UserCreateRequest,
        UserUpdateRequest,
        UserFilter
        > {

    User getCurrentUser();
}
