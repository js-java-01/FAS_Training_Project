package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.AssessmentType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class AssessmentComponentResponse {
    private UUID id;
    private String name;
    private AssessmentType type;
    private Integer count;
    private Double weight;
    private Integer duration;
    private Integer displayOrder;
    private Boolean isGraded;
    private String note;
}
