package com.example.starter_project_2025.system.dataio.mapping.programmingLanguage;

import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;

public class ProgrammingLanguageExtractor implements ExportValueExtractor {
    @Override
    public Object extract(Object source) {
        ProgrammingLanguage language = (ProgrammingLanguage) source;

        if (language == null) {
            return null;
        }

        return language.getName();
    }
}
