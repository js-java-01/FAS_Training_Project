package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_type_id", nullable = false)
    @JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
    AssessmentType assessmentType;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "assessment" })
    List<AssessmentQuestion> assessmentQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<Submission> submissions;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programming_language_id")
    ProgrammingLanguage programmingLanguage;

    @Column(nullable = false, unique = true, length = 50)
    String code;

    @Column(nullable = false)
    @NotBlank
    @Size(max = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    Integer totalScore;

    @Enumerated(EnumType.STRING)
    AssessmentDifficulty difficulty;

    Integer passScore;

    Integer timeLimitMinutes;

    Integer attemptLimit;
    @Enumerated(EnumType.STRING)
    GradingMethod gradingMethod = GradingMethod.HIGHEST;

    Boolean isShuffleQuestion = false;

    Boolean isShuffleOption = false;

    @Enumerated(EnumType.STRING)
    AssessmentStatus status;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
