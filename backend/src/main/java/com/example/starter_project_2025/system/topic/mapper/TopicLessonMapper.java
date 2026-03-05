package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.TopicLessonResponse;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import org.springframework.stereotype.Component;

@Component
public class TopicLessonMapper {

    public TopicLessonResponse toResponse(TopicLesson entity) {
        return TopicLessonResponse.builder()
                .id(entity.getId())
                .lessonName(entity.getLessonName())
                .description(entity.getDescription())
                .lessonOrder(entity.getLessonOrder())
                .topicId(entity.getTopic().getId())
                .build();
    }
}
