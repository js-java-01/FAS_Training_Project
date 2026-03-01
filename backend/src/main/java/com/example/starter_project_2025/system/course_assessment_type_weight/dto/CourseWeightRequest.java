package com.example.starter_project_2025.system.course_assessment_type_weight.dto;

import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create or update a course assessment type weight")
public class CourseWeightRequest {

    @NotBlank(message = "assessmentTypeId is required")
    @Schema(description = "ID of the AssessmentType", example = "uuid-string", required = true)
    private String assessmentTypeId;

    @NotNull(message = "weight is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "weight must be greater than 0")
    @DecimalMax(value = "1.0", inclusive = true, message = "weight must be at most 1.0")
    @Schema(description = "Weight of this assessment type in final score (0.0 – 1.0)", example = "0.30", required = true)
    private Double weight;

    @NotNull(message = "gradingMethod is required")
    @Schema(description = "How scores across multiple columns of this type are combined",
            example = "HIGHEST",
            allowableValues = {"HIGHEST", "LATEST", "AVERAGE"},
            required = true)
    private GradingMethod gradingMethod;
}
