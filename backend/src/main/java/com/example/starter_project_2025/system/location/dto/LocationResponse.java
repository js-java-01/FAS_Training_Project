package com.example.starter_project_2025.system.location.dto;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponse {
    private UUID id;
    private String name;
    private String address;
    private String communeId;
    private String communeName;
    private String provinceName;
    private LocationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
