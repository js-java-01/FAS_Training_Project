package com.example.starter_project_2025.system.location.service.impl;

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
            return CsvUtil.exportLocations(locations,communeRepo);
        }
        return ExcelUtil.exportLocations(locations, communeRepo);
    }

    @Override
    public LocationImportResult importLocations(MultipartFile[] files) {
        LocationImportResult finalResult = new LocationImportResult();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            LocationImportResult fileResult;

            String filename = file.getOriginalFilename();
            if (filename == null) {
                finalResult.addError("Invalid file");
                continue;
            }

            if (filename.endsWith(".csv")) {
                fileResult = CsvUtil.importLocations(file, locationRepo, provinceRepo, communeRepo);
            } else if (filename.endsWith(".xlsx")) {
                fileResult = ExcelUtil.importLocations(file, locationRepo, provinceRepo, communeRepo);
            } else {
                finalResult.addError("Unsupported file: " + filename);
                continue;
            }

            // merge result
            finalResult.merge(fileResult,filename);
        }

        return finalResult;
    }


    @Override
    public byte[] downloadImportTemplate() {
        return ExcelUtil.generateLocationImportTemplate();
    }

}
