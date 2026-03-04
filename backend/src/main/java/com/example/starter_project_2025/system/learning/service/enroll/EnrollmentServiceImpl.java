package com.example.starter_project_2025.system.learning.service.enroll;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.learning.dto.EnrollmentImportResult;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.ImportEnrollmentError;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.ImportEnrollmentErrorType;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user_role.entity.UserRole;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public String enroll(EnrollmentRequest request, UUID id) {
        var classes = trainingClassRepository.findById(request.getClassID())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        var user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        var existingEnrollment = enrollmentRepository.findByUserIdAndTrainingClassId(id, request.getClassID());

        if (existingEnrollment.isPresent()) {
            throw new RuntimeException("Already enrolled in this class");
        }

        var enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setTrainingClass(classes);
        enrollmentRepository.save(enrollment);
        return "Enrollment successful";
    }

    @Override
    public byte[] getExportTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Enrollment Template");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LAVENDER.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle noteAreaStyle = workbook.createCellStyle();
            noteAreaStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            noteAreaStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            noteAreaStyle.setVerticalAlignment(VerticalAlignment.TOP);
            noteAreaStyle.setWrapText(true);

            CellStyle noteHeaderStyle = workbook.createCellStyle();
            noteHeaderStyle.cloneStyleFrom(noteAreaStyle);
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            noteHeaderStyle.setFont(boldFont);

            Row row1 = sheet.createRow(0);

            Cell cellEmailHeader = row1.createCell(0);
            cellEmailHeader.setCellValue("Email");
            cellEmailHeader.setCellStyle(headerStyle);

            Cell cellNoteHeader = row1.createCell(3);
            cellNoteHeader.setCellValue("Note");
            cellNoteHeader.setCellStyle(noteHeaderStyle);

            Cell cellNoteBody = row1.createCell(4);
            String noteContent = "- Only include emails of users who are not yet enrolled in the class.\n" +
                    "- Ensure each email corresponds to an existing user in the system.";
            cellNoteBody.setCellValue(noteContent);
            cellNoteBody.setCellStyle(noteAreaStyle);

            sheet.addMergedRegion(new CellRangeAddress(0, 3, 4, 6));

            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(3, 10 * 256);
            sheet.setColumnWidth(4, 40 * 256);

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error creating Excel: " + e.getMessage());
        }
    }

    @Override
    public EnrollmentImportResult importStudents(MultipartFile file, String classCode) {
        var trainingClass = trainingClassRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        var result = new EnrollmentImportResult();

        List<ImportEnrollmentError> errorList = new ArrayList<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                Cell cell = row.getCell(0);
                if (cell == null || cell.getCellType() == CellType.BLANK)
                    continue;

                String email = cell.getStringCellValue().trim();

                if (!email.contains("@")) {
                    errorList.add(new ImportEnrollmentError(email, ImportEnrollmentErrorType.INVALID_EMAIL));
                    result.setFailedCount(result.getFailedCount() + 1);
                    continue;
                }

                try {
                    var user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("NOT_FOUND"));

                    boolean hasStudentRole = user.getUserRoles().stream()
                            .anyMatch(ur -> ur.getRole().getName().equalsIgnoreCase("STUDENT"));

                    if (!hasStudentRole) {
                        var studentRole = roleRepository.findByName("STUDENT")
                                .orElseThrow(() -> new RuntimeException("Role STUDENT missing in DB"));

                        UserRole newUserRole = new UserRole();
                        newUserRole.setUser(user);
                        newUserRole.setRole(studentRole);
                        userRoleRepository.save(newUserRole);
                    }

                    var existing = enrollmentRepository.findByUserIdAndTrainingClassId(user.getId(),
                            trainingClass.getId());
                    if (existing.isPresent()) {
                        throw new RuntimeException("ALREADY");
                    }

                    var enrollment = new Enrollment();
                    enrollment.setUser(user);
                    enrollment.setTrainingClass(trainingClass);
                    enrollmentRepository.save(enrollment);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (RuntimeException e) {
                    result.setFailedCount(result.getFailedCount() + 1);
                    if ("NOT_FOUND".equals(e.getMessage())) {
                        errorList.add(new ImportEnrollmentError(email, ImportEnrollmentErrorType.USER_NOT_FOUND));
                    } else if ("ALREADY".equals(e.getMessage())) {
                        errorList.add(new ImportEnrollmentError(email, ImportEnrollmentErrorType.ALREADY_ENROLLED));
                    } else {
                        errorList.add(new ImportEnrollmentError(email, ImportEnrollmentErrorType.USER_NOT_FOUND));
                    }
                }
            }

            if (!errorList.isEmpty()) {
                result.setErrorFile(createErrorExcelFile(errorList));
            }
            result.setTotalCount(result.getSuccessCount() + result.getFailedCount());
            return result;

        } catch (IOException e) {
            throw new RuntimeException("Error processing file: " + e.getMessage());
        }
    }

    @Override
    public byte[] createErrorExcelFile(List<ImportEnrollmentError> errors) {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Import Errors");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);

            CellStyle bodyStyle = workbook.createCellStyle();
            bodyStyle.setBorderBottom(BorderStyle.THIN);
            bodyStyle.setBorderLeft(BorderStyle.THIN);
            bodyStyle.setBorderRight(BorderStyle.THIN);
            bodyStyle.setBorderTop(BorderStyle.THIN);

            CellStyle errorStyle = workbook.createCellStyle();
            errorStyle.cloneStyleFrom(bodyStyle);
            Font redFont = workbook.createFont();
            redFont.setColor(IndexedColors.RED.getIndex());
            errorStyle.setFont(redFont);

            Row header = sheet.createRow(0);
            String[] titles = { "Email", "Error Type", "Detailed Description" };
            for (int i = 0; i < titles.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(titles[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (ImportEnrollmentError err : errors) {
                Row row = sheet.createRow(rowIdx++);

                Cell cellEmail = row.createCell(0);
                cellEmail.setCellValue(err.email);
                cellEmail.setCellStyle(bodyStyle);

                Cell cellType = row.createCell(1);
                cellType.setCellValue(err.type.name());
                cellType.setCellStyle(errorStyle);

                Cell cellDesc = row.createCell(2);
                String description = switch (err.type) {
                    case USER_NOT_FOUND -> "❌ User is not found in the system.";
                    case ALREADY_ENROLLED -> "⚠️ User has already enrolled in this training class.";
                    case INVALID_EMAIL -> "🚫 Invalid email format.";
                };
                cellDesc.setCellValue(description);
                cellDesc.setCellStyle(bodyStyle);
            }

            for (int i = 0; i < 3; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            return new byte[0];
        }
    }

    @Override
    public byte[] getExport(String classCode) {
        List<Enrollment> enrollments = enrollmentRepository.findAllByClassCodeWithUser(classCode);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Class Enrollment");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);

            CellStyle bodyStyle = workbook.createCellStyle();
            bodyStyle.setBorderBottom(BorderStyle.THIN);
            bodyStyle.setBorderLeft(BorderStyle.THIN);
            bodyStyle.setBorderRight(BorderStyle.THIN);
            bodyStyle.setBorderTop(BorderStyle.THIN);

            Row header = sheet.createRow(0);
            String[] titles = { "Full Name", "Email" };
            for (int i = 0; i < titles.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(titles[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Enrollment enrollment : enrollments) {
                User user = enrollment.getUser();
                Row row = sheet.createRow(rowIdx++);

                Cell cellName = row.createCell(0);
                cellName.setCellValue(user.getFullName());
                cellName.setCellStyle(bodyStyle);

                Cell cellEmail = row.createCell(1);
                cellEmail.setCellValue(user.getEmail());
                cellEmail.setCellStyle(bodyStyle);
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error exporting enrollment list: " + e.getMessage());
        }
    }

}