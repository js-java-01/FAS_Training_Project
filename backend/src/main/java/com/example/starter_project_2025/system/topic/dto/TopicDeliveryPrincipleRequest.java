package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

@Data
public class TopicDeliveryPrincipleRequest {

    private Integer maxTraineesPerClass;
    private Integer minTrainerLevel;
    private Integer minMentorLevel;

    private String trainingGuidelines;
    private String markingPolicy;
    private String waiverNotes;
    private String otherNotes;
}
