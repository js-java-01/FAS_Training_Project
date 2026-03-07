package com.example.starter_project_2025.system.topic.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TopicSessionResponse {
    private UUID id;
    private UUID lessonId;
    private String deliveryType;
    private String trainingFormat;
    private Integer duration;
    private Integer sessionOrder;
    private List<UUID> learningObjectiveIds;
    private String content;
    private String note;
}
