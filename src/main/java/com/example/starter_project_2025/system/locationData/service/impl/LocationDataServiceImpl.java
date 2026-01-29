package com.example.starter_project_2025.system.locationData.service.impl;

import com.example.starter_project_2025.system.locationData.dto.*;
import com.example.starter_project_2025.system.locationData.entity.Province;
import com.example.starter_project_2025.system.locationData.repository.CommuneRepository;
import com.example.starter_project_2025.system.locationData.repository.ProvinceRepository;
import com.example.starter_project_2025.system.locationData.service.LocationDataService;
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
}
