package com.example.starter_project_2025.system.export.exporter;

import com.example.starter_project_2025.system.export.ExportFormat;
import com.example.starter_project_2025.system.export.components.ExportColumn;
import com.example.starter_project_2025.system.export.components.ExportSheetConfig;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Table;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

@Component
public class PdfExporter implements Exporter {

    @Override
    public ExportFormat format() {
        return ExportFormat.PDF;
    }

    @Override
    public <T> void export(
            List<T> data,
            ExportSheetConfig<T> config,
            OutputStream os
    ) throws IOException {

        PdfWriter writer = new PdfWriter(os);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        Table table = new Table(config.getColumns().size());

        // Header
        for (ExportColumn<T> col : config.getColumns()) {
            table.addHeaderCell(col.getHeader());
        }

        // Data
        for (T item : data) {
            for (ExportColumn<T> col : config.getColumns()) {
                Object v = col.getValueExtractor().apply(item);
                table.addCell(v != null ? v.toString() : "");
            }
        }

        document.add(table);
        document.close();
    }
}


