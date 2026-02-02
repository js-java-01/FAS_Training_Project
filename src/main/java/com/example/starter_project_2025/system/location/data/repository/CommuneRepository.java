package com.example.starter_project_2025.system.location.data.repository;

import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.data.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommuneRepository extends JpaRepository<Commune, String> {
    List<Commune> findByProvince_IdOrderByNameAsc(String provinceId);

    Optional<Commune> findByIdAndProvince(String id, Province province);

    Optional<Commune> findByNameIgnoreCaseAndProvince(String name, Province province);
}
