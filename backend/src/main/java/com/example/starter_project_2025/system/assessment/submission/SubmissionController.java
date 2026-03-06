package com.example.starter_project_2025.system.assessment.submission;

import com.example.starter_project_2025.system.assessment.submission.dto.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.submission.dto.StartSubmissionResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionDetailResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.submission_answer.SaveAnswerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/start")
    public ResponseEntity<StartSubmissionResponse> start(
            @RequestBody StartSubmissionRequest request
    ) {
        return ResponseEntity.ok(
                submissionService.startSubmission(request.getAssessmentId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDetailResponse> getDetail(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                submissionService.getDetail(id)
        );
    }

    // 3️⃣ Save answer
    @PostMapping("/save-answer")
    public ResponseEntity<Void> saveAnswer(
            @RequestBody SaveAnswerRequest request
    ) {
        submissionService.saveAnswer(
                request.getSubmissionQuestionId(),
                request.getSelectedOptionIds()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResultResponse> submit(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                submissionService.submit(id)
        );
    }
}
