package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "question_tags")
@ImportEntity("question_tags")
@ExportEntity(fileName = "question_tags", sheetName = "tags")
public class QuestionTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    @ImportField(name = "name", required = true)
    @ExportField(name = "name")
    String name;

    @ImportField(name = "description")
    @ExportField(name = "description")
    String description;

    @ManyToMany(mappedBy = "tags")
    @JsonIgnoreProperties({"tags"})
    Set<Question> questions = new HashSet<>();
}


