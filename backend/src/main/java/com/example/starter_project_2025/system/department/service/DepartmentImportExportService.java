package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

public interface DepartmentImportExportService {

    byte[] exportDepartments(String format); // csv | xlsx

    ImportResultResponse importDepartments(MultipartFile file);

    byte[] downloadImportTemplate();
}