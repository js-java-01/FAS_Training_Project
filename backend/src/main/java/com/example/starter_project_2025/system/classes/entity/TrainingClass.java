package com.example.starter_project_2025.system.classes.entity;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.user.entity.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingClass {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "class_id")
    private UUID id;

    @Column(name = "class_name")
    private String className;

    @OneToMany(mappedBy = "classInfo")
    @JsonManagedReference
    private List<CourseClass> courseClasses;

    @OneToMany(mappedBy = "trainingClass")
    @JsonManagedReference
    private List<Enrollment> enrollments;

    @Column(name = "class_code", unique = true)
    private String classCode;
    @Column(name = "enrollment_key", length = 500)
    private String enrollmentKey;

    @Enumerated(EnumType.STRING)
    private ClassStatus classStatus;

    @Column(name = "is_active")
    private Boolean isActive = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    @JsonBackReference
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}