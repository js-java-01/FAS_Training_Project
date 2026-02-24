package com.example.starter_project_2025.system.user.mapper;

import com.example.starter_project_2025.system.user.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.user.dto.StudentDTO;
import com.example.starter_project_2025.system.user.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StudentMapper
{

    Student toEntity(CreateStudentRequest request);

    StudentDTO toResponse(Student student);

    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "role", ignore = true)
    void update(@MappingTarget Student student, StudentDTO dto);
}
