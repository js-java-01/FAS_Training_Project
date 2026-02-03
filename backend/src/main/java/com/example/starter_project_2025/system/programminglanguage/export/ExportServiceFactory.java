package com.example.starter_project_2025.system.programminglanguage.export;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.system.programminglanguage.dto.ExportFormat;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

/**
 * Factory for creating ExportService instances based on format.
 * 
 * Uses Strategy pattern to select the appropriate export implementation.
 */
@Component
public class ExportServiceFactory {

    private final Map<ExportFormat, ExportService> exportServices;

    public ExportServiceFactory(
            ExcelExportService excelExportService,
            CsvExportService csvExportService
    ) {
        this.exportServices = new EnumMap<>(ExportFormat.class);
        this.exportServices.put(ExportFormat.EXCEL, excelExportService);
        this.exportServices.put(ExportFormat.CSV, csvExportService);
        // PDF can be added here when implemented
    }

    /**
     * Returns the appropriate ExportService for the given format.
     *
     * @param format Export format
     * @return ExportService implementation
     * @throws BadRequestException if format is not supported
     */
    public ExportService getService(ExportFormat format) {
        ExportService service = exportServices.get(format);
        if (service == null) {
            throw new BadRequestException("Export format not supported: " + format);
        }
        return service;
    }

    /**
     * Checks if a format is supported.
     *
     * @param format Export format
     * @return true if supported
     */
    public boolean isSupported(ExportFormat format) {
        return exportServices.containsKey(format);
    }
}
