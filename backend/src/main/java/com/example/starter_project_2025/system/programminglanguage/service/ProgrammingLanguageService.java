package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.programminglanguage.dto.ImportResultResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageCreateRequest;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageUpdateRequest;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.mapper.ProgrammingLanguageMapper;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgrammingLanguageService {

    private final ProgrammingLanguageRepository repository;
    private final ProgrammingLanguageMapper mapper;

    public ProgrammingLanguageResponse create(ProgrammingLanguageCreateRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }

        ProgrammingLanguage language = mapper.toEntity(request);

        ProgrammingLanguage saved = repository.save(language);
        return mapper.toResponse(saved);
    }

    public ProgrammingLanguageResponse update(Long id, ProgrammingLanguageUpdateRequest request) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (!language.getName().equalsIgnoreCase(request.getName())
                && repository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException(
                    "Programming language with this name already exists"
            );
        }
        mapper.updateEntityFromRequest(request, language);
        ProgrammingLanguage saved = repository.save(language);
        return mapper.toResponse(saved);
    }

    public void delete(Long id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));

        if (isUsedByAnyExercise(id)) {
            throw new BadRequestException("Cannot delete programming language as it is used by existing exercises");
        }
        repository.delete(language);
    }

    public ProgrammingLanguageResponse getById(Long id) {
        ProgrammingLanguage language = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programming language not found"));
        return mapper.toResponse(language);
    }

    public Page<ProgrammingLanguageResponse> list(
            String search,
            int page,
            int size,
            Sort.Direction direction
    ){
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, "name")
        );

        Page<ProgrammingLanguage> result;

        if (StringUtils.hasText(search)) {
            result = repository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            result = repository.findAll(pageable);
        }
        return result.map(mapper::toResponse);
    }

    private boolean isUsedByAnyExercise(Long programmingLanguageId) {
        // Placeholder for actual implementation
        return false;
    }

    // ==================== EXPORT ====================

    public byte[] exportToExcel() {
        List<ProgrammingLanguage> languages = repository.findAll(Sort.by("name"));

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Programming Languages");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Name", "Version", "Description", "Is Supported"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            int rowNum = 1;
            for (ProgrammingLanguage lang : languages) {
                Row row = sheet.createRow(rowNum++);

                Cell idCell = row.createCell(0);
                idCell.setCellValue(lang.getId());
                idCell.setCellStyle(dataStyle);

                Cell nameCell = row.createCell(1);
                nameCell.setCellValue(lang.getName());
                nameCell.setCellStyle(dataStyle);

                Cell versionCell = row.createCell(2);
                versionCell.setCellValue(lang.getVersion() != null ? lang.getVersion() : "");
                versionCell.setCellStyle(dataStyle);

                Cell descCell = row.createCell(3);
                descCell.setCellValue(lang.getDescription() != null ? lang.getDescription() : "");
                descCell.setCellStyle(dataStyle);

                Cell supportedCell = row.createCell(4);
                supportedCell.setCellValue(lang.getSupported() ? "Yes" : "No");
                supportedCell.setCellStyle(dataStyle);
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Error exporting programming languages: " + e.getMessage());
        }
    }

    // ==================== IMPORT TEMPLATE ====================

    public byte[] generateImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Programming Languages");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Create header row (Name, Version, Description - ID and isSupported are auto-generated)
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name (Required)", "Version", "Description"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add example row
            CellStyle exampleStyle = workbook.createCellStyle();
            exampleStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            exampleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row exampleRow = sheet.createRow(1);
            Cell cell1 = exampleRow.createCell(0);
            cell1.setCellValue("Python");
            cell1.setCellStyle(exampleStyle);

            Cell cell2 = exampleRow.createCell(1);
            cell2.setCellValue("3.12");
            cell2.setCellStyle(exampleStyle);

            Cell cell3 = exampleRow.createCell(2);
            cell3.setCellValue("A popular programming language");
            cell3.setCellStyle(exampleStyle);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Error generating import template: " + e.getMessage());
        }
    }

    // ==================== IMPORT ====================

    public ImportResultResponse importFromExcel(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to import");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx files are supported");
        }

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();

            if (lastRowNum < 0) {
                throw new BadRequestException("The Excel file is empty or contains no data");
            }

            // Validate header row (row 0)
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BadRequestException("Header row is missing in the Excel file");
            }

            // Find column indices by matching header names
            Integer nameColumnIndex = findColumnIndex(headerRow, "Name");
            Integer versionColumnIndex = findColumnIndex(headerRow, "Version");
            Integer descriptionColumnIndex = findColumnIndex(headerRow, "Description");

            // Validate that required columns are present
            if (nameColumnIndex == null) {
                throw new BadRequestException("Required column 'Name' not found in header row. Expected headers: Name, Version, Description");
            }

            // Process data rows (starting from row 1)
            for (int rowNum = 1; rowNum <= lastRowNum; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null) continue;

                try {
                    String name = getCellStringValue(row.getCell(nameColumnIndex));
                    String version = versionColumnIndex != null ? getCellStringValue(row.getCell(versionColumnIndex)) : null;
                    String description = descriptionColumnIndex != null ? getCellStringValue(row.getCell(descriptionColumnIndex)) : null;

                    // Validate required fields
                    if (!StringUtils.hasText(name)) {
                        result.addError(rowNum + 1, "Name is required");
                        continue;
                    }

                    // Check for duplicate name
                    if (repository.existsByNameIgnoreCase(name.trim())) {
                        result.addError(rowNum + 1, "Programming language '" + name + "' already exists");
                        continue;
                    }

                    // Create new programming language
                    ProgrammingLanguage language = new ProgrammingLanguage(
                            name.trim(),
                            normalizeString(version),
                            normalizeString(description)
                    );

                    repository.save(language);
                    result.incrementSuccess();

                } catch (Exception e) {
                    result.addError(rowNum + 1, "Error processing row: " + e.getMessage());
                }
            }

        } catch (IOException e) {
            throw new BadRequestException("Error reading Excel file: " + e.getMessage());
        }

        return result;
    }

    /**
     * Finds the column index for a given header name (case-insensitive).
     * Handles headers with suffixes like "Name (Required)".
     *
     * @param headerRow the header row to search
     * @param headerName the header name to find
     * @return the column index if found, null otherwise
     */
    private Integer findColumnIndex(Row headerRow, String headerName) {
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String cellValue = getCellStringValue(cell);
                if (cellValue != null) {
                    // Remove parentheses and their content, then trim and compare
                    String cleanedValue = cellValue.replaceAll("\\s*\\([^)]*\\)", "").trim();
                    if (cleanedValue.equalsIgnoreCase(headerName)) {
                        return i;
                    }
                }
            }
        }
        return null;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    /**
     * Normalizes a string by trimming whitespace and handling null values.
     *
     * @param input the string to normalize
     * @return normalized string or null if input was null/empty
     */
    private String normalizeString(String input) {
        if (input == null) return null;
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
