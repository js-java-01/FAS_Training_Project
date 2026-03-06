package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.system.assessment_mgt.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment_mgt.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.SubmissionResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submissions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Submisson management", description = "APIs for managing submisson")
public class SubmissonController extends BaseCrudDataIoController<Submission, UUID, SubmissonDTO, SubmissonFilter> {

    SubmissonServiceImpl submissonService;
    SubmissionRepository submissionRepository;

    @Override
    protected BaseCrudRepository<Submission, UUID> getRepository() {
        return submissionRepository;
    }

    @Override
    protected Class<Submission> getEntityClass() {
        return Submission.class;
    }

    @Override
    protected CrudService<UUID, SubmissonDTO, SubmissonFilter> getService() {
        return submissonService;
    }

    /**
     * POST /api/submissions/start/{assessmentId}
     * Tạo submission mới, snapshot câu hỏi, trả về danh sách câu hỏi + timeLimit + startedAt
     */
    @PostMapping("/start/{assessmentId}")
    @Operation(summary = "Start assessment",
               description = "Bắt đầu làm bài kiểm tra. Tạo snapshot câu hỏi, trả về danh sách câu hỏi và thời gian còn lại.")
    public ResponseEntity<SubmissionResponse> startSubmission(@PathVariable UUID assessmentId) {
        StartSubmissionRequest request = new StartSubmissionRequest();
        request.setAssessmentId(assessmentId);
        return ResponseEntity.ok(submissonService.startSubmission(request));
    }


    @PostMapping("/{submissionId}/answer")
    @Operation(summary = "Submit answer",
               description = "Lưu câu trả lời cho một câu hỏi. answerValue là UUID(s) của option(s) ngăn cách bởi dấu phẩy.")
    public ResponseEntity<SubmissionResponse> submitAnswer(
            @PathVariable UUID submissionId,
            @Valid @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(submissonService.submitAnswer(submissionId, request));
    }

    /**
     * POST /api/submissions/{submissionId}/submit
     * Nộp bài, chấm điểm, cập nhật status = SUBMITTED
     */
    @PostMapping("/{submissionId}/submit")
    @Operation(summary = "Submit assessment",
               description = "Nộp bài kiểm tra. Hệ thống tự động chấm điểm và xác định pass/fail.")
    public ResponseEntity<SubmissionResponse> submitSubmission(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(submissonService.submitSubmission(submissionId));
    }

    /**
     * GET /api/submissions/{submissionId}/result
     * Trả về kết quả: totalQuestions, correctAnswers, wrongAnswers, totalScore, passScore, isPassed
     */
    @GetMapping("/{submissionId}/result")
    @Operation(summary = "Get result",
               description = "Lấy kết quả bài kiểm tra: tổng câu, số đúng/sai, điểm, pass/fail và chi tiết từng câu.")
    public ResponseEntity<SubmissionResultResponse> getResult(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(submissonService.getSubmissionResult(submissionId));
    }

    /**
     * GET /api/submissions/{submissionId}/review
     * Xem lại bài với đáp án đúng
     */
    @GetMapping("/{submissionId}/review")
    @Operation(summary = "Review submission",
               description = "Xem lại toàn bộ bài làm kèm đáp án đúng.")
    public ResponseEntity<SubmissionResponse> reviewSubmission(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(submissonService.getSubmissionForReview(submissionId));
    }

    @GetMapping("/assessment/{assessmentId}/users")
    @Operation(
            summary = "Get latest submissions per user",
            description = "Retrieve the latest submission attempt for each user in a specific assessment"
    )
    public ResponseEntity<List<SubmissonDTO>> getLatestSubmissionsByAssessmentId(
            @PathVariable UUID assessmentId) {

        return ResponseEntity.ok(
                submissonService.getLatestSubmissionsByAssessmentId(assessmentId)
        );
    }

    @GetMapping("/assessment/{assessmentId}")
    @Operation(
            summary = "Get submissions by assessment",
            description = "Retrieve all submissions belonging to a specific assessment"
    )
    public ResponseEntity<List<SubmissonDTO>> getSubmissionsByAssessmentId(
            @PathVariable UUID assessmentId) {

        return ResponseEntity.ok(submissonService.getSubmissionsByAssessmentId(assessmentId));
    }
}
