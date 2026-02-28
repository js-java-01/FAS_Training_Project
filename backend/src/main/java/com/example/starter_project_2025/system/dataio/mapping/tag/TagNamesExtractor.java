package com.example.starter_project_2025.system.dataio.mapping.tag;

import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;

import java.util.stream.Collectors;

public class TagNamesExtractor implements ExportValueExtractor {
    @Override
    public Object extract(Object source) {
        Question q = (Question) source;

        return q.getTags()
                .stream()
                .map(Tag::getName)
                .collect(Collectors.joining(", "));
    }

}
