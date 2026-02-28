package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.classes.service.classes.ClassService;
import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.user.entity.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

        private final ClassService classService;

        @GetMapping("")
        @PreAuthorize("hasAuthority('CLASS_READ') or hasAuthority('CLASS_USER_READ')")
        public ResponseEntity<ApiResponse<PageResponse<TrainingClassResponse>>> searchTrainingClasses(
                        @Valid @ParameterObject @ModelAttribute SearchClassRequest request,
                        Pageable pageable) {

                Page<TrainingClassResponse> pageResult = classService.searchTrainingClasses(request,
                                pageable);

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

        @GetMapping("/me")
        @PreAuthorize("hasAuthority('CLASS_USER_READ') or hasAuthority('CLASS_READ')")
        public ResponseEntity<ApiResponse<List<TrainingClassSemesterResponse>>> getMyClasses(
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {

                List<TrainingClassSemesterResponse> response = classService.getMyClasses(userDetails.getId());
                return ResponseEntity.ok(ApiResponse.success(response, "My classes retrieved successfully"));
        }

}