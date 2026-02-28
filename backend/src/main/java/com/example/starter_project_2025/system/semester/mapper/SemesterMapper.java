package com.example.starter_project_2025.system.semester.mapper;

import com.example.starter_project_2025.system.semester.dto.SemesterResponse;
import com.example.starter_project_2025.system.semester.entity.Semester;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SemesterMapper
{
    SemesterResponse toSemesterResponse(Semester semester);

}
