package com.example.starter_project_2025.system.topic.entity;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
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

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String level;    // Beginner, Intermediate, Advanced

    private String status;   // Draft, Active, Rejected...

    private String version;  // v1.0, v1.1...

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== METADATA (Audit fields giống Course) =====
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
            this.status = "DRAFT"; // Mặc định theo SRS
        }
        if (this.version == null) {
            this.version = "v1.0"; // Mặc định theo SRS
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}