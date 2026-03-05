package com.example.starter_project_2025.system.topic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "topic_assessment_schemes")
@Getter
@Setter
public class TopicAssessmentScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "topic_id", nullable = false, unique = true)
    private Topic topic;

    private Double minGpaToPass;
    private Integer minAttendance;
    private Boolean allowFinalRetake;

    @OneToMany(mappedBy = "scheme", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<TopicAssessmentComponent> components;
}
