package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserImportExportService {

    ImportResultResponse importUsers(MultipartFile file);

    byte[] downloadImportTemplate();
}
