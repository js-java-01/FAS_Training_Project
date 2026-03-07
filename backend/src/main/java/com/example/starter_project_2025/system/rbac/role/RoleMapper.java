package com.example.starter_project_2025.system.rbac.role;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.system.rbac.permission.Permission;
import org.mapstruct.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper extends BaseCrudMapper<Role, RoleDTO> {

    @Override
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "permissions", ignore = true)
    Role toEntity(RoleDTO request);

    @Override
    @Mapping(target = "permissionIds", source = "permissions")
    RoleDTO toResponse(Role role);

    @Override
    @Mapping(target = "permissions", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget Role role, RoleDTO request);

    default Set<UUID> mapPermissionIds(Set<Permission> permissions) {
        if (permissions == null) return new HashSet<>();
        return permissions.stream()
                .map(Permission::getId)
                .collect(Collectors.toSet());
    }
}
