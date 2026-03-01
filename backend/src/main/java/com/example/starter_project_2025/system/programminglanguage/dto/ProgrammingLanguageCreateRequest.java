package com.example.starter_project_2025.system.programminglanguage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProgrammingLanguageCreateRequest
{
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be at most 255 characters")
    String name;

    @Size(max = 255, message = "Version must be at most 255 characters")
    String version;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    String description;
}
