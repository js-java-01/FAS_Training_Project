package com.example.starter_project_2025.system.classes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class CreateTrainingClassRequest {

    @NotBlank
    @Pattern(regexp = "^[^0-9]+$", message = "Class name must not contain numbers")
    private String className;


    @NotBlank
    private String classCode;

    @NotNull
    private UUID semesterId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}