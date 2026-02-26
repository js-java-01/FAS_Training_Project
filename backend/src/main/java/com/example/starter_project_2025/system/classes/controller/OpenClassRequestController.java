package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.service.openclassrequest.OpenClassRequestService;
import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/open-class-requests")
@RequiredArgsConstructor
public class OpenClassRequestController {

    private final OpenClassRequestService openClassRequestService;

    @GetMapping(params = "page")
    @PreAuthorize("hasAuthority('CLASS_CREATE')")
    public ResponseEntity<ApiResponse<PageResponse<TrainingClassResponse>>> searchTrainingClasses(
            @RequestParam int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "className,asc") String[] sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive
    ) {
        String sortField = sort[0];
        Sort.Direction direction = sort.length > 1
                ? Sort.Direction.fromString(sort[1])
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<TrainingClassResponse> pageResult =
                openClassRequestService.searchTrainingClasses(keyword, isActive, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        PageResponse.from(pageResult),
                        "Training classes retrieved successfully"
                )
        );
    }

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