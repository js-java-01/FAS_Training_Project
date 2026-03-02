package com.example.starter_project_2025.system.training_program.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.SearchTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.service.TrainingProgramService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/training-programs")
@RequiredArgsConstructor
public class TrainingProgramController {

    private final TrainingProgramService service;

    @GetMapping(params = "page")
    @Operation(summary = "Search training programs with pagination")
    public ResponseEntity<ApiResponse<PageResponse<TrainingProgramResponse>>> searchTrainingPrograms(
            @ModelAttribute SearchTrainingProgramRequest request
    ) {

        String sortField = request.getSort()[0];

        Sort.Direction direction =
                request.getSort().length > 1
                        ? Sort.Direction.fromString(request.getSort()[1])
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(direction, sortField)
        );

        Page<TrainingProgramResponse> pageResult =
                service.searchTrainingPrograms(
                        request.getKeyword(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        PageResponse.from(pageResult),
                        "Training programs retrieved successfully"
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingProgramResponse> getDetail(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<TrainingProgramResponse> create(
            @Valid @RequestBody CreateTrainingProgramRequest request
    ) {
        return ResponseEntity.ok(service.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {

        service .delete(id);

        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<TrainingProgramResponse> update(
            @PathVariable UUID id,
            @RequestBody UpdateTrainingProgramRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }
}