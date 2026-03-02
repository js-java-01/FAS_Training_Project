package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageDTO;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageFilter;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/programming-languages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Programming Language Management", description = "APIs for managing programming languages")
public class ProgrammingLanguageController
        extends BaseCrudDataIoController<
        ProgrammingLanguage,
        UUID,
        ProgrammingLanguageDTO,
        ProgrammingLanguageFilter> {

    ProgrammingLanguageService service;
    ProgrammingLanguageRepository repository;

    @Override
    protected CrudService<UUID, ProgrammingLanguageDTO, ProgrammingLanguageFilter> getService() {
        return service;
    }

    @Override
    protected BaseCrudRepository<ProgrammingLanguage, UUID> getRepository() {
        return repository;
    }

    @Override
    protected Class<ProgrammingLanguage> getEntityClass() {
        return ProgrammingLanguage.class;
    }
}