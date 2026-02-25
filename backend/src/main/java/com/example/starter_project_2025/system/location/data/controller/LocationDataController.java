package com.example.starter_project_2025.system.location.data.controller;
import com.example.starter_project_2025.system.location.data.dto.CommuneDTO;
import com.example.starter_project_2025.system.location.data.dto.ProvinceDTO;
import com.example.starter_project_2025.system.location.data.dto.*;
import com.example.starter_project_2025.system.location.data.service.LocationDataService;
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
