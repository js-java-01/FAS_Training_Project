package com.example.starter_project_2025.system.assessment.service.assessmentquestion;

import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AddQuestionToExamDTO;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.repository.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentQuestionService {

    private final AssessmentQuestionRepository repo;
    private final AssessmentRepository assessmentRepo;
    private final QuestionRepository questionRepo;

    public AssessmentQuestion addQuestionToExam(AddQuestionToExamDTO dto) {
        Assessment assessment = assessmentRepo.findById(dto.getAssessmentId())
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        Question question = questionRepo.findById(dto.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        AssessmentQuestion aq = new AssessmentQuestion();
        aq.setAssessment(assessment);
        aq.setQuestion(question);
        aq.setScore(dto.getScore());
        aq.setOrderIndex(dto.getOrderIndex());

        return repo.save(aq);
    }


    public List<AssessmentQuestion> getAll() {
        return repo.findAll();
    }

    public void deleteById(UUID id) {
        repo.deleteById(id);
    }
}
