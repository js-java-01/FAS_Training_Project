package com.example.starter_project_2025.system.topic.entity;

import com.example.starter_project_2025.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "topic_objectives",
        uniqueConstraints = @UniqueConstraint(columnNames = {"code", "topic_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ===== BASIC =====
    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String details;

    // ===== RELATION =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    // ===== AUDIT =====
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}