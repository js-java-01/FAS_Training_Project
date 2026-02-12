package com.example.starter_project_2025.system.location.service.impl;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.location.data.service.LocationDataService;
import com.example.starter_project_2025.system.location.dto.*;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import com.example.starter_project_2025.system.location.service.LocationService;
import com.example.starter_project_2025.system.location.spec.LocationSpecifications;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    //  Replace đúng commune service trong project bạn:
    private final LocationDataService locationDataService;

    @Override
    @Transactional(readOnly = true)
    public Page<LocationResponse> search(String q, String communeId, LocationStatus status, Pageable pageable) {

        Specification<Location> spec = Specification
                .where(LocationSpecifications.nameLike(q))
                .and(LocationSpecifications.byCommune(communeId))
                .and(LocationSpecifications.byLocationStatus(status));

        return locationRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    @Override
    public LocationResponse getById(UUID id) {
        return locationRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() ->
                        new IllegalArgumentException("Location not found: " + id)
                );
    }

    @Override
    public LocationResponse create(LocationRequest request) {

        if (!locationDataService.existsCommuneId(String.valueOf(request.getCommuneId()))) {
            throw new IllegalArgumentException("Commune not found: " + request.getCommuneId());
        }

        if (locationRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Location name already exists");
        }

        Location location = Location.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .communeId(request.getCommuneId())
                .locationStatus(request.getStatus())
                .build();

        return toResponse(locationRepository.save(location));
    }

    @Override
    public LocationResponse update(UUID id, LocationRequest request) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Location not found: " + id)
                );

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();

            if (locationRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
                throw new IllegalArgumentException("Location name already exists");
            }

            location.setName(newName);
        }

        if (request.getAddress() != null) {
            location.setAddress(request.getAddress().trim());
        }

        if (request.getCommuneId() != null) {
            if (!locationDataService.existsCommuneId(String.valueOf(request.getCommuneId()))) {
                throw new IllegalArgumentException("Commune not found: " + request.getCommuneId());
            }
            location.setCommuneId(request.getCommuneId());
        }

        if (request.getStatus() != null) {
            location.setLocationStatus(request.getStatus());
        }

        return toResponse(locationRepository.save(location));
    }

    @Override
    public void deactivate(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Location not found: " + id)
                );

        location.setLocationStatus(LocationStatus.INACTIVE);
        locationRepository.save(location);
    }

    private LocationResponse toResponse(Location location) {
        var commune = locationDataService.getCommuneById(location.getCommuneId());
        
        String communeName = "";
        String provinceName = "";
        
        if (commune != null) {
            communeName = commune.name();
            // Get province name from province ID
            var provinces = locationDataService.getAllProvinces();
            provinceName = provinces.stream()
                .filter(p -> p.id().equals(commune.provinceId()))
                .findFirst()
                .map(p -> p.name())
                .orElse("");
        }
        
        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .communeId(location.getCommuneId())
                .communeName(communeName)
                .provinceName(provinceName)
                .status(location.getLocationStatus())
                .createdAt(location.getCreatedAt())
                .build();
    }

    @Override
    public void deletePermanently(UUID id) {
        // 1️ Check exist
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        // 2️ Dependency check
        boolean hasDependency = checkLocationDependency(location);

        if (hasDependency) {
            throw new IllegalStateException(
                    "Cannot delete location because it is currently in use"
            );
        }

        // 3 delete permanently
        locationRepository.delete(location);
    }

    private boolean checkLocationDependency(Location location) {
        //implement when training/user modules are available
        return false;
    }
}
