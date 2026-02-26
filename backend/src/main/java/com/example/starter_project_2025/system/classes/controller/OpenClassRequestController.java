package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.service.openclassrequest.OpenClassRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/open-class-requests")
@RequiredArgsConstructor
public class OpenClassRequestController {

    private final OpenClassRequestService openClassRequestService;

    @PostMapping
    @PreAuthorize("hasAuthority('CLASS_CREATE')")
    public ResponseEntity<TrainingClassResponse> createOpenClassRequest(
            @Valid @RequestBody CreateTrainingClassRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        TrainingClassResponse response =
                openClassRequestService.openClassRequest(request, email);

        return ResponseEntity.ok(response);
    }
}