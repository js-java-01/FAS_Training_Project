package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface SubmissionQuestionMapper extends BaseCrudMapper<SubmissionQuestion, SubmissionQuestionDTO> {

}
