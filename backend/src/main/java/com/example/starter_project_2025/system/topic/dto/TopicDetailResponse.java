package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TopicDetailResponse
{
    private TopicResponse topic;
    private List<TopicAssessmentTypeWeightResponse> assessmentTypeWeights;
    private TrainingProgramResponse trainingProgram;
}
