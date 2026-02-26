package com.example.starter_project_2025.system.assessment.dto.submission.request;

import lombok.Data;

import java.util.UUID;


@Data
public class StartSubmissionRequest {

    private Long assessmentId;
    
    private UUID courseClassId;

}

