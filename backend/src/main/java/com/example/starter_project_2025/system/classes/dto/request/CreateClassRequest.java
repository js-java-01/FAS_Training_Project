package com.example.starter_project_2025.system.classes.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateClassRequest {

    @NotBlank(message = "Class name is required")
    @Pattern(
            regexp = "^(?=.*\\p{L})[\\p{L}\\p{N} _-]+$",
            message = "Class name must contain at least one letter and only letters, numbers, spaces, '-' or '_' are allowed"
    )
    @Schema(example = "HCM_Java_24")
    private String className;


    @NotBlank (message = "Class code is required")
    @Schema(example = "HCM-JV-24")
    private String classCode;

    @NotNull (message = "Semester ID is required")
    @Schema(example = "9ad6df34-212b-4808-ac2f-5af79299ea8d")
    private UUID semesterId;

    @NotNull (message = "Training program ID is required")
    @Schema(example = "9ad6df34-212b-4808-ac2f-5af79299ea8d")
    UUID trainingProgramId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @NotNull (message = "Start date is required")
    @Schema(example = "2026-03-16")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(example = "2026-4-25")
    @NotNull (message = "End date is required")
    private LocalDate endDate;
}