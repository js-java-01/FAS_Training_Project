package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TopicApplyAiPreviewRequest {
    private List<TopicAiPreviewLessonResponse> lessons;
}
