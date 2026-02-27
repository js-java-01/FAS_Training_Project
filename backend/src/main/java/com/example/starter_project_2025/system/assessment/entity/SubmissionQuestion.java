package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.assessment.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SubmissionQuestion {

    @Id
    @GeneratedValue
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    Submission submission;

    // Snapshot link (VERY IMPORTANT)
    @Column(name = "original_question_id", nullable = false)
    UUID originalQuestionId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(name = "score")
    Double score;

    @Column(name = "order_index")
    Integer orderIndex;

    @OneToMany(
            mappedBy = "submissionQuestion",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<SubmissionAnswer> submissionAnswers = new ArrayList<>();
}
