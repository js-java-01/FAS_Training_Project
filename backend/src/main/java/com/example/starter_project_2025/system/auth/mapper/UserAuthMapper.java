package com.example.starter_project_2025.system.auth.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.user.entity.User;

@Mapper(componentModel = "spring")
public interface UserAuthMapper {
    @Mapping(target = "id", ignore = true)
    User toEntity(RegisterCreateDTO registerCreateDTO);
}
