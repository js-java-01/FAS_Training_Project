package com.example.starter_project_2025.system.dataio.exporter.variant;

import com.example.starter_project_2025.system.dataio.common.FileFormat;
import com.example.starter_project_2025.system.dataio.exporter.component.ExportSheetConfig;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public interface Exporter {

    FileFormat format();

    <T> void export(
            List<T> data,
            ExportSheetConfig<T> config,
            OutputStream os
    ) throws IOException;
}


