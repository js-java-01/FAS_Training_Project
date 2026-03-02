package com.example.starter_project_2025.system.topic.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class TopicLessonResponse {
    private UUID id;
    private String lessonName;
    private String description;
    private Integer lessonOrder;
    private UUID topicId;
}
