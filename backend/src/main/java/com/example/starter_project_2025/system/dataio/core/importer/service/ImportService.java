package com.example.starter_project_2025.system.dataio.core.importer.service;

import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import org.eclipse.angus.mail.imap.protocol.ID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ImportService {

    <T, ID> ImportResult importFile(
            MultipartFile file,
            Class<T> entityClass,
            JpaRepository<T, ID> repository
    );
}
