package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Topic Mark - Final gradebook aggregation for a student in a course class.
 * Stores the computed final score and pass/fail status based on assessment type weights.
 */
@Entity
@Table(name = "topic_marks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_topic_mark_class_user", columnNames = {"course_class_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Topic Mark entity representing final gradebook entry for a student in a course class")
public class TopicMark {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_topic_id", nullable = false)
    @Schema(description = "Associated course class")
    private TrainingProgramTopic trainingProgramTopic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "Student user")
    private User user;

    @Column(name = "topic_id")
    @Schema(description = "Topic ID of the related course class", nullable = true)
    private UUID topicId;

    @Column(name = "final_score")
    @Schema(description = "Final computed score (0-10), null if not yet calculated", example = "8.5", nullable = true)
    private Double finalScore;

    @Column(name = "is_passed", nullable = false)
    @Builder.Default
    @Schema(description = "Whether the student passed based on course.minGpaToPass", example = "true")
    private Boolean isPassed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp of creation")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp of last update", example = "2026-02-26T10:30:00")
    private LocalDateTime updatedAt;
}
