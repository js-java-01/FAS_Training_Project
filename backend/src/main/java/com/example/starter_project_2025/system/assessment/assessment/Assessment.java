package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.system.assessment.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment.submission.Submission;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.assessment.enums.GradingMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true, length = 100)
    String code;

    @Column(nullable = false, length = 255)
    String title;

    @Column(length = 500)
    String description;

    int totalScore;

    int passScore;

    int timeLimitMinutes;

    int attemptLimit;

    @Enumerated(EnumType.STRING)
    AssessmentDifficulty difficulty;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    GradingMethod gradingMethod = GradingMethod.HIGHEST;

    @Enumerated(EnumType.STRING)
    AssessmentStatus status;

    boolean isShuffleQuestion = false;

    boolean isShuffleOption = false;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_type_id", nullable = false)
    AssessmentType assessmentType;

    @Builder.Default
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    List<AssessmentQuestion> assessmentQuestions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Submission> submissions = new ArrayList<>();
}
