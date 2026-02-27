package com.example.starter_project_2025.system.dataio.core.exporter.component;

import lombok.Builder;

import java.util.function.Function;

@Builder
public record ExportColumn<T>(
        String header,
        Function<T, Object> valueExtractor
) {
}

