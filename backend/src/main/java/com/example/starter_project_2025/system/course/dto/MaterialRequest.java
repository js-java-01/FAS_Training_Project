package com.example.starter_project_2025.system.course.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
public class MaterialRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Material type is required")
    private String type; // VIDEO, DOCUMENT, LINK, IMAGE, AUDIO

    @NotBlank(message = "Source URL is required")
    private String sourceUrl;

    private String tags;

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
