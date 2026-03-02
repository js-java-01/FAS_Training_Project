package com.example.starter_project_2025.system.topic_mark.entity;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Stores the actual score a student received for a specific gradebook column.
 * score = null  → not entered yet
 * score = 0.0   → actually scored zero
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
@Schema(description = "Score entry for one student in one gradebook column")
public class TopicMarkEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Schema(description = "Entry unique identifier")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_mark_column_id", nullable = false)
    @Schema(description = "The column this entry belongs to")
    private TopicMarkColumn topicMarkColumn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "The student this entry belongs to")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_class_id", nullable = false)
    @Schema(description = "Denormalized courseClass for easier querying")
    private CourseClass courseClass;

    @Column(name = "score")
    @Schema(description = "Score value. null = not yet entered, 0.0 = actual zero", nullable = true, example = "8.5")
    private Double score;

    @OneToMany(mappedBy = "topicMarkEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("updatedAt DESC")
    private List<TopicMarkEntryHistory> history;
}
