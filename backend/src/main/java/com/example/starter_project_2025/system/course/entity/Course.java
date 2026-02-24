package com.example.starter_project_2025.system.course.entity;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ===== BASIC =====
    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false, unique = true)
    private String courseCode;

    // TEMP: team Topic chưa xong → chỉ lưu ID
    private Long topicId;

    private BigDecimal price;
    private Double discount;

    // ===== DETAILS =====
    @Enumerated(EnumType.STRING)
    private CourseLevel level;

    private Integer estimatedTime; // minutes

    private String thumbnailUrl;

    // ===== METADATA =====
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    // ===== WORKFLOW =====
    @Enumerated(EnumType.STRING)
    private CourseStatus status;

    // ===== ADDITIONAL =====
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== ASSESSMENT SCHEME (tạm lưu cứng) =====
    private Double minGpaToPass;
    private Double minAttendancePercent;
    private Boolean allowFinalRetake;

    // ===== AUTO TIME =====
    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = CourseStatus.DRAFT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}