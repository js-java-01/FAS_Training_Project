package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewLessonResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;

import java.util.List;

public interface TopicAiService {
    List<TopicAiPreviewLessonResponse> generatePreview(Topic topic);
}
