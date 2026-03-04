package com.example.starter_project_2025.system.course_online.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.AssessmentTypeOnline;

@Entity
@Table(name = "course_assessment_component")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseAssessmentComponentOnline {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "scheme_id", nullable = false)
    private CourseAssessmentSchemeOnline scheme;

    @Enumerated(EnumType.STRING)
    private AssessmentTypeOnline type;

    private String name;
    private Integer itemCount;
    private Double weight;
    private Integer duration;
    private Integer displayOrder;
    private Boolean graded;
}
