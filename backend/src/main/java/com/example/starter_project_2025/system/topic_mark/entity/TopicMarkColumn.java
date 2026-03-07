package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * TopicMarkColumn  a dynamic gradebook column (e.g. "Quiz 1", "Midterm Exam")
 * defined per Topic  TrainingClass by the Trainer.
 *
 * Unique per (topic, trainingClass, assessmentType, columnIndex).
 */
@Entity
@Table(name = "topic_mark_columns", uniqueConstraints = {
    @UniqueConstraint(name = "uk_topic_mark_col_topic_class_type_idx",
            columnNames = {"topic_id", "training_class_id", "assessment_type_id", "column_index"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "A gradebook column for a specific assessment type in a topic  training-class context")
public class TopicMarkColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @Schema(description = "The topic this column belongs to")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_class_id", nullable = false)
    @Schema(description = "The training class this column is configured for")
    private TrainingClass trainingClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_type_id", nullable = false)
    @Schema(description = "Assessment type category (Quiz, Assignment, Final, ...)")
    private AssessmentType assessmentType;

    @Column(name = "column_label", nullable = false)
    @Schema(description = "Display label", example = "Quiz 1")
    private String columnLabel;

    @Column(name = "column_index", nullable = false)
    @Schema(description = "Order index within the same assessment type", example = "1")
    private Integer columnIndex;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    @Schema(description = "Soft-delete flag")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @Schema(description = "Trainer who created this column")
    private User createdBy;

    @OneToMany(mappedBy = "topicMarkColumn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TopicMarkEntry> entries;
}