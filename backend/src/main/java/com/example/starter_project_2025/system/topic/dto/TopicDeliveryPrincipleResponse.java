package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TopicDeliveryPrincipleResponse {

    private UUID id;

    private Integer maxTraineesPerClass;
    private Integer minTrainerLevel;
    private Integer minMentorLevel;

    private String trainingGuidelines;
    private String markingPolicy;
    private String waiverNotes;
    private String otherNotes;
}
