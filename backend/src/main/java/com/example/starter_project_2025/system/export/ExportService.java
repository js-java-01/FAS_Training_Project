package com.example.starter_project_2025.system.export;

import com.example.starter_project_2025.system.export.components.ExportSheetConfig;
import com.example.starter_project_2025.system.export.exporter.Exporter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExportService {

    Map<ExportFormat, Exporter> exporters;

    public ExportService(List<Exporter> exporterList) {
        this.exporters = exporterList.stream()
                .collect(Collectors.toMap(Exporter::format, e -> e));
    }

    public <T> void export(
            ExportFormat format,
            List<T> data,
            ExportSheetConfig<T> config,
            HttpServletResponse response
    ) throws IOException {

        Exporter exporter = exporters.get(format);
        if (exporter == null) {
            throw new IllegalArgumentException("Unsupported format");
        }

        setResponseHeader(format, response);

        exporter.export(data, config, response.getOutputStream());
    }

    private void setResponseHeader(
            ExportFormat format,
            HttpServletResponse response
    ) {
        switch (format) {
            case EXCEL -> {
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader("Content-Disposition", "attachment; filename=data.xlsx");
            }
            case CSV -> {
                response.setContentType("text/csv");
                response.setHeader("Content-Disposition", "attachment; filename=data.csv");
            }
            case PDF -> {
                response.setContentType("application/pdf");
                response.setHeader("Content-Disposition", "attachment; filename=data.pdf");
            }
        }
    }
}

