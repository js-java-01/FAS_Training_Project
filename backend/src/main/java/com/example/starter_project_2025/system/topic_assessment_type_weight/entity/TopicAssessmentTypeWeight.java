package com.example.starter_project_2025.system.topic_assessment_type_weight.entity;

import java.util.UUID;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "topic_assessment_type_weights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicAssessmentTypeWeight {
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
