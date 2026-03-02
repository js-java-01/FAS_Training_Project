package com.example.starter_project_2025.system.assessment.service.assessmentquestion;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AddQuestionToExamDTO;
import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AssessmentQuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AssessmentQuestionFilter;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionFilter;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.repository.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


public interface AssessmentQuestionService extends CrudService<UUID, AssessmentQuestionDTO, AssessmentQuestionFilter> {
}
