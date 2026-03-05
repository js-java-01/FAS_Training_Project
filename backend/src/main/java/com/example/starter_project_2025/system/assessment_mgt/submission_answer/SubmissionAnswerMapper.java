package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface SubmissionAnswerMapper extends BaseCrudMapper<SubmissionAnswer, SubmissionAnswerDTO> {
}
