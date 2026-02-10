package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.mapper.SubmissionMapper;
import com.example.starter_project_2025.system.assessment.service.SubmissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionMapper submissionMapper;

    public SubmissionController(
            SubmissionService submissionService,
            SubmissionMapper submissionMapper
    ) {
        this.submissionService = submissionService;
        this.submissionMapper = submissionMapper;
    }

    // Start submission
    @PostMapping
    public SubmissionResponse startSubmission(
            @RequestParam UUID userId,
            @RequestBody StartSubmissionRequest request
    ) {
        Submission submission =
                submissionService.startSubmission(userId, request);

        return submissionMapper.toSubmissionResponse(submission);
    }

    // Submit answer
    @PostMapping("/{submissionId}/answers")
    public SubmissionResponse submitAnswer(
            @PathVariable UUID submissionId,
            @RequestBody SubmitAnswerRequest request
    ) {
        Submission submission =
                submissionService.submitAnswer(submissionId, request);

        return submissionMapper.toSubmissionResponse(submission);
    }

    // Submit submission (finish)
    @PostMapping("/{submissionId}/submit")
    public SubmissionResultResponse submitSubmission(
            @PathVariable UUID submissionId,
            @RequestBody SubmitSubmissionRequest request
    ) {
        Submission submission =
                submissionService.submitSubmission(submissionId, request);

        return submissionMapper.toSubmissionResultResponse(submission);
    }

    // Get submission by id
    @GetMapping("/{submissionId}")
    public SubmissionResponse getSubmissionById(
            @PathVariable UUID submissionId
    ) {
        Submission submission =
                submissionService.getSubmissionById(submissionId);

        return submissionMapper.toSubmissionResponse(submission);
    }

    // Search submissions (paged)
    @GetMapping
    public Page<SubmissionResponse> searchSubmissions(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID assessmentTypeId,
            Pageable pageable
    ) {
        Page<Submission> page =
                submissionService.searchSubmissions(
                        userId,
                        assessmentTypeId,
                        pageable
                );

        return page.map(submissionMapper::toSubmissionResponse);
    }
}
