package com.example.starter_project_2025.system.export.exporter;

import com.example.starter_project_2025.system.export.ExportFormat;
import com.example.starter_project_2025.system.export.components.ExportSheetConfig;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public interface Exporter {

    ExportFormat format();

    <T> void export(
            List<T> data,
            ExportSheetConfig<T> config,
            OutputStream os
    ) throws IOException;
}


