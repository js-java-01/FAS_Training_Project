package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.BatchCreateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface BatchOutlineService {
    void createBatch(BatchCreateRequest request);

    ResponseEntity<byte[]> exportOutline(UUID courseId);

    ResponseEntity<byte[]> downloadTemplate();

    void importOutline(UUID courseId, MultipartFile file);
}
