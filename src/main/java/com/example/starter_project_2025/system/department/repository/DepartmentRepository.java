package com.example.starter_project_2025.system.department.repository;

import com.example.starter_project_2025.system.department.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}