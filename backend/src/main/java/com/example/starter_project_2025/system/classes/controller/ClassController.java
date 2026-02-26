package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.UpdateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.service.classes.ClassService;
import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

        private final ClassService classService;

        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<ApiResponse<TrainingClassResponse>> getTrainingClassById(
                        @PathVariable UUID id) {
                TrainingClassResponse response = classService.getTrainingClassById(id);
                return ResponseEntity.ok(
                                ApiResponse.success(response, "Training class retrieved successfully"));
        }

        @GetMapping(params = "page")
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<ApiResponse<PageResponse<TrainingClassResponse>>> searchTrainingClasses(
                        @Valid @ModelAttribute SearchClassRequest request,
                        Pageable pageable) {

                request.setPageable(pageable);

                Page<TrainingClassResponse> pageResult = classService.searchTrainingClasses(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                PageResponse.from(pageResult),
                                                "Training classes retrieved successfully"));
        }

        @PostMapping
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<TrainingClassResponse> createOpenClassRequest(
                        @Valid @RequestBody CreateTrainingClassRequest request,
                        Authentication authentication) {

                String email = authentication.getName();

                TrainingClassResponse response = classService.openClassRequest(request, email);

                return ResponseEntity.ok(response);
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<TrainingClassResponse> updateClass(
                @PathVariable UUID id,
                @Valid @RequestBody UpdateTrainingClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                TrainingClassResponse response =
                        classService.updateClass(id, request, email);

                return ResponseEntity.ok(response);
        }

        @PutMapping("/{id}/approve")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<TrainingClassResponse> approveClass(
                @PathVariable UUID id,
                @RequestBody(required = false) ReviewClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                TrainingClassResponse response =
                        classService.approveClass(id, email, request);

                return ResponseEntity.ok(response);
        }

        @PutMapping("/{id}/reject")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<TrainingClassResponse> rejectClass(
                @PathVariable UUID id,
                @RequestBody(required = false) ReviewClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                TrainingClassResponse response =
                        classService.rejectClass(id, email, request);

                return ResponseEntity.ok(response);
        }
}