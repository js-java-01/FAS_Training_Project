package com.example.starter_project_2025.system.course.entity;

import com.example.starter_project_2025.system.course.enums.AssessmentType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_assessment_component")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseAssessmentComponent {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "scheme_id", nullable = false)
    private CourseAssessmentScheme scheme;

    @Enumerated(EnumType.STRING)
    private AssessmentType type;

    private String name;
    private Integer itemCount;
    private Double weight;
    private Integer duration;
    private Integer displayOrder;
    private Boolean graded;
}
