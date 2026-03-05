package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTagFilter;

import java.util.UUID;

public interface SubmissonService extends CrudService<UUID, SubmissonDTO, SubmissonFilter> {
}
