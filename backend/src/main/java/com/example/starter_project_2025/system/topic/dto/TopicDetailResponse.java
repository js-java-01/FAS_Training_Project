package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassReponse;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class TopicDetailResponse
{
    private TopicResponse topic;
    private List<TopicAssessmentTypeWeightResponse> assessmentTypeWeights;
    private TrainingClassReponse trainingClassReponse;
    private TrainingProgramResponse trainingProgram;
}
