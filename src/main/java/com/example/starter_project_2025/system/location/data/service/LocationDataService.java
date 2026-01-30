package com.example.starter_project_2025.system.location.data.service;

import com.example.starter_project_2025.system.location.data.dto.CommuneDTO;
import com.example.starter_project_2025.system.location.data.dto.ProvinceDTO;

import java.util.List;

public interface LocationDataService {
    List<ProvinceDTO> getAllProvinces();
    List<CommuneDTO> getCommunesByProvinceId(String provinceId);
//    List<CommuneDTO>  getAllCommunes();
}
