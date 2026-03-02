package com.example.starter_project_2025.system.topic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "topic_time_allocation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicTimeAllocation {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false, unique = true)
    private Topic topic;

    /** Classroom / lecturer-led training hours */
    private Double trainingHours;

    /** Lab / hands-on practice hours */
    private Double practiceHours;

    /** Self-study / e-learning hours */
    private Double selfStudyHours;

    /** Coaching / mentoring hours */
    private Double coachingHours;

    /** Additional notes */
    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
