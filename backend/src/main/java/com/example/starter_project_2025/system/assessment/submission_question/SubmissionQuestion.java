package com.example.starter_project_2025.system.assessment.submission_question;

import com.example.starter_project_2025.system.assessment.question.Question;
import com.example.starter_project_2025.system.assessment.question.QuestionType;
import com.example.starter_project_2025.system.assessment.submission.Submission;
import com.example.starter_project_2025.system.assessment.submission_answer.SubmissionAnswer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "submission_questions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_question_id")
    Question originalQuestion;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(nullable = false)
    Double maxScore;

    @Column(name = "order_index")
    Integer orderIndex;

    @Column(name = "earned_score")
    Double earnedScore = 0.0;

    @Builder.Default
    @OneToMany(mappedBy = "submissionQuestion",cascade = CascadeType.ALL, orphanRemoval = true)
    List<SubmissionAnswer> submissionAnswers = new ArrayList<>();
}
