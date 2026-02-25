package com.example.starter_project_2025.system.dataio.exporter.service;

import com.example.starter_project_2025.system.dataio.exporter.components.ExportSheetConfig;
import com.example.starter_project_2025.system.dataio.FileFormat;
import com.example.starter_project_2025.system.dataio.exporter.variant.Exporter;
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
public class GenericExportService implements ExportService {

    Map<FileFormat, Exporter> exporters;

    public GenericExportService(List<Exporter> exporterList) {
        this.exporters = exporterList.stream()
                .collect(Collectors.toMap(Exporter::format, e -> e));
    }

    @Override
    public <T> void export(
            FileFormat format,
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
            FileFormat format,
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

