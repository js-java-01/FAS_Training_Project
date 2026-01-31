package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.system.programminglanguage.dto.*;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/programming-languages")
public class ProgrammingLanguageController {

    private final ProgrammingLanguageService service;

    public ProgrammingLanguageController(ProgrammingLanguageService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ProgrammingLanguageResponse create(
            @Valid @RequestBody ProgrammingLanguageCreateRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_UPDATE')")
    public ProgrammingLanguageResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProgrammingLanguageUpdateRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_DELETE')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ProgrammingLanguageResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public Page<ProgrammingLanguageResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        return service.list(search, page, size, direction);
    }
}
