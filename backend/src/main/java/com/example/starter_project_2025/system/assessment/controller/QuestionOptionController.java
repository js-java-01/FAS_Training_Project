package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/question-options")
@RequiredArgsConstructor
@Tag(name = "Question Option", description = "CRUD APIs for question options")
public class QuestionOptionController {

    private final QuestionOptionRepository optionRepo;

    @Operation(summary = "Get all question options")
    @GetMapping
    public ResponseEntity<List<QuestionOption>> getAll() {
        return ResponseEntity.ok(optionRepo.findAll());
    }

    @Operation(summary = "Create question option")
    @PostMapping
    public ResponseEntity<QuestionOption> create(@RequestBody QuestionOption option) {
        return ResponseEntity.ok(optionRepo.save(option));
    }

    @Operation(summary = "Delete question option by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        optionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
