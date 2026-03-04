package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.AiPreviewLessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.ApplyAiPreviewOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.BatchCreateOnlineRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BatchOutlineOnlineService {
    void createBatch(BatchCreateOnlineRequest request);

    ResponseEntity<byte[]> exportOutline(UUID courseId);

    ResponseEntity<byte[]> downloadTemplate();

    ImportResultResponse importOutline(UUID courseId, MultipartFile file);

    List<AiPreviewLessonOnlineResponse> generatePreview(UUID courseId);

    void applyPreview(UUID courseId, ApplyAiPreviewOnlineRequest request);

    void validate(ApplyAiPreviewOnlineRequest request);

    void cloneOutlineFromTopic(UUID courseId, UUID topicId);
}
