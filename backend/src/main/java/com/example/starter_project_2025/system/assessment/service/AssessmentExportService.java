package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.dto.ExportFormat;
import com.example.starter_project_2025.system.assessment.dto.ExportPreviewResponse;
import com.example.starter_project_2025.system.assessment.dto.ExportRequest;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.export.AssessmentFieldMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.spec.AssessmentTypeSpecification;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssessmentExportService {

    private final AssessmentTypeRepository repository;
    private final AssessmentFieldMapper fieldMapper;

    public ExportPreviewResponse getPreview(ExportRequest request) {
        Specification<AssessmentType> spec = AssessmentTypeSpecification.withFilters(
                request.getKeyword(),
                request.getFilters());

        Pageable pageable = buildPageable(request);
        Page<AssessmentType> page = repository.findAll(spec, pageable);

        List<String> fieldsToShow = fieldMapper.validateFields(request.getSelectedFields());
        if (fieldsToShow.isEmpty()) {
            fieldsToShow = fieldMapper.getAllFieldNames();
        }

        List<Map<String, Object>> content = fieldMapper.toMapList(page.getContent(), fieldsToShow);

        return new ExportPreviewResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                fieldMapper.getAvailableFields());
    }

    public Resource export(ExportRequest request) {
        Specification<AssessmentType> spec = AssessmentTypeSpecification.withFilters(
                request.getKeyword(),
                request.getFilters());

        Sort sort = buildSort(request);
        List<AssessmentType> entities;

        if (request.getTotalEntries() != null && request.getTotalEntries() > 0) {
            Pageable pageable = PageRequest.of(0, request.getTotalEntries(), sort);
            entities = repository.findAll(spec, pageable).getContent();
        } else {
            // Limit to 10000 to prevent OOM if no limit
            Pageable pageable = PageRequest.of(0, 10000, sort);
            entities = repository.findAll(spec, pageable).getContent();
        }

        List<String> fields = fieldMapper.validateFields(request.getSelectedFields());
        List<Map<String, Object>> data = fieldMapper.toMapList(entities, fields);

        if (request.getFormat() == ExportFormat.CSV) {
            return generateCsv(data, fields);
        } else {
            return generateExcel(data, fields);
        }
    }

    public String getContentType(ExportRequest request) {
        return request.getFormat() == ExportFormat.CSV ? "text/csv"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    public String getFileExtension(ExportRequest request) {
        return request.getFormat() == ExportFormat.CSV ? "csv" : "xlsx";
    }

    private Pageable buildPageable(ExportRequest request) {
        Sort sort = buildSort(request);
        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }

    private Sort buildSort(ExportRequest request) {
        Sort.Direction direction = Sort.Direction.fromString(request.getSortDirection());
        return Sort.by(direction, request.getSortBy());
    }

    private Resource generateExcel(List<Map<String, Object>> data, List<String> headers) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Assessments");

            // Header
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i).toUpperCase());
            }

            // Data
            int rowNum = 1;
            for (Map<String, Object> row : data) {
                Row dataRow = sheet.createRow(rowNum++);
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = dataRow.createCell(i);
                    Object value = row.get(headers.get(i));
                    cell.setCellValue(value != null ? value.toString() : "");
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayResource(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }

    private Resource generateCsv(List<Map<String, Object>> data, List<String> headers) {
        StringBuilder csv = new StringBuilder();
        // Header
        csv.append(String.join(",", headers)).append("\n");

        // Data
        for (Map<String, Object> row : data) {
            for (int i = 0; i < headers.size(); i++) {
                Object value = row.get(headers.get(i));
                String valStr = value != null ? value.toString() : "";
                // Simple CSV escaping
                if (valStr.contains(",") || valStr.contains("\"") || valStr.contains("\n")) {
                    valStr = "\"" + valStr.replace("\"", "\"\"") + "\"";
                }
                csv.append(valStr);
                if (i < headers.size() - 1) {
                    csv.append(",");
                }
            }
            csv.append("\n");
        }
        return new ByteArrayResource(csv.toString().getBytes());
    }
}
