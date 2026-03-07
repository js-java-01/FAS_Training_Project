package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.topic.entity.Topic;
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
 * TopicMark  final computed score of a student for a given topic in a training class.
 *
 * Unique per (topic, trainingClass, user).
 * trainingProgram and trainingProgramTopic are denormalized for faster querying.
 */
@Entity
@Table(name = "topic_marks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_topic_mark_topic_class_user",
            columnNames = {"topic_id", "training_class_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Final aggregated score of a student for a topic in a training class")
public class TopicMark {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @Schema(description = "The topic (subject) being scored")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_class_id", nullable = false)
    @Schema(description = "The training class in which the student is scored")
    private TrainingClass trainingClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "The student being scored")
    private User user;

    //  Denormalized fields for fast querying 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_id")
    @Schema(description = "(Denorm) Training program that owns this class")
    private TrainingProgram trainingProgram;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_topic_id")
    @Schema(description = "(Denorm) TrainingProgramTopic linking program to topic")
    private TrainingProgramTopic trainingProgramTopic;

    //  Score 

    @Column(name = "final_score")
    @Schema(description = "Computed final score (010), null if not all columns are filled", example = "8.5")
    private Double finalScore;

    @Column(name = "is_passed", nullable = false)
    @Builder.Default
    @Schema(description = "Whether the student passed (finalScore >= topic.minGpaToPass)", example = "true")
    private Boolean isPassed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}