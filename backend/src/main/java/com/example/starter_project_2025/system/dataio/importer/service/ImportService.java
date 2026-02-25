package com.example.starter_project_2025.system.dataio.importer.service;

import com.example.starter_project_2025.system.dataio.importer.result.ImportResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ImportService {

    <T> ImportResult importFile(
            MultipartFile file,
            Class<T> entityClass,
            JpaRepository<T, UUID> repository
    );
}
