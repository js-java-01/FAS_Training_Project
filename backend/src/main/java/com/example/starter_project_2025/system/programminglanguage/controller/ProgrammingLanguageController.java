package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.system.programminglanguage.dto.*;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/programming-languages")
public class ProgrammingLanguageController {

    private final ProgrammingLanguageService service;

    public ProgrammingLanguageController(ProgrammingLanguageService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINING_ADMIN', 'CONTENT_CURATOR')")
    public ProgrammingLanguageResponse create(
            @Valid @RequestBody ProgrammingLanguageCreateRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_ADMIN')")
    public ProgrammingLanguageResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProgrammingLanguageUpdateRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public ProgrammingLanguageResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<ProgrammingLanguageResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        return service.list(search, page, size, direction);
    }
}
