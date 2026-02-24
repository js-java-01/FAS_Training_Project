package com.example.starter_project_2025.system.user.mapper;

import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(CreateUserRequest request);

    UserDTO toResponse(User user);

    void update(@MappingTarget User user, UserDTO dto);
}
