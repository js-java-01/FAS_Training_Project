package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Represents a dynamic gradebook column (e.g. "Quiz 1", "Assignment 2")
 * configured per CourseClass by the Trainer.
 */
@Entity
@Table(name = "topic_mark_columns", uniqueConstraints = {
    @UniqueConstraint(name = "uk_topic_mark_col_class_type_idx",
            columnNames = {"course_class_id", "assessment_type_id", "column_index"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "A gradebook column for a specific assessment type in a course class")
public class TopicMarkColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Schema(description = "Column unique identifier")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_class_id", nullable = false)
    @Schema(description = "The course class this column belongs to")
    private CourseClass courseClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_type_id", nullable = false)
    @Schema(description = "The assessment type category (Quiz, Assignment, Final, ...)")
    private AssessmentType assessmentType;

    @Column(name = "column_label", nullable = false)
    @Schema(description = "Display label for this column", example = "Quiz 1")
    private String columnLabel;

    @Column(name = "column_index", nullable = false)
    @Schema(description = "Order index within the same assessment type", example = "1")
    private Integer columnIndex;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    @Schema(description = "Soft delete flag – true means column is removed but data preserved")
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
