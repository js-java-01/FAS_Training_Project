package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.dto.CreateDepartmentRequest;
import com.example.starter_project_2025.system.department.entity.Department;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface DepartmentService {

    // Lấy danh sách
    List<Department> getAllDepartments();

    // Tạo mới
    Department createDepartment(CreateDepartmentRequest request);

    //xoá
    void deleteDepartment(UUID id);

    byte[] generateImportTemplate() throws IOException;

    void importDepartments(MultipartFile file) throws IOException;

    byte[] exportDepartments() throws IOException;
}