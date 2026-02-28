package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.mapping.question.QuestionCategoryLookupResolver;
import com.example.starter_project_2025.system.dataio.mapping.question.QuestionCategoryNameExtractor;
import com.example.starter_project_2025.system.dataio.mapping.questionOption.QuestionOptionExtractor;
import com.example.starter_project_2025.system.dataio.mapping.questionOption.QuestionOptionResolver;
import com.example.starter_project_2025.system.dataio.mapping.tag.TagLookupResolver;
import com.example.starter_project_2025.system.dataio.mapping.tag.TagNamesExtractor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "questions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;
    @NotBlank(message = "Content must not be blank")
    @Column(columnDefinition = "TEXT", nullable = false)
    String content;

    @Column(name = "question_type")
    String questionType; // SINGLE, MULTIPLE

    Boolean isActive = true;

    LocalDate createdAt;
    LocalDate updatedAt;

    @ManyToOne
    @JoinColumn(name = "question_category_id")
    @JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
    @ImportField(
            name = "Category",
            resolver = QuestionCategoryLookupResolver.class
    )
    @ExportField(
            name = "Category",
            extractor = QuestionCategoryNameExtractor.class
    )
    QuestionCategory category;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({ "question" })
    @ImportField(
            name = "Options",
            resolver = QuestionOptionResolver.class
    )
    @ExportField(
            name = "Options",
            extractor = QuestionOptionExtractor.class
    )
    List<QuestionOption> options;

    @ManyToMany
    @JoinTable(
            name = "question_tag",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @ImportField(
            name = "Tags",
            resolver = TagLookupResolver.class
    )
    @ExportField(
            name = "Tags",
            extractor = TagNamesExtractor.class
    )
    Set<Tag> tags = new HashSet<>();

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