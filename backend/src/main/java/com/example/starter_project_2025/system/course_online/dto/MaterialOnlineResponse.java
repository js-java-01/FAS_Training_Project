package com.example.starter_project_2025.system.course_online.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MaterialOnlineResponse {
    private UUID id;
    private String title;
    private String description;
    private String type;
    private String sourceUrl;
    private String tags;
    private UUID sessionId;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
