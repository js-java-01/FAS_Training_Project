package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    Department create(DepartmentDTO dto);
    List<DepartmentDTO> getAll();
    //void delete(Long id);

    DepartmentDTO getById(UUID id);

    Department update(UUID id, DepartmentDTO dto);

    void delete(UUID id);
}