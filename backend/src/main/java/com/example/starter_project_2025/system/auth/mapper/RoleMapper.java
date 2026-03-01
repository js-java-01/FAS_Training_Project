package com.example.starter_project_2025.system.auth.mapper;

import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import org.mapstruct.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "permissions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Role toEntity(RoleCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "permissions", ignore = true)
    void update(@MappingTarget Role role, RoleUpdateRequest request);

    @Mapping(target = "permissionIds", source = "permissions")
    RoleResponse toResponse(Role role);

    default Set<UUID> mapPermissionIds(Set<Permission> permissions) {
        if (permissions == null) return new HashSet<>();
        return permissions.stream()
                .map(Permission::getId)
                .collect(Collectors.toSet());
    }
}
