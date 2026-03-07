package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * TopicMarkEntry  the actual score a student received on a single gradebook column.
 *
 * score = null   not entered yet
 * score = 0.0    actually scored zero
 *
 * topic and trainingClass are denormalized for easy querying without joining through TopicMarkColumn.
 */
@Entity
@Table(name = "topic_mark_entries", uniqueConstraints = {
    @UniqueConstraint(name = "uk_topic_mark_entry_col_user",
            columnNames = {"topic_mark_column_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Score entry for one student on one gradebook column")
public class TopicMarkEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_mark_column_id", nullable = false)
    @Schema(description = "The column this entry belongs to")
    private TopicMarkColumn topicMarkColumn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "The student this entry belongs to")
    private User user;

    //  Denormalized for querying 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @Schema(description = "(Denorm) Topic the column belongs to")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_class_id", nullable = false)
    @Schema(description = "(Denorm) Training class the column was created for")
    private TrainingClass trainingClass;

    //  Score 

    @Column(name = "score")
    @Schema(description = "Score value. null = not yet entered, 0.0 = actual zero", example = "8.5")
    private Double score;

    @OneToMany(mappedBy = "topicMarkEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("updatedAt DESC")
    private List<TopicMarkEntryHistory> history;
}