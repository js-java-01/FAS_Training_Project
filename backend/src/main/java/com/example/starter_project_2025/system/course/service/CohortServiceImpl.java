package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CohortCreateRequest;
import com.example.starter_project_2025.system.course.dto.CohortResponse;
import com.example.starter_project_2025.system.course.dto.CohortUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseCohort;
import com.example.starter_project_2025.system.course.enums.CohortStatus;
import com.example.starter_project_2025.system.course.mapper.CohortMapper;
import com.example.starter_project_2025.system.course.repository.CourseCohortRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.DateUtil;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CohortServiceImpl implements CohortService {

    private final CourseCohortRepository cohortRepository;
    private final CourseRepository courseRepository;
    private final CohortMapper cohortMapper;

    private static final String[] HEADERS = {
            "Code", "Start Date (yyyy-MM-dd)", "End Date (yyyy-MM-dd)", "Capacity", "Status"
    };

    @Override
    public CohortResponse create(CohortCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseCohort cohort = cohortMapper.toEntity(request);
        cohort.setCourse(course);

        return cohortMapper.toResponse(cohortRepository.save(cohort));
    }

    @Override
    public CohortResponse update(UUID id, CohortUpdateRequest request) {
        CourseCohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));

        if (request.getCode() != null)
            cohort.setCode(request.getCode());
        if (request.getStartDate() != null)
            cohort.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            cohort.setEndDate(request.getEndDate());
        if (request.getCapacity() != null)
            cohort.setCapacity(request.getCapacity());
        if (request.getStatus() != null)
            cohort.setStatus(request.getStatus());

        return cohortMapper.toResponse(cohortRepository.save(cohort));
    }

    @Override
    public void delete(UUID id) {
        cohortRepository.deleteById(id);
    }

    @Override
    public CohortResponse getById(UUID id) {
        return cohortRepository.findById(id)
                .map(cohortMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
    }

    @Override
    public List<CohortResponse> getByCourseId(UUID courseId) {
        return cohortRepository.findByCourseId(courseId)
                .stream()
                .map(cohortMapper::toResponse)
                .toList();
    }

    @Override
    public List<CohortResponse> getAll() {
        return cohortRepository.findAll()
                .stream()
                .map(cohortMapper::toResponse)
                .toList();
    }

    // ─── EXPORT ──────────────────────────────────────────────────────────────

    @Override
    public ResponseEntity<byte[]> exportCohorts(UUID courseId) {
        List<CourseCohort> cohorts = cohortRepository.findByCourseId(courseId);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Cohorts");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Date cell style: display as text "yyyy-MM-dd" to avoid Excel reformat issues
            CellStyle dateStyle = wb.createCellStyle();
            dateStyle.setDataFormat(wb.createDataFormat().getFormat("yyyy-MM-dd"));

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (CourseCohort c : cohorts) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getCode() != null ? c.getCode() : "");

                Cell startCell = row.createCell(1);
                if (c.getStartDate() != null) {
                    startCell.setCellValue(c.getStartDate().toString());
                }

                Cell endCell = row.createCell(2);
                if (c.getEndDate() != null) {
                    endCell.setCellValue(c.getEndDate().toString());
                }

                row.createCell(3).setCellValue(c.getCapacity() != null ? c.getCapacity() : 0);
                row.createCell(4).setCellValue(c.getStatus() != null ? c.getStatus().name() : "DRAFT");
            }
            for (int i = 0; i < HEADERS.length; i++)
                sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cohorts_export.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export cohorts", e);
        }
    }

    // ─── TEMPLATE ────────────────────────────────────────────────────────────

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Cohorts");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample row
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("JBM-01-2026-C1");
            sample.createCell(1).setCellValue("2026-03-01");
            sample.createCell(2).setCellValue("2026-06-30");
            sample.createCell(3).setCellValue(30);
            sample.createCell(4).setCellValue("DRAFT"); // DRAFT | OPEN | CLOSED

            for (int i = 0; i < HEADERS.length; i++)
                sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cohorts_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate cohort template", e);
        }
    }

    // ─── IMPORT ──────────────────────────────────────────────────────────────

    @Override
    public void importCohorts(UUID courseId, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        try (InputStream is = file.getInputStream();
                Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (!rows.hasNext())
                return;
            rows.next(); // skip header

            while (rows.hasNext()) {
                Row row = rows.next();

                String code = getCellStr(row, 0);
                if (code == null || code.isBlank())
                    continue;

                if (cohortRepository.existsByCode(code)) {
                    throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST,
                            "Cohort code already exists: " + code);
                }

                CourseCohort cohort = new CourseCohort();
                cohort.setCode(code);
                cohort.setCourse(course);

                LocalDate startDate = getCellDate(row, 1);
                if (startDate != null)
                    cohort.setStartDate(startDate);

                LocalDate endDate = getCellDate(row, 2);
                if (endDate != null)
                    cohort.setEndDate(endDate);

                String capStr = getCellStr(row, 3);
                if (capStr != null && !capStr.isBlank()) {
                    try {
                        cohort.setCapacity(Integer.parseInt(capStr.trim()));
                    } catch (NumberFormatException ignored) {
                    }
                }

                String statusStr = getCellStr(row, 4);
                if (statusStr != null && !statusStr.isBlank()) {
                    try {
                        cohort.setStatus(CohortStatus.valueOf(statusStr.trim().toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                        cohort.setStatus(CohortStatus.DRAFT);
                    }
                } else {
                    cohort.setStatus(CohortStatus.DRAFT);
                }

                cohortRepository.save(cohort);
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import cohorts", e);
        }
    }

    private String getCellStr(Row row, int idx) {
        Cell cell = row.getCell(idx);
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalDate().toString()
                    : String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    private LocalDate getCellDate(Row row, int idx) {
        Cell cell = row.getCell(idx);
        if (cell == null)
            return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            }
            if (cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().trim();
                if (!val.isBlank())
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}