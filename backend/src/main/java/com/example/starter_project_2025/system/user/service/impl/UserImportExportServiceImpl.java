package com.example.starter_project_2025.system.user.service.impl;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserImportExportService;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserImportExportServiceImpl implements UserImportExportService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ================= IMPORT =================

    @Override
    @Transactional
    public ImportResultResponse importUsers(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Row 0 is the header — start from row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                try {
                    Row row = sheet.getRow(i);
                    if (row == null)
                        continue;

                    result.setTotalRows(result.getTotalRows() + 1);
                    int displayRow = i + 1;

                    String firstName = getCellValue(row.getCell(0));
                    String lastName = getCellValue(row.getCell(1));
                    String email = getCellValue(row.getCell(2));
                    String password = getCellValue(row.getCell(3));
                    String roleName = getCellValue(row.getCell(4));

                    // ===== VALIDATE =====
                    if (email == null || email.isBlank()) {
                        result.addError(displayRow, "email", "Email is required");
                        continue;
                    }
                    if (firstName == null || firstName.isBlank()) {
                        result.addError(displayRow, "firstName", "First name is required");
                        continue;
                    }
                    if (lastName == null || lastName.isBlank()) {
                        result.addError(displayRow, "lastName", "Last name is required");
                        continue;
                    }
                    if (password == null || password.isBlank()) {
                        result.addError(displayRow, "password", "Password is required");
                        continue;
                    }
                    if (roleName == null || roleName.isBlank()) {
                        result.addError(displayRow, "roleName", "Role name is required");
                        continue;
                    }

                    if (userRepository.existsByEmail(email.trim())) {
                        result.addError(displayRow, "email", "Email already exists: " + email.trim());
                        continue;
                    }

                    Role role = roleRepository.findByName(roleName.trim())
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName.trim()));

                    // ===== CREATE USER =====
                    User user = new User();
                    user.setFirstName(firstName.trim());
                    user.setLastName(lastName.trim());
                    user.setEmail(email.trim());
                    user.setPasswordHash(passwordEncoder.encode(password.trim()));
                    user.setIsActive(true);

                    // ===== ASSIGN ROLE =====
                    UserRole userRole = new UserRole();
                    userRole.setRole(role);
                    userRole.setUser(user);
                    userRole.setDefault(true);

                    Set<UserRole> roles = new HashSet<>();
                    roles.add(userRole);
                    user.setUserRoles(roles);

                    userRepository.save(user);
                    result.addSuccess();

                } catch (Exception e) {
                    result.addError(i + 1, "", e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "file", "File error: " + e.getMessage());
        }

        result.buildMessage();
        return result;
    }

    // ================= TEMPLATE =================

    @Override
    public byte[] downloadImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Users");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("firstName");
            header.createCell(1).setCellValue("lastName");
            header.createCell(2).setCellValue("email");
            header.createCell(3).setCellValue("password");
            header.createCell(4).setCellValue("roleName");

            // Example row
            Row example = sheet.createRow(1);
            example.createCell(0).setCellValue("John");
            example.createCell(1).setCellValue("Doe");
            example.createCell(2).setCellValue("john.doe@example.com");
            example.createCell(3).setCellValue("Password123");
            example.createCell(4).setCellValue("STUDENT");

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error creating template", e);
        }
    }

    // ================= HELPER =================

    private String getCellValue(Cell cell) {
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }
}
