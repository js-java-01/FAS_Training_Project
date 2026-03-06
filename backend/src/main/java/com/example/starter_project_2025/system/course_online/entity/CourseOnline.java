package com.example.starter_project_2025.system.course_online.entity;

import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseOnline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ===== BASIC =====
    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false, unique = true)
    private String courseCode;

    private UUID topicId;
    private UUID trainerId;

    // ===== DETAILS =====
    @Enumerated(EnumType.STRING)
    private CourseLevelOnline level;

    private Integer estimatedTime; // minutes

    private String thumbnailUrl;

    // ===== METADATA =====
    @CreationTimestamp
    private LocalDateTime createdDate;
    @UpdateTimestamp
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "course")
    @JsonManagedReference
    private Set<CourseClass> courseClasses;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

    // ===== WORKFLOW =====
    @Enumerated(EnumType.STRING)
    private CourseStatusOnline status;

    // ===== ADDITIONAL =====
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== ASSESSMENT SCHEME (tạm lưu cứng) =====
    private Double minGpaToPass;
    private Double minAttendancePercent;
    private Boolean allowFinalRetake;

}