package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * TopicMarkEntry — the actual score a student received on one slot of a TopicAssessmentComponent.
 *
 * score = null  → not entered yet
 * score = 0.0   → actually scored zero
 *
 * topic and trainingClass are denormalized for easy querying.
 */
@Entity
@Table(name = "topic_mark_entries", uniqueConstraints = {
    @UniqueConstraint(name = "uk_tme_component_index_user_class",
            columnNames = {"component_id", "component_index", "user_id", "training_class_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Score entry for one student on one component slot")
public class TopicMarkEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    @Schema(description = "The assessment component this entry belongs to")
    private TopicAssessmentComponent component;

    @Column(name = "component_index", nullable = false)
    @Schema(description = "1-based slot index within the component (e.g. 1 = Quiz 1)", example = "1")
    private Integer componentIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "The student this entry belongs to")
    private User user;

    // Denormalized for querying

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @Schema(description = "(Denorm) Topic the component belongs to")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_class_id", nullable = false)
    @Schema(description = "(Denorm) Training class this score was recorded in")
    private TrainingClass trainingClass;

    // Score

    @Column(name = "score")
    @Schema(description = "Score value. null = not yet entered, 0.0 = actual zero", example = "8.5")
    private Double score;

    @OneToMany(mappedBy = "topicMarkEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("updatedAt DESC")
    private List<TopicMarkEntryHistory> history;
}