package com.example.starter_project_2025.system.department.repository;

import com.example.starter_project_2025.system.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // Custom query method to check for unique code (Business Rule)
    boolean existsByCode(String code);


}

