package com.example.starter_project_2025.system.dataio.exporter.metadata;

import com.example.starter_project_2025.system.dataio.exporter.resolver.extractor.ExportValueExtractor;
import lombok.Builder;

import java.lang.reflect.Field;

@Builder
public record ExportFieldMeta(
        String header,
        int order,
        Field field,
        String dateFormat,
        String path,
        ExportValueExtractor extractor
) {}
