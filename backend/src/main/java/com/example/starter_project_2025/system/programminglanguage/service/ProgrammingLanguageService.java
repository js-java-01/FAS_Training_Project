package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.aop.annotation.LogExecutionTime;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.programminglanguage.dto.*;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProgrammingLanguageService {

    private final ProgrammingLanguageRepository repository;

    public ProgrammingLanguageService(ProgrammingLanguageRepository repository) {
        this.repository = repository;
    }

    @LogExecutionTime
    public ProgrammingLanguageResponse create(ProgrammingLanguageCreateRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }

        ProgrammingLanguage language = new ProgrammingLanguage(
                request.getName().trim(),
                normalize(request.getVersion()),
                normalize(request.getDescription())
        );

        ProgrammingLanguage saved = repository.save(language);
        return toResponse(saved);
    }

    public ProgrammingLanguageResponse update(Long id, ProgrammingLanguageUpdateRequest request) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (!language.getName().equalsIgnoreCase(request.getName())
                && repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }
        language.updateDetails(
                request.getName().trim(),
                normalize(request.getVersion()),
                normalize(request.getDescription())
        );
        ProgrammingLanguage saved = repository.save(language);
        return toResponse(saved);
    }

    public void delete(Long id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (isUsedByAnyExercise(id)) {
            throw new BadRequestException("Cannot delete programming language as it is used by existing exercises");
        }
        repository.delete(language);
    }

    public ProgrammingLanguageResponse getById(Long id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));
        return toResponse(language);
    }

    public Page<ProgrammingLanguageResponse> list(
            String search,
            int page,
            int size,
            Sort.Direction direction
    ){
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, "name")
        );

        Page<ProgrammingLanguage> result;

        if (StringUtils.hasText(search)) {
            result = repository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            result = repository.findAll(pageable);
        }
        return result.map(this::toResponse);
    }

    private ProgrammingLanguageResponse toResponse(ProgrammingLanguage entity) {
        ProgrammingLanguageResponse response = new ProgrammingLanguageResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setVersion(
                entity.getVersion() != null ? entity.getVersion() : "N/A"
        );
        response.setDescription(
                entity.getDescription() != null ? entity.getDescription() : "N/A"
        );
        response.setSupported(entity.isSupported());
        return response;
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private boolean isUsedByAnyExercise(Long programmingLanguageId) {
        // Placeholder for actual implementation
        return false;
    }
}
