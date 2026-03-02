package com.example.starter_project_2025.system.classes.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewClassRequest {
    @Schema(example = "Wait for next semester to assign more resources")
    private String reviewReason;
}

