package com.example.starter_project_2025.system.semester.repository;

import com.example.starter_project_2025.system.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SemesterRepository extends JpaRepository<Semester, UUID> {
}
