package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TopicSessionBatchItem {
    private String deliveryType;
    private String trainingFormat;
    private Integer duration;
    private List<UUID> learningObjectiveIds;
    private String content;
    private String note;
}
