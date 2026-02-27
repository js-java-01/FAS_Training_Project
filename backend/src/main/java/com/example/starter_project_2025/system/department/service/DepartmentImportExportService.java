package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.dto.DepartmentImportResult;
import org.springframework.web.multipart.MultipartFile;

public interface DepartmentImportExportService {

    byte[] exportDepartments(String format); // csv | xlsx

    DepartmentImportResult importDepartments(MultipartFile[] files);

    byte[] downloadImportTemplate();
}