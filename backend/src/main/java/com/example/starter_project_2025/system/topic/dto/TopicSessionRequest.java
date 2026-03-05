package com.example.starter_project_2025.system.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TopicSessionRequest {

    @NotNull(message = "Lesson is required")
    private UUID lessonId;

    @NotBlank(message = "Delivery type is required")
    private String deliveryType;

    private String trainingFormat;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    private Integer duration;

    @NotNull(message = "Session order is required")
    @Positive(message = "Session order must be greater than 0")
    private Integer sessionOrder;

    private List<UUID> learningObjectiveIds;

    private String content;

    private String note;
}
