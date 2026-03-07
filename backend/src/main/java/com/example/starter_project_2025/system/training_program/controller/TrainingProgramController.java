package com.example.starter_project_2025.system.training_program.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.SearchTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.ImportTrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.service.TrainingProgramService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.InputStreamResource;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/training-programs")
@RequiredArgsConstructor
public class TrainingProgramController {

        private final TrainingProgramService service;

        @GetMapping(params = "page")
        @Operation(summary = "Search training programs with pagination")
        @PreAuthorize("hasAuthority('TRAINING_PROGRAM_READ')")
        public ResponseEntity<ApiResponse<PageResponse<TrainingProgramResponse>>> searchTrainingPrograms(
                        @Valid @ParameterObject @ModelAttribute SearchTrainingProgramRequest request) {

                String sortField = request.getSort()[0];

                Sort.Direction direction = request.getSort().length > 1
                                ? Sort.Direction.fromString(request.getSort()[1])
                                : Sort.Direction.ASC;

                Pageable pageable = PageRequest.of(
                                request.getPage(),
                                request.getSize(),
                                Sort.by(direction, sortField));

                Page<TrainingProgramResponse> pageResult = service.searchTrainingPrograms(
                                request.getKeyword(),
                                request.getVersion(),
                                pageable);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                PageResponse.from(pageResult),
                                                "Training programs retrieved successfully"));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('TRAINING_PROGRAM_READ')")
        public ResponseEntity<TrainingProgramResponse> getDetail(
                        @PathVariable UUID id) {
                return ResponseEntity.ok(service.getById(id));
        }

        @PostMapping
        @PreAuthorize("hasAuthority('TRAINING_PROGRAM_CREATE')")
        public ResponseEntity<TrainingProgramResponse> create(
                        @Valid @RequestBody CreateTrainingProgramRequest request) {
                return ResponseEntity.ok(service.create(request));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('TRAINING_PROGRAM_DELETE')")
        public ResponseEntity<Void> delete(@PathVariable UUID id) {

                service.delete(id);

                return ResponseEntity.noContent().build();
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('TRAINING_PROGRAM_UPDATE')")
        public ResponseEntity<TrainingProgramResponse> update(
                        @PathVariable UUID id,
                        @RequestBody UpdateTrainingProgramRequest request) {
                return ResponseEntity.ok(service.update(id, request));
        }

        @GetMapping("/export")
        public ResponseEntity<Resource> exportTrainingPrograms() throws IOException {

                ByteArrayInputStream stream = service.exportTrainingPrograms();

                InputStreamResource file = new InputStreamResource(stream);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=training_programs.xlsx")
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(file);
        }

        @GetMapping("/template")
        public ResponseEntity<Resource> downloadTemplate() throws IOException {

                ByteArrayInputStream stream = service.downloadTemplate();

                InputStreamResource file = new InputStreamResource(stream);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=training_program_template.xlsx")
                                .body(file);
        }

        @PostMapping("/import")
        public ResponseEntity<?> importTrainingPrograms(
                        @RequestParam("file") MultipartFile file) throws IOException {

                ImportTrainingProgramResponse response = service.importTrainingPrograms(file);

                return ResponseEntity.ok(response);
        }
}