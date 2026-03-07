package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicApplyAiPreviewRequest;
import com.example.starter_project_2025.system.topic.dto.TopicBatchCreateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TopicBatchOutlineService {

    void createBatch(TopicBatchCreateRequest request);

    ResponseEntity<byte[]> exportOutline(UUID topicId);

    ResponseEntity<byte[]> downloadTemplate();

    ImportResultResponse importOutline(UUID topicId, MultipartFile file);

    List<TopicAiPreviewLessonResponse> generateAiPreview(UUID topicId);

    void applyAiPreview(UUID topicId, TopicApplyAiPreviewRequest request);
}
