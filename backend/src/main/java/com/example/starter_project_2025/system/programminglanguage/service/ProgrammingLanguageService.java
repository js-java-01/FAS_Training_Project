package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageDTO;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageFilter;

import java.util.UUID;

public interface ProgrammingLanguageService
        extends CrudService<UUID, ProgrammingLanguageDTO, ProgrammingLanguageFilter> {
}