package com.example.starter_project_2025.system.program_courses.service;

import com.example.starter_project_2025.system.program_courses.dto.request.CreateProgramCourseRequest;
import com.example.starter_project_2025.system.program_courses.dto.response.ProgramCourseResponse;
import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import com.example.starter_project_2025.system.program_courses.repository.ProgramCourseRepository;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProgramCourseServiceImpl implements ProgramCourseService {

    private final ProgramCourseRepository programCourseRepository;
    private final ProgrammingLanguageRepository programmingLanguageRepository;
    private final TrainingProgramRepository trainingProgramRepository;

    @Override
    @Transactional
    public ProgramCourseResponse create(CreateProgramCourseRequest request) {

        ProgrammingLanguage language = programmingLanguageRepository
                .findById(request.getProgrammingLanguageId())
                .orElseThrow(() -> new RuntimeException("Programming Language not found"));

        TrainingProgram program = trainingProgramRepository
                .findById(request.getTrainingProgramId())
                .orElseThrow(() -> new RuntimeException("Training Program not found"));

        ProgramCourse programCourse = new ProgramCourse();
        programCourse.setProgrammingLanguage(language);
        programCourse.setTrainingProgram(program);

        ProgramCourse saved = programCourseRepository.save(programCourse);

        return ProgramCourseResponse.builder()
                .id(saved.getId())
                .programmingLanguageId(language.getId())
                .trainingProgramId(program.getId())
                .build();
    }
}