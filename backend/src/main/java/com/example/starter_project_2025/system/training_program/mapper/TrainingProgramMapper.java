package com.example.starter_project_2025.system.training_program.mapper;

import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TrainingProgramMapper {

    public TrainingProgramResponse toResponse(TrainingProgram entity) {

        return TrainingProgramResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .version(entity.getVersion())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .programCourseIds(
                        entity.getProgramCourses() == null ? null :
                                entity.getProgramCourses()
                                        .stream()
                                        .map(ProgramCourse::getId)
                                        .collect(Collectors.toSet())
                )
                .build();
    }



}