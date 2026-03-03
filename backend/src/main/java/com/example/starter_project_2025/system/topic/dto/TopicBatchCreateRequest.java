package com.example.starter_project_2025.system.topic.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TopicBatchCreateRequest {

    @NotNull
    private UUID topicId;

    @NotEmpty
    private List<TopicLessonBatchItem> lessons;
}
