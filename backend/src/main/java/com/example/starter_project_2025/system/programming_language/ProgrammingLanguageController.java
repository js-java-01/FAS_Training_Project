package com.example.starter_project_2025.system.programming_language;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
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