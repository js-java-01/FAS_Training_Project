package com.example.starter_project_2025.system.training_program.service;

import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.ImportTrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

public interface TrainingProgramService {

    Page<TrainingProgramResponse> searchTrainingPrograms(
            String keyword,
            Pageable pageable
    );
    TrainingProgramResponse create(CreateTrainingProgramRequest request);
    TrainingProgramResponse getById(UUID id);
    void delete(UUID id);

    TrainingProgramResponse update(UUID id, UpdateTrainingProgramRequest request);

    ByteArrayInputStream exportTrainingPrograms() throws IOException;

    ByteArrayInputStream downloadTemplate() throws IOException;

    ImportTrainingProgramResponse importTrainingPrograms(MultipartFile file) throws IOException;}