package com.example.starter_project_2025.system.dataio.mapping.assessmentType;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;

public class AssessmentTypeExtractor implements ExportValueExtractor {
    @Override
    public Object extract(Object source) {

        AssessmentType type = (AssessmentType) source;

        if (type == null) {
            return null;
        }

        return type.getName();
    }
}
