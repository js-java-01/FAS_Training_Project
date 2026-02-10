package com.example.starter_project_2025.system.assessment.submission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "submission_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionQuestion {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    // Snapshot link (VERY IMPORTANT)
    @Column(name = "original_question_id", nullable = false)
    private UUID originalQuestionId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "score")
    private Double score;

    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(
            mappedBy = "submissionQuestion",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<SubmissionAnswer> submissionAnswers = new ArrayList<>();
}
