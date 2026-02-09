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

@Service
@RequiredArgsConstructor
public class AssessmentQuestionService {

    private final AssessmentQuestionRepository aqRepo;
    private final AssessmentRepository assessmentRepo; // Của thằng bạn ông
    private final QuestionRepository questionRepo;     // Của ông

    public AssessmentQuestion addQuestionToExam(AddQuestionToExamDTO dto) {
        // 1. Tìm cái đề thi (Code của thằng bạn ông vừa merge về đó)
        Assessment assessment = assessmentRepo.findById(dto.getAssessmentId())
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        // 2. Tìm câu hỏi (Code của ông)
        Question question = questionRepo.findById(dto.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // 3. Tạo mối liên kết
        AssessmentQuestion link = new AssessmentQuestion();
        link.setAssessment(assessment);
        link.setQuestion(question);
        link.setScore(dto.getScore());
        link.setOrderIndex(dto.getOrderIndex());

        return aqRepo.save(link);
    }
}