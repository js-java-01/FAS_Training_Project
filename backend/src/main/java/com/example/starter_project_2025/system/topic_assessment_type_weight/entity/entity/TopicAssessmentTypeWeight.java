package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity;

import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "topic_assessment_type_weights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicAssessmentTypeWeight
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonBackReference
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "assessment_type_id", nullable = false)
    @JsonBackReference
    private AssessmentType assessmentType;

    private Double weight;

}
