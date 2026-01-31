package com.example.starter_project_2025.system.programminglanguage.repository;

import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammingLanguageRepository
        extends JpaRepository<ProgrammingLanguage, Long> {

    boolean existsByNameIgnoreCase(String name);
    Page<ProgrammingLanguage> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
