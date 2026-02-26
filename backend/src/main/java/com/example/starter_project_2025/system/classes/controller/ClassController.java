package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.service.classes.ClassService;
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
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

        private final ClassService classService;

        @GetMapping(params = "page")
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<ApiResponse<PageResponse<TrainingClassResponse>>> searchTrainingClasses(
                        @Valid @ModelAttribute SearchClassRequest request) {

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
}