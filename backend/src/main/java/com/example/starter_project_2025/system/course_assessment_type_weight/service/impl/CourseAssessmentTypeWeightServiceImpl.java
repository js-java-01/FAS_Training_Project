package com.example.starter_project_2025.system.course_assessment_type_weight.service.impl;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightRequest;
import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightResponse;
import com.example.starter_project_2025.system.course_assessment_type_weight.service.CourseAssessmentTypeWeightService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseAssessmentTypeWeightServiceImpl implements CourseAssessmentTypeWeightService {

    private final CourseRepository courseRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseAssessmentTypeWeightRepository weightRepository;

    // ── Get all ──────────────────────────────────────────────────────────────

    @Override
    public List<CourseWeightResponse> getAllByCourse(UUID courseId) {
        loadCourse(courseId); // validate course exists
        return weightRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CourseWeightResponse create(UUID courseId, CourseWeightRequest request) {
        Course course = loadCourse(courseId);
        AssessmentType assessmentType = loadAssessmentType(request.getAssessmentTypeId());

        // Prevent duplicate: same assessmentType already configured for this course
        weightRepository.findByCourseIdAndAssessmentTypeId(courseId, request.getAssessmentTypeId())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "AssessmentType [" + assessmentType.getName() + "] is already configured for this course. " +
                            "Use PUT to update it instead.");
                });

        CourseAssessmentTypeWeight weight = CourseAssessmentTypeWeight.builder()
                .course(course)
                .assessmentType(assessmentType)
                .weight(request.getWeight())
                .gradingMethod(request.getGradingMethod())
                .build();

        return toResponse(weightRepository.save(weight));
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CourseWeightResponse update(UUID courseId, UUID weightId, CourseWeightRequest request) {
        loadCourse(courseId); // validate course exists
        CourseAssessmentTypeWeight weight = loadWeight(weightId, courseId);
        AssessmentType newType = loadAssessmentType(request.getAssessmentTypeId());

        // If assessmentTypeId changed, check the new one isn't already used by another record
        boolean typeChanged = !weight.getAssessmentType().getId().equals(request.getAssessmentTypeId());
        if (typeChanged) {
            weightRepository.findByCourseIdAndAssessmentTypeId(courseId, request.getAssessmentTypeId())
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException(
                                "AssessmentType [" + newType.getName() + "] is already configured for this course.");
                    });
            weight.setAssessmentType(newType);
        }

        weight.setWeight(request.getWeight());
        weight.setGradingMethod(request.getGradingMethod());

        return toResponse(weightRepository.save(weight));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void delete(UUID courseId, UUID weightId) {
        loadCourse(courseId); // validate course exists
        CourseAssessmentTypeWeight weight = loadWeight(weightId, courseId);
        weightRepository.delete(weight);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Course loadCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
    }

    private AssessmentType loadAssessmentType(String assessmentTypeId) {
        return assessmentTypeRepository.findById(assessmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("AssessmentType not found: " + assessmentTypeId));
    }

    private CourseAssessmentTypeWeight loadWeight(UUID weightId, UUID courseId) {
        CourseAssessmentTypeWeight weight = weightRepository.findById(weightId)
                .orElseThrow(() -> new ResourceNotFoundException("Weight config not found: " + weightId));
        if (!weight.getCourse().getId().equals(courseId)) {
            throw new ResourceNotFoundException("Weight config not found for this course: " + weightId);
        }
        return weight;
    }

    private CourseWeightResponse toResponse(CourseAssessmentTypeWeight w) {
        return CourseWeightResponse.builder()
                .id(w.getId())
                .courseId(w.getCourse().getId())
                .courseName(w.getCourse().getCourseName())
                .assessmentTypeId(w.getAssessmentType().getId())
                .assessmentTypeName(w.getAssessmentType().getName())
                .weight(w.getWeight())
                .gradingMethod(w.getGradingMethod() != null ? w.getGradingMethod().name() : null)
                .build();
    }
}
