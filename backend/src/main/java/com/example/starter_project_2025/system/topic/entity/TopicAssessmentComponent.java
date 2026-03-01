package com.example.starter_project_2025.system.topic.entity;

import com.example.starter_project_2025.system.topic.enums.AssessmentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "topic_assessment_components")
@Getter
@Setter
public class TopicAssessmentComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "scheme_id", nullable = false)
    private TopicAssessmentScheme scheme;

    @Enumerated(EnumType.STRING)
    private AssessmentType type;

    private String name;
    private Integer count;
    private Double weight;
    private Integer duration;
    private Integer displayOrder;
    private Boolean isGraded;

    @Column(columnDefinition = "TEXT")
    private String note;
}