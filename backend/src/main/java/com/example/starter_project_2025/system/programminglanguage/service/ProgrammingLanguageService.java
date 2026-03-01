package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageCreateRequest;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageUpdateRequest;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.mapper.ProgrammingLanguageMapper;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgrammingLanguageService {

    private final ProgrammingLanguageRepository repository;
    private final ProgrammingLanguageMapper mapper;

    public ProgrammingLanguageResponse create(ProgrammingLanguageCreateRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }

        ProgrammingLanguage language = mapper.toEntity(request);

        ProgrammingLanguage saved = repository.save(language);
        return mapper.toResponse(saved);
    }

    public ProgrammingLanguageResponse update(UUID id, ProgrammingLanguageUpdateRequest request) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (!language.getName().equalsIgnoreCase(request.getName())
                && repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }
        mapper.updateEntityFromRequest(request, language);
        ProgrammingLanguage saved = repository.save(language);
        return mapper.toResponse(saved);
    }

    public void delete(UUID id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (isUsedByAnyExercise(id)) {
            throw new BadRequestException("Cannot delete programming language as it is used by existing exercises");
        }
        repository.delete(language);
    }

    public ProgrammingLanguageResponse getById(UUID id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));
        return mapper.toResponse(language);
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
        return result.map(mapper::toResponse);
    }

    private boolean isUsedByAnyExercise(UUID programmingLanguageId) {
        // Placeholder for actual implementation
        return false;
    }

}
