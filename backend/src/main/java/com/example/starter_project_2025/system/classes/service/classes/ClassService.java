package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainerClassSemesterResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchTrainerClassInSemesterRequest;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

public interface ClassService {

    TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email);

    Page<TrainingClassResponse> searchTrainingClasses(SearchClassRequest request, Pageable pageable);

    List<TrainingClassSemesterResponse> getMyClasses(UUID id);

    TrainerClassSemesterResponse getTrainerClasses(UUID trainerId, SearchTrainerClassInSemesterRequest request);
}