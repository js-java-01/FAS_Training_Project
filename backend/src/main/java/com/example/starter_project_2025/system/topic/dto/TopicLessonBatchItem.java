package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

import java.util.List;

@Data
public class TopicLessonBatchItem {
    private String lessonName;
    private String description;
    private List<TopicSessionBatchItem> sessions;
}
