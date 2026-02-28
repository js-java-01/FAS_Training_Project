package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@ImportEntity("assessment_type")
@ExportEntity(fileName = "assessment_types", sheetName = "AssessmentTypes")
public class AssessmentType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ImportField(name = "Name", required = true)
    @ExportField(name = "Name")
    @NotBlank(message = "name is required")
    @Size(min = 5, max = 255, message = "name must be at most 255 characters")
    String name;

    @ImportField(name = "Description")
    @ExportField(name = "Description")
    @Size(min = 10, max = 250, message = "description must be at most 1000 characters")
    String description;

    @OneToMany(mappedBy = "assessmentType")
    @JsonManagedReference
    Set<CourseAssessmentTypeWeight> courseAssessmentTypeWeights;

    LocalDate createdAt;
    LocalDate updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
