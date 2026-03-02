package com.example.starter_project_2025.system.location.service.impl;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.location.dto.LocationImportResult;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.service.LocationImportExportService;
import com.example.starter_project_2025.system.location.util.CsvUtil;
import com.example.starter_project_2025.system.location.util.ExcelUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationImportExportServiceImpl implements LocationImportExportService {

    private final LocationRepository locationRepo;
    private final ProvinceRepository provinceRepo;
    private final CommuneRepository communeRepo;

    @Override
    public byte[] exportLocations(String format) {
        List<Location> locations = locationRepo.findAll();

        if ("csv".equalsIgnoreCase(format)) {
            return CsvUtil.exportLocations(locations, communeRepo);
        }
        return ExcelUtil.exportLocations(locations, communeRepo);
    }

    @Override
    public ImportResultResponse importLocations(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        if (file == null || file.isEmpty()) {
            result.addError(0, "file", "File is empty");
            result.buildMessage();
            return result;
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            result.addError(0, "file", "Invalid file");
            result.buildMessage();
            return result;
        }

        LocationImportResult fileResult;
        if (filename.endsWith(".csv")) {
            fileResult = CsvUtil.importLocations(file, locationRepo, provinceRepo, communeRepo);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            fileResult = ExcelUtil.importLocations(file, locationRepo, provinceRepo, communeRepo);
        } else {
            result.addError(0, "file", "Unsupported file format. Use .xlsx or .csv");
            result.buildMessage();
            return result;
        }

        result.setTotalRows(fileResult.getTotal());
        result.setSuccessCount(fileResult.getSuccess());
        for (String err : fileResult.getErrors()) {
            result.addError(0, "", err);
        }
        result.buildMessage();
        return result;
    }

    @Override
    public byte[] downloadImportTemplate() {
        return ExcelUtil.generateLocationImportTemplate();
    }

}
