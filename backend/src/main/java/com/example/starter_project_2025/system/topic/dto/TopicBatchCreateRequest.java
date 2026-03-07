package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class TopicBatchCreateRequest {

    private UUID topicId;
    private List<LessonItem> lessons;

    @Getter
    @Setter
    public static class LessonItem {
        private String lessonName;
        private String description;
        private List<SessionItem> sessions;
    }

    @Getter
    @Setter
    public static class SessionItem {
        private String deliveryType;
        private String content;
        private String note;
        private Integer duration;
        private Integer sessionOrder;
    }
}
