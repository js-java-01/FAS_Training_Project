package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

@Data
public class TopicTimeAllocationDTO {

    private Double trainingHours;
    private Double practiceHours;
    private Double selfStudyHours;
    private Double coachingHours;
    private String notes;

    // Computed fields (set by service, ignored on input)
    private Double assessmentHours;
    private Double totalHours;
}
