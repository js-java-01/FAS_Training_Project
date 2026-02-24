package com.example.starter_project_2025.system.export.exporter;

import com.example.starter_project_2025.system.export.ExportFormat;
import com.example.starter_project_2025.system.export.components.ExportColumn;
import com.example.starter_project_2025.system.export.components.ExportSheetConfig;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CsvExporter implements Exporter {

    @Override
    public ExportFormat format() {
        return ExportFormat.CSV;
    }

    @Override
    public <T> void export(
            List<T> data,
            ExportSheetConfig<T> config,
            OutputStream os
    ) throws IOException {

        PrintWriter writer = new PrintWriter(os);

        // Header
        writer.println(
                config.getColumns().stream()
                        .map(ExportColumn::getHeader)
                        .collect(Collectors.joining(","))
        );

        // Data
        for (T item : data) {
            String line = config.getColumns().stream()
                    .map(c -> {
                        Object v = c.getValueExtractor().apply(item);
                        return v != null ? v.toString() : "";
                    })
                    .collect(Collectors.joining(","));

            writer.println(line);
        }

        writer.flush();
    }
}


