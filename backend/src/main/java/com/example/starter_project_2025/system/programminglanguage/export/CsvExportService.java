package com.example.starter_project_2025.system.programminglanguage.export;

import com.example.starter_project_2025.exception.BadRequestException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * CSV export implementation.
 */
@Service
public class CsvExportService implements ExportService {

    private static final String CONTENT_TYPE = "text/csv";
    private static final String FILE_EXTENSION = "csv";

    @Override
    public Resource export(List<Map<String, Object>> rows, List<String> headers, String sheetName) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(outputStream);

            // Write header row
            writer.println(String.join(",", headers.stream()
                    .map(this::escapeCsvValue)
                    .toList()));

            // Write data rows
            for (Map<String, Object> row : rows) {
                String line = headers.stream()
                        .map(header -> {
                            Object value = row.get(header);
                            return escapeCsvValue(formatValue(value));
                        })
                        .reduce((a, b) -> a + "," + b)
                        .orElse("");
                writer.println(line);
            }

            writer.flush();
            return new ByteArrayResource(outputStream.toByteArray());

        } catch (Exception e) {
            throw new BadRequestException("Error generating CSV export: " + e.getMessage());
        }
    }

    @Override
    public String getContentType() {
        return CONTENT_TYPE;
    }

    @Override
    public String getFileExtension() {
        return FILE_EXTENSION;
    }

    // ==================== Private Helpers ====================

    private String formatValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Boolean) {
            return (Boolean) value ? "Yes" : "No";
        }
        return value.toString();
    }

    /**
     * Escapes CSV values: wraps in quotes if contains comma, quote, or newline.
     */
    private String escapeCsvValue(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
