package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
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
import java.util.Iterator;

@Service
@RequiredArgsConstructor
public class TopicImportExportServiceImpl implements TopicImportExportService
{

    private static final String[] TEMPLATE_HEADERS = {
            "topicName",
            "topicCode",
            "level",
            "status",
            "version",
            "description"
    };

    private final TopicRepository topicRepository;

    @Override
    public ResponseEntity<byte[]> downloadTemplate()
    {
        try (Workbook workbook = new XSSFWorkbook())
        {
            Sheet sheet = workbook.createSheet("Topics");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++)
            {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("Lập trình Java");
            exampleRow.createCell(1).setCellValue("JAVA01");
            exampleRow.createCell(2).setCellValue("BEGINNER");
            exampleRow.createCell(3).setCellValue("ACTIVE");
            exampleRow.createCell(4).setCellValue("v1.0");
            exampleRow.createCell(5).setCellValue("Mô tả khóa học...");

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topic-import-template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e)
        {
            throw new RuntimeException("Failed to generate topic template", e);
        }
    }

    @Override
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

            rows.next();
            int rowIndex = 1;

            while (rows.hasNext())
            {
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);
                rowIndex++;

                try
                {
                    String name = getString(row, 0);
                    String code = getString(row, 1);
                    String levelStr = getString(row, 2);
                    String statusStr = getString(row, 3);
                    String version = getString(row, 4);
                    String description = getString(row, 5);

                    if (name == null || name.isBlank())
                    {
                        throw new IllegalArgumentException("topicName|Topic name is required");
                    }
                    if (code == null || code.isBlank())
                    {
                        throw new IllegalArgumentException("topicCode|Topic code is required");
                    }
                    if (topicRepository.existsByTopicCode(code.trim()))
                    {
                        throw new IllegalArgumentException("topicCode|Topic code already exists: " + code);
                    }

                    TopicLevel level = parseEnum(TopicLevel.class, "level", levelStr);
                    TopicStatus status = parseEnum(TopicStatus.class, "status", statusStr);

                    Topic topic = new Topic();
                    topic.setTopicName(name.trim());
                    topic.setTopicCode(code.trim());
                    topic.setLevel(level);
                    topic.setStatus(status != null ? status : TopicStatus.DRAFT);
                    topic.setVersion(version != null ? version.trim() : "v1.0");
                    topic.setDescription(description);

                    topicRepository.save(topic);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex)
                {
                    result.setFailedCount(result.getFailedCount() + 1);
                    String msg = ex.getMessage() == null ? "Unknown error" : ex.getMessage();
                    String[] err = msg.split("\\|");
                    result.getErrors().add(new ImportErrorDetail(
                            rowIndex,
                            err[0],
                            err.length > 1 ? err[1] : msg
                    ));
                }
            }
        } catch (Exception e)
        {
            throw new RuntimeException("Import topics failed: " + e.getMessage());
        }
        return result;
    }

    @Override
    public ResponseEntity<byte[]> exportExcel()
    {
        try (Workbook workbook = new XSSFWorkbook())
        {
            Sheet sheet = workbook.createSheet("Topics");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++)
            {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            int rowIdx = 1;
            for (Topic t : topicRepository.findAll())
            {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(t.getTopicName());
                row.createCell(1).setCellValue(t.getTopicCode());
                row.createCell(2).setCellValue(t.getLevel() != null ? t.getLevel().name() : "");
                row.createCell(3).setCellValue(t.getStatus() != null ? t.getStatus().name() : "");
                row.createCell(4).setCellValue(t.getVersion());
                row.createCell(5).setCellValue(t.getDescription());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topics.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e)
        {
            throw new RuntimeException("Topic export failed", e);
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String fieldName, String value)
    {
        if (value == null || value.isBlank())
        {
            throw new IllegalArgumentException(fieldName + "|" + fieldName + " is required");
        }
        try
        {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (IllegalArgumentException e)
        {
            throw new IllegalArgumentException(fieldName + "|Invalid value for " + fieldName);
        }
    }

    private String getString(Row row, int index)
    {
        Cell cell = row.getCell(index);
        if (cell == null || cell.getCellType() == CellType.BLANK)
        {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC)
        {
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return cell.getStringCellValue().trim();
    }
}