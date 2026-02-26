package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClassService {

    TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email);

    Page<TrainingClassResponse> searchTrainingClasses(SearchClassRequest request);
}