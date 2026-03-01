package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainerClassSemesterResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.UpdateClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchTrainerClassInSemesterRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.UUID;

import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;

import java.util.List;

public interface ClassService {

    ClassResponse getTrainingClassById(UUID id);

    ClassResponse openClassRequest(CreateClassRequest request, String email);

    ClassResponse updateClass(
            UUID id,
            UpdateClassRequest request,
            String email);

    ClassResponse approveClass(UUID id, String approverEmail, ReviewClassRequest request);

    ClassResponse rejectClass(UUID id, String approverEmail, ReviewClassRequest request);

    Page<ClassResponse> searchTrainingClasses(SearchClassRequest request, Pageable pageable);

    List<TrainingClassSemesterResponse> getMyClasses(UUID id);

    TrainerClassSemesterResponse getTrainerClasses(UUID trainerId, SearchTrainerClassInSemesterRequest request);
}