package com.example.starter_project_2025.system.classes.service.openclassrequest;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;

public interface OpenClassRequestService {

    TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email);
}