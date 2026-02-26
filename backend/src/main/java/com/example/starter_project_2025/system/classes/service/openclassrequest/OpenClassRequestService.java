package com.example.starter_project_2025.system.classes.service.openclassrequest;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OpenClassRequestService {

    TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email);

    Page<TrainingClassResponse> searchTrainingClasses(String keyword, Boolean isActive, Pageable pageable);
}