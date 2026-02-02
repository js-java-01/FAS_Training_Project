package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.Department;
import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import java.util.List;

public interface DepartmentService {
    Department create(DepartmentDTO dto);
    List<DepartmentDTO> getAll();
    void delete(Long id);
}