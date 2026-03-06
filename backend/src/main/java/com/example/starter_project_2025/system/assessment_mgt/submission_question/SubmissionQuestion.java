package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.system.assessment_mgt.question.QuestionType;
import com.example.starter_project_2025.system.assessment_mgt.submission.Submission;
import com.example.starter_project_2025.system.assessment_mgt.submission_answer.SubmissionAnswer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;
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

    // Link tới AssessmentQuestion để lấy đúng options của assessment (không phải options gốc)
    @Column(name = "assessment_question_id")
    UUID assessmentQuestionId;

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
    private Set<SubmissionAnswer> submissionAnswers = new HashSet<>();
}
