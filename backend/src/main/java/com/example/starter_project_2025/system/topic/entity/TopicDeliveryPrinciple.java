package com.example.starter_project_2025.system.topic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "topic_delivery_principle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDeliveryPrinciple {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false, unique = true)
    private Topic topic;

    private Integer maxTraineesPerClass;
    private Integer minTrainerLevel;
    private Integer minMentorLevel;

    @Column(columnDefinition = "TEXT")
    private String trainingGuidelines;

    @Column(columnDefinition = "TEXT")
    private String markingPolicy;

    @Column(columnDefinition = "TEXT")
    private String waiverNotes;

    @Column(columnDefinition = "TEXT")
    private String otherNotes;

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
