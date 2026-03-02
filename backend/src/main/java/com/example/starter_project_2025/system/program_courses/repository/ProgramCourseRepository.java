package com.example.starter_project_2025.system.program_courses.repository;

import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface ProgramCourseRepository extends JpaRepository<ProgramCourse, UUID> {

    Set<ProgramCourse> findByIdIn(Set<UUID> ids);

    boolean existsByTrainingProgram_Id(UUID trainingProgramId);
}