package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.request.UpdateClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;

import org.springframework.data.domain.Page;

import java.util.UUID;

import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;

public interface ClassService {

    ClassResponse getTrainingClassById(UUID id);

    ClassResponse openClassRequest(CreateClassRequest request, String email);

    Page<ClassResponse> searchTrainingClasses(SearchClassRequest request);

    ClassResponse updateClass(
            UUID id,
            UpdateClassRequest request,
            String email
    );

    ClassResponse approveClass(UUID id, String approverEmail, ReviewClassRequest request);
    ClassResponse rejectClass(UUID id, String approverEmail, ReviewClassRequest request);

}