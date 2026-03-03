package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicBatchCreateRequest;
import com.example.starter_project_2025.system.topic.service.TopicBatchOutlineService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/topics/batch-outline")
@Tag(name = "Topic Batch Outline", description = "Create batch lessons and sessions for topic")
@SecurityRequirement(name = "bearerAuth")
public class TopicBatchOutlineController {

    private final TopicBatchOutlineService topicBatchOutlineService;

    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<Void> createBatch(@Valid @RequestBody TopicBatchCreateRequest request) {
        topicBatchOutlineService.createBatch(request);
        return ResponseEntity.ok().build();
    }
}
