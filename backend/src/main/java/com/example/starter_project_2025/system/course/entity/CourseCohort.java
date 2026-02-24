package com.example.starter_project_2025.system.course.entity;

import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CohortStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "course_cohorts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCohort {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    private LocalDate startDate;
    private LocalDate endDate;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private CohortStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;
}