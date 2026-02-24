package com.example.starter_project_2025.system.department.service.impl;

import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import com.example.starter_project_2025.system.department.repository.DepartmentRepository;
import com.example.starter_project_2025.system.department.service.DepartmentService;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional
    public Department create(DepartmentDTO dto) {
        Department dept = new Department();
        dept.setName(dto.getName());
        dept.setCode(dto.getCode());
        dept.setDescription(dto.getDescription());

        if (dto.getLocationId() != null && !dto.getLocationId().isEmpty()) {
            Location location = locationRepository.findById(UUID.fromString(dto.getLocationId()))
                    .orElseThrow(() -> new RuntimeException("Location does not exist!"));
            dept.setLocation(location);
        }

        return departmentRepository.save(dept);
    }

    @Override
    public List<DepartmentDTO> getAll() {
        return departmentRepository.findAll().stream().map(dept -> {
            DepartmentDTO dto = new DepartmentDTO();
            dto.setId(dept.getId());
            dto.setName(dept.getName());
            dto.setCode(dept.getCode());
            dto.setDescription(dept.getDescription());

            if (dept.getLocation() != null) {
                dto.setLocationId(dept.getLocation().getId().toString());
                dto.setLocationName(dept.getLocation().getName());
            }
            return dto;
        }).collect(Collectors.toList());
    }



    @Override
    public DepartmentDTO getById(UUID id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found with id: " + id));

        DepartmentDTO dto = new DepartmentDTO();

        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setCode(department.getCode());
        dto.setDescription(department.getDescription());

        if (department.getLocation() != null) {
            dto.setLocationId(department.getLocation().getId().toString());
            dto.setLocationName(department.getLocation().getName());
        }

        return dto;
    }



    @Override
    @Transactional
    public void delete(UUID id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Department update(UUID id, DepartmentDTO dto) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found with id: " + id));

        department.setName(dto.getName());
        department.setCode(dto.getCode());
        department.setDescription(dto.getDescription());

        if (dto.getLocationId() != null && !dto.getLocationId().isBlank()) {

            Location location = locationRepository.findById(
                            UUID.fromString(dto.getLocationId()))
                    .orElseThrow(() ->
                            new RuntimeException("Location does not exist!"));

            department.setLocation(location);
        } else {
            department.setLocation(null);
        }

        return departmentRepository.save(department);
    }


}
