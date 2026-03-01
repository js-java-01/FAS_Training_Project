package com.example.starter_project_2025.system.user.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserFilter;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController extends BaseCrudDataIoController<
        User,
        UUID,
        UserResponse,
        UserCreateRequest,
        UserUpdateRequest,
        UserFilter> {

    UserService service;
    UserRepository repository;

    @Override
    protected CrudService<UUID, UserResponse, UserCreateRequest, UserUpdateRequest, UserFilter> getService() {
        return service;
    }

    @Override
    protected BaseRepository<User, UUID> getRepository() {
        return repository;
    }

    @Override
    protected Class<User> getEntityClass() {
        return User.class;
    }
}
