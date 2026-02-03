package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface ModuleImportExportService {

    ResponseEntity<byte[]> downloadTemplate();

    ImportResultResponse importExcel(MultipartFile file);

    ResponseEntity<byte[]> exportExcel();
}
