package com.example.starter_project_2025.system.topic.entity;

import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus; // Nên tạo Enum này
import com.example.starter_project_2025.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ===== BASIC =====
    @Column(nullable = false)
    private String topicName;

    @Column(nullable = false, unique = true)
    private String topicCode;

    // ===== DETAILS =====
    @Enumerated(EnumType.STRING)
    private TopicLevel level;    // Beginner, Intermediate, Advanced

    private String version;      // v1.0, v1.1...

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== WORKFLOW =====
    @Enumerated(EnumType.STRING)
    private TopicStatus status;  // DRAFT, ACTIVE, REJECTED...

    // ===== METADATA (Audit fields khớp hoàn toàn với Course) =====
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

    // ===== AUTO TIME & DEFAULT STATUS =====
    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = TopicStatus.DRAFT;
        }
        if (this.version == null) {
            this.version = "v1.0";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}