package com.example.starter_project_2025.system.location.data.repository;

import com.example.starter_project_2025.system.location.data.entity.Commune;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommuneRepository extends JpaRepository<Commune, String> {
    List<Commune> findByProvince_IdOrderByNameAsc(String provinceId);
}
