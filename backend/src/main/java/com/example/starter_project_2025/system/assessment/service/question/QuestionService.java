package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionFilter;
import com.example.starter_project_2025.system.assessment.dto.question.request.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagFilter;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import com.example.starter_project_2025.system.assessment.mapper.QuestionMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionTagRepository;
import com.example.starter_project_2025.system.assessment.spec.QuestionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;


public interface QuestionService extends CrudService<UUID, QuestionDTO, QuestionFilter> {
}
