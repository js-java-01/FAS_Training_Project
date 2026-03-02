package com.example.starter_project_2025.system.location.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

public interface LocationImportExportService {

    byte[] exportLocations(String format); // csv | xlsx

    ImportResultResponse importLocations(MultipartFile file);

    byte[] downloadImportTemplate();

}
