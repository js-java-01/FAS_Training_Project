package com.example.starter_project_2025.system.programminglanguage.repository;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgrammingLanguageRepository
        extends BaseCrudRepository<ProgrammingLanguage, UUID> {

    Optional<ProgrammingLanguage> findByName(String name);

    boolean existsByName(String name);

    Long countByIsSupported(Boolean isSupported);
}