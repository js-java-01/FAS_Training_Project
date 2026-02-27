package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.mapper.SubmissionMapper;
import com.example.starter_project_2025.system.assessment.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionMapper submissionMapper;



    // Start submission
    @PostMapping
    public SubmissionResponse startSubmission(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody StartSubmissionRequest request
    ) {
        return submissionService.startSubmissionAndGetResponse(currentUser.getId(), request);
    }

    // Submit answer
    @PostMapping("/{submissionId}/answers")
    public SubmissionResponse submitAnswer(
            @PathVariable UUID submissionId,
            @RequestBody SubmitAnswerRequest request
    ) {
        submissionService.submitAnswer(submissionId, request);
        return submissionService.getSubmissionResponseById(submissionId);
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
        return submissionService.getSubmissionResponseById(submissionId);
    }

    // Search submissions (paged) — defaults to current user
    @GetMapping
    public Page<SubmissionResponse> searchSubmissions(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) Long assessmentId,
            Pageable pageable
    ) {
        Page<Submission> page =
                submissionService.searchSubmissions(
                        currentUser.getId(),
                        assessmentId,
                        pageable
                );

        return page.map(submissionMapper::toSubmissionResponse);
    }
}
