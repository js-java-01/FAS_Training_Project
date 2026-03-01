package com.example.starter_project_2025.system.course.entity;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_programing_language.entity.CourseProgrammingLanguage;
import com.example.starter_project_2025.system.user.entity.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
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
public class Course
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ===== BASIC =====
    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false, unique = true)
    private String courseCode;

    private Long topicId;

    private BigDecimal price;
    private Double discount;

    // ===== DETAILS =====
    @Enumerated(EnumType.STRING)
    private CourseLevel level;

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

    @OneToMany(mappedBy = "course")
    @JsonManagedReference
    private Set<CourseProgrammingLanguage> courseProgrammingLanguages;

    @OneToMany(mappedBy = "course")
    @JsonManagedReference
    private Set<CourseAssessmentTypeWeight> courseAssessmentTypeWeights;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

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

}