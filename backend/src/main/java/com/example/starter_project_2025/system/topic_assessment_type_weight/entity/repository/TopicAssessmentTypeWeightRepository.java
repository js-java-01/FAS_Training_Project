package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository;

import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicAssessmentTypeWeightRepository extends JpaRepository<TopicAssessmentTypeWeight, UUID>
{
    List<TopicAssessmentTypeWeight> findByTopicId(UUID topicId);

    void deleteByTopicId(UUID topicId);
}
