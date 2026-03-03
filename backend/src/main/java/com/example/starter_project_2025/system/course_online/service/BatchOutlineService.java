package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.course_online.dto.AiPreviewLessonResponse;
import com.example.starter_project_2025.system.course_online.dto.ApplyAiPreviewRequest;
import com.example.starter_project_2025.system.course_online.dto.BatchCreateRequest;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BatchOutlineService {
    void createBatch(BatchCreateRequest request);

    ResponseEntity<byte[]> exportOutline(UUID courseId);

    ResponseEntity<byte[]> downloadTemplate();

    ImportResultResponse importOutline(UUID courseId, MultipartFile file);

    List<AiPreviewLessonResponse> generatePreview(UUID courseId);

    void applyPreview(UUID courseId, ApplyAiPreviewRequest request);

    void validate(ApplyAiPreviewRequest request);

    void cloneOutlineFromTopic(UUID courseId, UUID topicId);
}
