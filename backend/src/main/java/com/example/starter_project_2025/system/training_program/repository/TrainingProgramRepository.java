package com.example.starter_project_2025.system.training_program.repository;

import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface TrainingProgramRepository
        extends JpaRepository<TrainingProgram, UUID>,
        JpaSpecificationExecutor<TrainingProgram> {

    boolean existsByNameIgnoreCase(String name);

}