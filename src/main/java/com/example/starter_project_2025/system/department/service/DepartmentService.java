package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import com.example.starter_project_2025.system.department.entity.Department;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface DepartmentService {

    Department create(DepartmentDTO dto);
    List<DepartmentDTO> getAll();

    //xoá
    void deleteDepartment(Long id);

    byte[] generateImportTemplate() throws IOException;

    void importDepartments(MultipartFile file) throws IOException;

    byte[] exportDepartments() throws IOException;
}