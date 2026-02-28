package com.example.starter_project_2025.system.dataio.mapping.programmingLanguage;

import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import org.springframework.context.ApplicationContext;

public class ProgrammingLanguageResolver implements LookupResolver {
    @Override
    public Object resolve(String cellValue, ApplicationContext context) {
        if (cellValue == null || cellValue.isBlank()) {
            return null;
        }

        ProgrammingLanguageRepository repo =
                context.getBean(ProgrammingLanguageRepository.class);

        ProgrammingLanguage language =
                repo.findByName(cellValue.trim());

        if (language == null) {
            throw new RuntimeException("Programming Language not found: " + cellValue);
        }

        return language;
    }
}
