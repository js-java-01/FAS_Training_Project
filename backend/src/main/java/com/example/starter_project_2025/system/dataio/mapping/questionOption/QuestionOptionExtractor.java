package com.example.starter_project_2025.system.dataio.mapping.questionOption;

import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;

import java.util.stream.Collectors;

public class QuestionOptionExtractor implements ExportValueExtractor {
    @Override
    public Object extract(Object source) {
        Question q = (Question) source;

        return q.getOptions()
                .stream()
                .map(o -> o.getContent() + "|" + o.isCorrect())
                .collect(Collectors.joining("; "));
    }
}
