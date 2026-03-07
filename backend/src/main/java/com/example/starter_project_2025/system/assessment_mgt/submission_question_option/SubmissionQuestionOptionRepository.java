package com.example.starter_project_2025.system.assessment_mgt.submission_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionQuestionOptionRepository extends BaseCrudRepository<SubmissionQuestionOption, UUID> {

    List<SubmissionQuestionOption> findBySubmissionQuestionId(UUID questionId);
}
