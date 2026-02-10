package com.example.starter_project_2025.system.assessment.submission.dto.request;

import java.util.UUID;

public class StartSubmissionRequest {

    private UUID assessmentTypeId;

    public UUID getAssessmentTypeId() {
        return assessmentTypeId;
    }

    public void setAssessmentTypeId(UUID assessmentTypeId) {
        this.assessmentTypeId = assessmentTypeId;
    }
}

