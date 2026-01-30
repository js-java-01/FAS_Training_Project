package com.example.starter_project_2025.system.location.repository;

import com.example.starter_project_2025.system.location.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface LocationRepository
        extends JpaRepository<Location, UUID>,
        JpaSpecificationExecutor<Location> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
