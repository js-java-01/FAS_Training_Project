package com.example.starter_project_2025.system.training_program.service;

import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import com.example.starter_project_2025.system.program_courses.repository.ProgramCourseRepository;
import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.mapper.TrainingProgramMapper;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingProgramServiceImpl implements TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final ProgramCourseRepository programCourseRepository;
    private final TrainingProgramMapper mapper;

    @Override
    public Page<TrainingProgramResponse> searchTrainingPrograms(
            String keyword,
            Pageable pageable
    ) {

        Specification<TrainingProgram> spec = (root, query, cb) -> {

            if (keyword != null && !keyword.isEmpty()) {
                return cb.like(
                        cb.lower(root.get("name")),
                        "%" + keyword.toLowerCase() + "%"
                );
            }

            return cb.conjunction();
        };

        return trainingProgramRepository.findAll(spec, pageable)
                .map(mapper::toResponse);
    }

    @Override
    @Transactional
    public TrainingProgramResponse create(CreateTrainingProgramRequest request) {

        if (trainingProgramRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Training Program name already exists");
        }

        TrainingProgram program = new TrainingProgram();
        program.setName(request.getName().trim());
        program.setVersion(request.getVersion().trim());
        program.setDescription(request.getDescription());

        TrainingProgram saved = trainingProgramRepository.saveAndFlush(program);
        Set<UUID> ids = Optional.ofNullable(request.getProgramCourseIds())
                .orElse(Collections.emptySet());

        if (!ids.isEmpty()) {

            Set<ProgramCourse> courses = programCourseRepository.findByIdIn(ids);

            if (courses.size() != ids.size()) {
                throw new RuntimeException("Some ProgramCourses not found");
            }

            for (ProgramCourse course : courses) {
                course.setTrainingProgram(saved);
            }

            saved.setProgramCourses(courses);
        }

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TrainingProgramResponse getById(UUID id) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training Program not found"));

        return mapper.toResponse(program);
    }
    @Override
    @Transactional
    public void delete(UUID id) {

        if (!trainingProgramRepository.existsById(id)) {
            throw new RuntimeException("Training Program not found");
        }

        if (programCourseRepository.existsByTrainingProgram_Id(id)) {
            throw new RuntimeException("Cannot delete program because it is being used");
        }

        trainingProgramRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TrainingProgramResponse update(UUID id, UpdateTrainingProgramRequest request) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training program not found"));

        // ===== UPDATE BASIC FIELDS =====
        if (request.getName() != null && !request.getName().isBlank()) {
            program.setName(request.getName());
        }

        if (request.getDescription() != null) {
            program.setDescription(request.getDescription());
        }

        if (request.getVersion() != null && !request.getVersion().isBlank()) {
            program.setVersion(request.getVersion());
        }

        // ===== UPDATE PROGRAM COURSES =====
        if (request.getProgramCourseIds() != null) {

            // Lấy danh sách course mới từ DB
            Set<ProgramCourse> newCourses = programCourseRepository
                    .findAllById(request.getProgramCourseIds())
                    .stream()
                    .collect(Collectors.toSet());

            // Set lại toàn bộ
            program.setProgramCourses(newCourses);

            // Cập nhật ngược chiều quan hệ
            newCourses.forEach(course -> course.setTrainingProgram(program));
        }

        return mapper.toResponse(program);
    }
}
