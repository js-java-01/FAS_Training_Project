package com.example.starter_project_2025.system.classes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;

import java.util.UUID;

@Repository
public interface TrainingClassRepository extends JpaRepository<TrainingClass, UUID> {

    boolean existsByClassNameIgnoreCase(String className);

    boolean existsByClassCodeIgnoreCase(String classCode);
}