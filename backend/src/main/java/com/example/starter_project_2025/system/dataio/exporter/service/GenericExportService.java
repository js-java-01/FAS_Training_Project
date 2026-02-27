package com.example.starter_project_2025.system.dataio.exporter.service;

import com.example.starter_project_2025.system.dataio.common.FileFormat;
import com.example.starter_project_2025.system.dataio.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.exporter.builder.ExportConfigBuilder;
import com.example.starter_project_2025.system.dataio.exporter.component.ExportSheetConfig;
import com.example.starter_project_2025.system.dataio.exporter.variant.Exporter;
import com.example.starter_project_2025.system.dataio.util.ExportFileNameBuilder;
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
    ExportConfigBuilder configBuilder;

    public GenericExportService(
            List<Exporter> exporterList,
            ExportConfigBuilder configBuilder
    ) {
        this.exporters = exporterList.stream()
                .collect(Collectors.toMap(Exporter::format, e -> e));
        this.configBuilder = configBuilder;
    }

    @Override
    public <T> void export(
            FileFormat format,
            List<T> data,
            Class<T> clazz,
            HttpServletResponse response
    ) throws IOException {

        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Export data is empty");
        }

        ExportSheetConfig<T> config = configBuilder.build(clazz);
        Exporter exporter = getExporter(format);

        String fileName = resolveFileName(clazz, format);

        setResponseHeader(format, fileName, response);

        exporter.export(data, config, response.getOutputStream());
    }

    private Exporter getExporter(FileFormat format) {
        Exporter exporter = exporters.get(format);

        if (exporter == null) {
            throw new IllegalArgumentException(
                    "Unsupported export format: " + format);
        }
        return exporter;
    }

    private String resolveFileName(Class<?> clazz, FileFormat format) {

        ExportEntity meta = clazz.getAnnotation(ExportEntity.class);

        String baseName = (meta != null)
                ? meta.fileName()
                : clazz.getSimpleName().toLowerCase();

        return ExportFileNameBuilder.build(
                baseName,
                format.extension()
        );
    }

    private void setResponseHeader(
            FileFormat format,
            String finalName,
            HttpServletResponse response
    ) {
        switch (format) {
            case EXCEL ->
                    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case CSV ->
                    response.setContentType("text/csv");
            case PDF ->
                    response.setContentType("application/pdf");
        }

        response.setHeader(
                "Content-Disposition",
                "attachment; filename=\"" + finalName + "\""
        );

        response.setHeader(
                "Access-Control-Expose-Headers",
                "Content-Disposition"
        );
    }
}

