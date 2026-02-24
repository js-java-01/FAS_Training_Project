package com.example.starter_project_2025.system.location.service;

import com.example.starter_project_2025.system.location.dto.LocationImportResult;
import org.springframework.web.multipart.MultipartFile;

public interface LocationImportExportService {

    byte[] exportLocations(String format); // csv | xlsx

    LocationImportResult importLocations(MultipartFile[] files);

    byte[] downloadImportTemplate();

}
