package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.system.assessment_mgt.question.Question;
import com.example.starter_project_2025.system.assessment_mgt.question_option.QuestionOption;
import com.example.starter_project_2025.system.assessment_mgt.submission.Submission;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "submission_questions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    Submission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    QuestionOption selectedOption;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    String textAnswer;

    @Column(name = "is_correct")
    Boolean isCorrect;

    @Column(name = "score_earned")
    Double scoreEarned;
}
