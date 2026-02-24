package com.example.starter_project_2025.system.location.data.repository;

import com.example.starter_project_2025.system.location.data.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, String> {
    Optional<Province> findById(String id);

    Optional<Province> findByNameIgnoreCase(String name);

}
