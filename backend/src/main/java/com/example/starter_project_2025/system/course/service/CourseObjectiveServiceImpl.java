package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseObjective;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.mapper.CourseObjectiveMapper;
import com.example.starter_project_2025.system.course.repository.CourseObjectiveRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseObjectiveServiceImpl implements CourseObjectiveService{
    private final CourseRepository courseRepository;
    private final CourseObjectiveRepository repository;
    private final CourseObjectiveMapper mapper;
    private final UserService userService;

    @Override
    public CourseObjectiveResponse create(
            UUID courseId,
            CourseObjectiveCreateRequest req) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow();

        // BUSINESS RULE 1:
        // Chỉ cho thêm objective khi course ở DRAFT
        if (course.getStatus() != CourseStatus.DRAFT) {
            throw new RuntimeException(
                    "Cannot add objective when course is not in DRAFT status");
        }

        // BUSINESS RULE 2:
        // Unique name trong cùng course
        if (repository.existsByCourseIdAndName(courseId, req.getName())) {
            throw new RuntimeException(
                    "Objective name already exists in this course");
        }

        CourseObjective objective = mapper.toEntity(req);
        objective.setCourse(course);

        return mapper.toResponse(repository.save(objective));
    }

    @Override
    public List<CourseObjectiveResponse> getByCourse(UUID courseId) {

        return repository.findByCourseId(courseId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
