package com.example.starter_project_2025.system.user.repository;

import com.example.starter_project_2025.system.user.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StudentRepository extends
        JpaRepository<Student, UUID>,
        JpaSpecificationExecutor<Student>
{

    boolean existsByStudentCode(String studentCode);

    boolean existsByPhone(String phone);
}