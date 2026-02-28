package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data // Cái này để tự sinh Getter/Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
@Table(name = "question_categories")
public class QuestionCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    @ImportField(name = "Name")
    @ExportField(name = "Name")
    String name;

    @ImportField(name = "Description")
    @ExportField(name = "Description")
    String description;

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