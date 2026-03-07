package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.system.assessment_mgt.submission_question.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment_mgt.assessment.Assessment;
import com.example.starter_project_2025.system.rbac.user.User;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SubmissionStatus status;

    @Column(nullable = false)
    Integer attemptNumber;

    @Column(name = "started_at", nullable = false)
    LocalDateTime startedAt;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "total_score")
    Double totalScore = 0.0;

    @Column(name = "is_passed")
    Boolean isPassed = false;

    @Builder.Default
    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    List<SubmissionQuestion> submissionQuestions = new ArrayList<>();
}