package com.example.starter_project_2025.system.semester.services;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
public class SemesterImportExportServiceImpl implements SemesterImportExportService
{
    private static final String[] TEMPLATE_HEADERS = {
            "name",
            "startDate",
            "endDate"
    };
    private final SemesterRepository semesterRepository;

    public ResponseEntity<byte[]> downloadTemplate()
    {
        try (Workbook workbook = new XSSFWorkbook())
        {
            Sheet sheet = workbook.createSheet("Semesters");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++)
            {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=semesters-template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e)
        {
            throw new RuntimeException("Failed to generate semester template", e);
        }
    }

    public ImportResultResponse importExcel(MultipartFile file)
    {

        if (file == null || file.isEmpty())
        {
            throw new RuntimeException("File is empty");
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".xlsx"))
        {
            throw new RuntimeException("Invalid file format. Only .xlsx is allowed");
        }

        ImportResultResponse result = new ImportResultResponse();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is))
        {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext())
            {
                throw new RuntimeException("File is empty");
            }

            Row header = rows.next();

            if (header.getPhysicalNumberOfCells() < 3)
            {
                throw new RuntimeException("Invalid template format. Expected 3 columns.");
            }

            int rowIndex = 1;

            while (rows.hasNext())
            {
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);

                try
                {
                    String name = getString(row, 0);
                    LocalDate startDate = getLocalDate(row, 1);
                    LocalDate endDate = getLocalDate(row, 2);

                    if (name == null || name.isBlank())
                    {
                        throw new IllegalArgumentException("name|Name is required");
                    }

                    if (semesterRepository.existsByNameIgnoreCase((name.trim())))
                    {
                        throw new IllegalArgumentException("name|Semester name already exists");
                    }

                    if (startDate == null)
                    {
                        throw new IllegalArgumentException("startDate|Start date is required and must be valid");
                    }

                    if (endDate == null)
                    {
                        throw new IllegalArgumentException("endDate|End date is required and must be valid");
                    }

                    if (endDate.isBefore(startDate) || endDate.isEqual(startDate))
                    {
                        throw new IllegalArgumentException("endDate|End date must be after start date");
                    }

                    Semester semester = new Semester();
                    semester.setName(name.trim());
                    semester.setStartDate(startDate);
                    semester.setEndDate(endDate);

                    semesterRepository.save(semester);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex)
                {

                    result.setFailedCount(result.getFailedCount() + 1);

                    String msg = ex.getMessage() == null ? "Unknown error" : ex.getMessage();
                    String[] err = msg.split("\\|");

                    result.getErrors().add(
                            new ImportErrorDetail(
                                    rowIndex + 1,
                                    err[0],
                                    err.length > 1 ? err[1] : msg
                            )
                    );
                }

                rowIndex++;
            }

        } catch (Exception e)
        {
            throw new RuntimeException("Import semesters failed");
        }

        return result;
    }

    public ResponseEntity<byte[]> exportExcel()
    {
        try (Workbook workbook = new XSSFWorkbook())
        {
            Sheet sheet = workbook.createSheet("Semesters");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++)
            {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (Semester s : semesterRepository.findAll())
            {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getName());

                if (s.getStartDate() != null)
                {
                    row.createCell(1).setCellValue(s.getStartDate().format(formatter));
                }
                if (s.getEndDate() != null)
                {
                    row.createCell(2).setCellValue(s.getEndDate().format(formatter));
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=semesters.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e)
        {
            throw new RuntimeException("Semester export failed", e);
        }
    }

    private String getString(Row row, int index)
    {
        Cell cell = row.getCell(index);
        if (cell == null)
        {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC)
        {
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return cell.getStringCellValue().trim();
    }

    private LocalDate getLocalDate(Row row, int index)
    {
        Cell cell = row.getCell(index);
        if (cell == null || cell.getCellType() == CellType.BLANK)
        {
            return null;
        }

        try
        {
            if (DateUtil.isCellDateFormatted(cell))
            {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            }
            if (cell.getCellType() == CellType.STRING)
            {
                return LocalDate.parse(cell.getStringCellValue().trim());
            }
        } catch (Exception e)
        {
            throw new IllegalArgumentException("startDate/endDate|Invalid date format. Please use YYYY-MM-DD or Excel Date format");
        }

        throw new IllegalArgumentException("startDate/endDate|Invalid cell data type for date");
    }
}
