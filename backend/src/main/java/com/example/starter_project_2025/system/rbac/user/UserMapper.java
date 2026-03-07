package com.example.starter_project_2025.system.rbac.user;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseCrudMapper<User, UserDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    User toEntity(UserDTO request);

    @Override
    @Mapping(target = "roleIds", expression = "java(mapRoleIds(user))")
    @Mapping(target = "roleNames", expression = "java(mapRoleNames(user))")
    UserDTO toResponse(User user);

    @Override
    @Mapping(target = "passwordHash", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget User user, UserDTO dto);

    default Set<UUID> mapRoleIds(User user) {
        if (user.getUserRoles() == null)
            return null;

        return user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getId())
                .collect(Collectors.toSet());
    }

    default Set<String> mapRoleNames(User user) {
        if (user.getUserRoles() == null)
            return null;

        return user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toSet());
    }
}
