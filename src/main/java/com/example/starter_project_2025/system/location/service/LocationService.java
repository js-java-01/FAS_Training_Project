package com.example.starter_project_2025.system.location.service;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.location.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface LocationService {

    Page<LocationResponse> search(
            String q,
            UUID communeId,
            LocationStatus locationStatus,
            Pageable pageable
    );

    LocationResponse getById(UUID id);

    LocationResponse create(LocationRequest request);

    LocationResponse update(UUID id, LocationRequest request);

    void deactivate(UUID id);
}
