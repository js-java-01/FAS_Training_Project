package com.example.starter_project_2025.system.dataio.exporter.components;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Builder
public record ExportSheetConfig<T>(
        String sheetName,
        List<ExportColumn<T>> columns
) {
}
