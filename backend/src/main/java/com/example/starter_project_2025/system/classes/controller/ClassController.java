package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CreateClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.UpdateClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
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
        public ResponseEntity<ApiResponse<ClassResponse>> getTrainingClassById(
                        @PathVariable UUID id) {
                ClassResponse response = classService.getTrainingClassById(id);
                return ResponseEntity.ok(
                                ApiResponse.success(response, "Training class retrieved successfully"));
        }

        @GetMapping(params = "page")
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<ApiResponse<PageResponse<ClassResponse>>> searchTrainingClasses(
                        @Valid @ModelAttribute SearchClassRequest request,
                        Pageable pageable) {

                request.setPageable(pageable);

                Page<ClassResponse> pageResult = classService.searchTrainingClasses(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                PageResponse.from(pageResult),
                                                "Training classes retrieved successfully"));
        }

        @PostMapping
        @PreAuthorize("hasAuthority('CLASS_CREATE')")
        public ResponseEntity<ClassResponse> createOpenClassRequest(
                        @Valid @RequestBody CreateClassRequest request,
                        Authentication authentication) {

                String email = authentication.getName();

                ClassResponse response = classService.openClassRequest(request, email);

                return ResponseEntity.ok(response);
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<ClassResponse> updateClass(
                @PathVariable UUID id,
                @Valid @RequestBody UpdateClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                ClassResponse response =
                        classService.updateClass(id, request, email);

                return ResponseEntity.ok(response);
        }


        @PutMapping("/{id}/approve")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<ClassResponse> approveClass(
                @PathVariable UUID id,
                @RequestBody(required = false) ReviewClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                ClassResponse response =
                        classService.approveClass(id, email, request);

                return ResponseEntity.ok(response);
        }

        @PutMapping("/{id}/reject")
        @PreAuthorize("hasAuthority('CLASS_UPDATE')")
        public ResponseEntity<ClassResponse> rejectClass(
                @PathVariable UUID id,
                @RequestBody(required = false) ReviewClassRequest request,
                Authentication authentication
        ) {
                String email = authentication.getName();

                ClassResponse response =
                        classService.rejectClass(id, email, request);

                return ResponseEntity.ok(response);
        }
}