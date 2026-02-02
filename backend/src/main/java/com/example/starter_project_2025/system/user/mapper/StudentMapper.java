package com.example.starter_project_2025.system.user.mapper;

import com.example.starter_project_2025.system.user.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.user.dto.StudentDTO;
import com.example.starter_project_2025.system.user.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Student toEntity(CreateStudentRequest request);

    @Mapping(target = "roleId", source = "role.id")
    @Mapping(target = "roleName", source = "role.name")
    StudentDTO toResponse(Student user);

    void update(@MappingTarget Student user, StudentDTO dto);
}
