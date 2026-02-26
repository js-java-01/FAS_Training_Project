package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ClassService {

    TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email);

    Page<TrainingClassResponse> searchTrainingClasses(SearchClassRequest request);

    TrainingClassResponse updateClass(
            UUID id,
            CreateTrainingClassRequest request,
            String email
    );

    TrainingClassResponse approveClass(UUID id, String approverEmail);
    TrainingClassResponse rejectClass(UUID id, String approverEmail);

}