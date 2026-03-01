package com.example.starter_project_2025.system.user.mapper;

import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "roleIds", expression = "java(mapRoleIds(user))")
    UserResponse toResponse(User user);

    @Mapping(target = "passwordHash", ignore = true)
    void update(@MappingTarget User user, UserUpdateRequest dto);

    default Set<UUID> mapRoleIds(User user) {
        if (user.getUserRoles() == null) return null;

        return user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getId())
                .collect(Collectors.toSet());
    }
}
