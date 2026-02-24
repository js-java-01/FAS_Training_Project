package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CohortCreateRequest;
import com.example.starter_project_2025.system.course.dto.CohortResponse;
import com.example.starter_project_2025.system.course.dto.CohortUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseCohort;
import com.example.starter_project_2025.system.course.mapper.CohortMapper;
import com.example.starter_project_2025.system.course.repository.CourseCohortRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CohortServiceImpl implements CohortService {

    private final CourseCohortRepository cohortRepository;
    private final CourseRepository courseRepository;
    private final CohortMapper cohortMapper;

    @Override
    public CohortResponse create(CohortCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseCohort cohort = cohortMapper.toEntity(request);
        cohort.setCourse(course);

        return cohortMapper.toResponse(cohortRepository.save(cohort));
    }

    @Override
    public CohortResponse update(UUID id, CohortUpdateRequest request) {
        CourseCohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));

        if (request.getCode() != null)
            cohort.setCode(request.getCode());
        if (request.getStartDate() != null)
            cohort.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            cohort.setEndDate(request.getEndDate());
        if (request.getCapacity() != null)
            cohort.setCapacity(request.getCapacity());
        if (request.getStatus() != null)
            cohort.setStatus(request.getStatus());

        return cohortMapper.toResponse(cohortRepository.save(cohort));
    }

    @Override
    public void delete(UUID id) {
        cohortRepository.deleteById(id);
    }

    @Override
    public CohortResponse getById(UUID id) {
        return cohortRepository.findById(id)
                .map(cohortMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
    }

    @Override
    public List<CohortResponse> getByCourseId(UUID courseId) {
        return cohortRepository.findByCourseId(courseId)
                .stream()
                .map(cohortMapper::toResponse)
                .toList();
    }

    @Override
    public List<CohortResponse> getAll() {
        return cohortRepository.findAll()
                .stream()
                .map(cohortMapper::toResponse)
                .toList();
    }
}