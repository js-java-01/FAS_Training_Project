package com.example.starter_project_2025.system.department.service;

import com.example.starter_project_2025.system.department.dto.CreateDepartmentRequest;
import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.repository.DepartmentRepository;
import com.example.starter_project_2025.system.department.service.DepartmentService;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
// import com.example.starter_project_2025.system.user.repository.UserRepository; // <--- Import nếu muốn check User

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    // private final UserRepository userRepository; // <--- Uncomment nếu muốn check User

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    @Override
    public Department createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Department Code already exists: " + request.getCode());
        }

        Location location = locationRepository.findById(UUID.fromString(String.valueOf(request.getLocationId())))
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID: " + request.getLocationId()));

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .location(location)
                .build();

        return departmentRepository.save(department);
    }

    @Override
    public void deleteDepartment(UUID id) {
        // 1. Kiểm tra tồn tại
        if (!departmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Department not found with ID: " + id);
        }

        // 2. Kiểm tra xem có User nào thuộc phòng ban này không?
        // Nếu có thì chặn không cho xóa (tránh lỗi Foreign Key)
        // if (userRepository.existsByDepartmentId(id)) {
        //     throw new IllegalStateException("Cannot delete department because it contains users.");
        // }

        // 3. Xóa
        departmentRepository.deleteById(id);
    }

    @Override
    public byte[] generateImportTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Departments");

            // Tạo Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Name", "Code", "Description", "Location Name (Exact Match)"};

            // Style cho Header in đậm
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            // Ghi ra byte array
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    @Transactional
    public void importDepartments(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Department> departmentsToSave = new ArrayList<>();
            DataFormatter dataFormatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // --- FIX: Tạo biến tạm finalRow để dùng trong Lambda ---
                int finalRow = i + 1;

                String name = dataFormatter.formatCellValue(row.getCell(0)).trim();
                String code = dataFormatter.formatCellValue(row.getCell(1)).trim();
                String description = dataFormatter.formatCellValue(row.getCell(2)).trim();
                String locationName = dataFormatter.formatCellValue(row.getCell(3)).trim();

                if (name.isEmpty() || code.isEmpty() || locationName.isEmpty()) continue;

                if (departmentRepository.existsByCode(code)) {
                    throw new IllegalArgumentException("Row " + finalRow + ": Code '" + code + "' existed.");
                }

                // Sửa: Dùng finalRow thay vì i
                Location location = locationRepository.findAll().stream()
                        .filter(l -> l.getName().equalsIgnoreCase(locationName))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Row " + finalRow + ": Location '" + locationName + "' not found."));

                departmentsToSave.add(Department.builder()
                        .name(name)
                        .code(code)
                        .description(description)
                        .location(location)
                        .build());
            }
            departmentRepository.saveAll(departmentsToSave);
        }
    }

    @Override
    @Transactional(readOnly = true) // <--- QUAN TRỌNG: Để giữ kết nối DB khi lấy Location
    public byte[] exportDepartments() throws IOException {
        List<Department> departments = departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Departments");

            // 1. Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Name", "Code", "Description", "Location Name"};

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // 2. Data
            int rowNum = 1;
            for (Department dept : departments) {
                Row row = sheet.createRow(rowNum++);

                // Check null an toàn cho từng trường
                row.createCell(0).setCellValue(dept.getId() != null ? dept.getId().toString() : "");
                row.createCell(1).setCellValue(dept.getName() != null ? dept.getName() : "");
                row.createCell(2).setCellValue(dept.getCode() != null ? dept.getCode() : "");
                row.createCell(3).setCellValue(dept.getDescription() != null ? dept.getDescription() : "");

                // Xử lý Location (tránh LazyInit Exception và NullPointer)
                String locationName = "N/A";
                if (dept.getLocation() != null) {
                    locationName = dept.getLocation().getName();
                }
                row.createCell(4).setCellValue(locationName);
            }

            // 3. Auto size
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

}