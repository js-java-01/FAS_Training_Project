package com.example.starter_project_2025.system.programminglanguage.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProgrammingLanguageResponse {
    UUID id;
    String name;
    String version;
    String description;
    boolean isSupported;
    LocalDateTime createdAt;
}
