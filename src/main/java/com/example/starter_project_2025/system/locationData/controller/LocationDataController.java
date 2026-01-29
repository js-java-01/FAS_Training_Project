package com.example.starter_project_2025.system.locationData.controller;
import com.example.starter_project_2025.system.locationData.dto.*;
import com.example.starter_project_2025.system.locationData.service.LocationDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationDataController {

    private final LocationDataService locationDataService;

    @GetMapping("/provinces")
    public List<ProvinceDTO> provinces() {
        return locationDataService.getAllProvinces();
    }

    @GetMapping("/communes")
    public List<CommuneDTO> communes(@RequestParam String provinceId) {
        return locationDataService.getCommunesByProvinceId(provinceId);
    }
}
