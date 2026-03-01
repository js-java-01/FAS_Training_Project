package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit trail for every score change on a TopicMarkEntry.
 * Stored whenever a score is updated (PUT topic-marks/{userId}).
 */
@Entity
@Table(name = "topic_mark_entry_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "History record of a score change for a gradebook entry")
public class TopicMarkEntryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_mark_entry_id", nullable = false)
    @Schema(description = "The entry this history record belongs to")
    private TopicMarkEntry topicMarkEntry;

    @Column(name = "old_score")
    @Schema(description = "Score value before the change", nullable = true, example = "7.0")
    private Double oldScore;

    @Column(name = "new_score")
    @Schema(description = "Score value after the change", nullable = true, example = "8.5")
    private Double newScore;

    @Column(name = "reason", columnDefinition = "TEXT")
    @Schema(description = "Reason provided by the editor for this change", example = "Re-graded after review")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    @Schema(description = "User (Trainer or Admin) who made the change")
    private User updatedBy;

    @CreationTimestamp
    @Column(name = "updated_at", nullable = false, updatable = false)
    @Schema(description = "Time when the change was recorded")
    private LocalDateTime updatedAt;
}
