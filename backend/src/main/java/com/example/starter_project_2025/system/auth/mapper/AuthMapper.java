package com.example.starter_project_2025.system.auth.mapper;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    @Mapping(target = "token", ignore = true)
    @Mapping(target = "role", expression = "java(userDetails.getRole())")
    LoginResponse toLoginResponse(UserDetailsImpl userDetails);
}
