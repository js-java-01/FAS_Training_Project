package com.example.starter_project_2025.system.location.util;

import com.example.starter_project_2025.system.location.dto.LocationImportResult;
import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.data.entity.Province;
import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.util.List;


public class CsvUtil {

    public static LocationImportResult importLocations(
            MultipartFile file,
            LocationRepository locationRepo,
            ProvinceRepository provinceRepo,
            CommuneRepository communeRepo
    ) {
        LocationImportResult result = new LocationImportResult();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                result.setTotal(result.getTotal() + 1);

                try {
                    String name = row.getCell(0).getStringCellValue().trim();
                    String address = row.getCell(1).getStringCellValue().trim();
                    String provinceName = row.getCell(2).getStringCellValue().trim();
                    String wardName = row.getCell(3).getStringCellValue().trim();

                    // ===== BASIC VALIDATION =====
                    if (name.isEmpty())
                        throw new RuntimeException("Name is required");

                    if (provinceName.isEmpty() || wardName.isEmpty())
                        throw new RuntimeException("Province and Ward are required");

                    if (locationRepo.existsByNameIgnoreCase(name))
                        throw new RuntimeException("Duplicate location name");

                    // ===== FIND PROVINCE BY NAME =====
                    Province province = provinceRepo
                            .findByNameIgnoreCase(provinceName)
                            .orElseThrow(() ->
                                    new RuntimeException("Province not found: " + provinceName));

                    // ===== FIND WARD UNDER PROVINCE =====
                    Commune commune = communeRepo
                            .findByNameIgnoreCaseAndProvince(wardName, province)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Ward '" + wardName + "' does not belong to province '" + provinceName + "'"
                                    ));

                    // ===== CREATE LOCATION =====
                    Location location = new Location();
                    location.setName(name);
                    location.setAddress(address);
                    location.setCommuneId(commune.getId());
                    location.setLocationStatus(LocationStatus.ACTIVE);

                    locationRepo.save(location);
                    result.addSuccess();

                } catch (Exception e) {
                    result.addError("Row " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to import Excel file", e);
        }

        return result;
    }


    public static byte[] exportLocations(
            List<Location> locations,
            CommuneRepository communeRepo
    ) {
        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Locations");

            // ===== HEADER =====
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Name");
            header.createCell(1).setCellValue("Address");
            header.createCell(2).setCellValue("Province");
            header.createCell(3).setCellValue("Ward");

            int rowIdx = 1;

            for (Location loc : locations) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(loc.getName());
                row.createCell(1).setCellValue(loc.getAddress());

                // ===== RESOLVE COMMUNE + PROVINCE =====
                Commune commune = communeRepo.findById(loc.getCommuneId()).orElse(null);

                if (commune != null) {
                    row.createCell(2).setCellValue(commune.getProvince().getName());
                    row.createCell(3).setCellValue(commune.getName());
                } else {
                    row.createCell(2).setCellValue("");
                    row.createCell(3).setCellValue("");
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }


}