package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.dto.ObjectiveUpdateRequest;
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

    public CourseObjectiveResponse updateObjective(
            UUID courseId,
            UUID objectiveId,
            ObjectiveUpdateRequest request
    ) {

        // Check course tồn tại
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Course not found"));

        //  Check objective tồn tại
        CourseObjective objective = repository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found"));

        //  Validate objective thuộc course
        if (!objective.getCourse().getId().equals(course.getId())) {
            throw new BadRequestException("Objective does not belong to this course");
        }

        // Validate unique name trong cùng course (nếu yêu cầu)
        boolean exists = repository
                .existsByCourseIdAndNameAndIdNot(
                        courseId,
                        request.getName(),
                        objectiveId
                );

        if (exists) {
            throw new BadRequestException("Objective name already exists in this course");
        }

        //  Update data
        objective.setName(request.getName());
        objective.setDescription(request.getDescription());

        repository.save(objective);

        return mapper.toResponse(objective);
    }

    @Override
    public void deleteObjective(UUID courseId, UUID objectiveId) {

        CourseObjective objective = repository
                .findById(objectiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Objective not found"));

        // Check objective thuộc course nào
        if (!objective.getCourse().getId().equals(courseId)) {
            throw new BadRequestException("Objective does not belong to this course");
        }

        repository.delete(objective);
    }
}
