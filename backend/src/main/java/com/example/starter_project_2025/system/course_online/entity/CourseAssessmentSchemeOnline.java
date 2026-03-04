package com.example.starter_project_2025.system.course_online.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "course_assessment_scheme")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseAssessmentSchemeOnline {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne
    @JoinColumn(name = "course_id", nullable = false, unique = true)
    private CourseOnline course;

    private Double minGpaToPass;
    private Double minAttendance;

    private Boolean allowFinalRetake;

    @OneToMany(mappedBy = "scheme", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseAssessmentComponentOnline> components = new ArrayList<>();
}