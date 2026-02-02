package com.example.starter_project_2025.system.location.data.service.impl;

import com.example.starter_project_2025.system.location.data.dto.CommuneDTO;
import com.example.starter_project_2025.system.location.data.dto.ProvinceDTO;
import com.example.starter_project_2025.system.location.data.dto.*;
import com.example.starter_project_2025.system.location.data.entity.Province;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.example.starter_project_2025.system.location.data.service.LocationDataService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationDataServiceImpl implements LocationDataService {

    private final ProvinceRepository provinceRepo;
    private final CommuneRepository communeRepo;
    private final List<ProvinceDTO> provinces;

    @Override
    @Transactional(readOnly = true)
    public List<ProvinceDTO> getAllProvinces() {
        return provinceRepo.findAll().stream()
                .sorted(Comparator.comparing(Province::getName))
                .map(p -> new ProvinceDTO(p.getId(), p.getName()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommuneDTO> getCommunesByProvinceId(String provinceId) {
        return communeRepo.findByProvince_IdOrderByNameAsc(provinceId).stream()
                .map(c -> new CommuneDTO(c.getId(), c.getName(), c.getProvince().getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommuneDTO getCommuneById(String communeId) {
        return communeRepo.findById(communeId)
                .map(c -> new CommuneDTO(c.getId(), c.getName(), c.getProvince().getId()))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsCommuneId(String communeId) {
        if (communeId == null || communeId.isBlank()) return false;
        return communeRepo.existsById(communeId.trim());
    }

}
