package com.example.starter_project_2025.system.dataio.mapping.question;

import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;

public class QuestionCategoryNameExtractor implements ExportValueExtractor {
    @Override
    public Object extract(Object source) {
        Question q = (Question) source;
        return q.getCategory() != null
                ? q.getCategory().getName()
                : "";
    }

}
