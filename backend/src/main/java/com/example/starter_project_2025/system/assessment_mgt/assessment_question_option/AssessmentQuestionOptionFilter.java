package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.UUID;

@Builder public record AssessmentQuestionOptionFilter(

@FilterField(entityField="content",operator=FilterOperator.LIKE)String content,

@FilterField(entityField="correct")Boolean correct,

@FilterField(entityField="assessmentQuestion.id")UUID assessmentQuestionId

){}