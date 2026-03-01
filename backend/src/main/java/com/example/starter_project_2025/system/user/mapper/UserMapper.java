package com.example.starter_project_2025.system.user.mapper;

import com.example.starter_project_2025.base.mapper.BaseMapper;
import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import org.mapstruct.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseMapper<
        User,
        UserResponse,
        UserCreateRequest,
        UserUpdateRequest> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    User toEntity(UserCreateRequest request);

    @Override
    @Mapping(target = "roleIds", expression = "java(mapRoleIds(user))")
    UserResponse toResponse(User user);

    @Override
    @Mapping(target = "passwordHash", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget User user, UserUpdateRequest dto);

    default Set<UUID> mapRoleIds(User user) {
        if (user.getUserRoles() == null) return null;

        return user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getId())
                .collect(Collectors.toSet());
    }
}
