package com.example.starter_project_2025.system.student.repository;

import com.example.starter_project_2025.system.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByUserId(UUID userId);
    boolean existsByStudentId(String studentId);
    boolean existsByUserId(UUID userId);
}
