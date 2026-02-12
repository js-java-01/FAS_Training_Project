package com.example.starter_project_2025.system.location.controller;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.location.dto.*;
import com.example.starter_project_2025.system.location.service.LocationService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public Page<LocationResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String communeId,
            @RequestParam(required = false) LocationStatus status,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return locationService.search(q, communeId, status, pageable);
    }

    @GetMapping("/{id}")
    public LocationResponse get(@PathVariable UUID id) {
        return locationService.getById(id);
    }

    @PostMapping
    public LocationResponse create(@RequestBody LocationRequest request) {
        return locationService.create(request);
    }

    @PutMapping("/{id}")
    public LocationResponse update(
            @PathVariable UUID id,
            @RequestBody LocationRequest request
    ) {
        return locationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable UUID id) {
        locationService.deactivate(id);
    }

    @DeleteMapping("/{id}/permanent")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLocationPermanently(@PathVariable UUID id) {
        locationService.deletePermanently(id);
    }

}
