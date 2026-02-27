package com.example.starter_project_2025.system.dataio.core.exporter.metadata;

import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;
import lombok.Builder;

import java.lang.reflect.Field;

@Builder
public record ExportFieldMeta(
        String header,
        Field field,
        String dateFormat,
        String path,
        ExportValueExtractor extractor
) {}
