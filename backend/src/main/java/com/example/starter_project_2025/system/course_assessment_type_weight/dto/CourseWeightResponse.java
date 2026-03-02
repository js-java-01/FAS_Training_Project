package com.example.starter_project_2025.system.course_assessment_type_weight.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Configured assessment type weight for a course")
public class CourseWeightResponse {

    @Schema(description = "Weight record ID")
    private UUID id;

    @Schema(description = "ID of the course this weight belongs to")
    private UUID courseId;

    @Schema(description = "Course name", example = "Java Fundamentals")
    private String courseName;

    @Schema(description = "ID of the AssessmentType", example = "uuid-string")
    private String assessmentTypeId;

    @Schema(description = "Name of the AssessmentType", example = "Entrance Quiz")
    private String assessmentTypeName;

    @Schema(description = "Weight in final score calculation (0.0 – 1.0)", example = "0.30")
    private Double weight;

    @Schema(description = "Grading method applied across all columns of this type",
            example = "HIGHEST",
            allowableValues = {"HIGHEST", "LATEST", "AVERAGE"})
    private String gradingMethod;
}
