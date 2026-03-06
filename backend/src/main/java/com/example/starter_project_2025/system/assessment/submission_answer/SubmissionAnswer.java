package com.example.starter_project_2025.system.assessment.submission_answer;

import com.example.starter_project_2025.system.assessment.submission_question.SubmissionQuestion;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "submission_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_question_id", nullable = false)
    SubmissionQuestion submissionQuestion;

    @Column(columnDefinition = "TEXT")
    String answerValue;

    UUID optionId;

    Boolean isCorrect;

    Double score = 0.0;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
