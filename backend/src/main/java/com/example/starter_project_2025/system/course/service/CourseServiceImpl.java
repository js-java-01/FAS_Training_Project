package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.mapper.CourseMapper;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMapper mapper;
    private final UserService userService;

    @Override
    public CourseResponse create(CourseCreateRequest req) {

        Course course = mapper.toEntity(req);

        if (req.getTrainerId() != null) {
            course.setTrainer(
                    userRepository.findById(req.getTrainerId()).orElseThrow());
        }

        course.setCreator(userService.getCurrentUser());

        return mapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse update(UUID id, CourseUpdateRequest req) {

        Course course = courseRepository.findById(id).orElseThrow();

        if (req.getCourseName() != null)
            course.setCourseName(req.getCourseName());
        if (req.getPrice() != null)
            course.setPrice(req.getPrice());
        if (req.getDiscount() != null)
            course.setDiscount(req.getDiscount());
        if (req.getLevel() != null)
            course.setLevel(req.getLevel());
        if (req.getEstimatedTime() != null)
            course.setEstimatedTime(req.getEstimatedTime());
        if (req.getNote() != null)
            course.setNote(req.getNote());
        if (req.getDescription() != null)
            course.setDescription(req.getDescription());

        if (req.getTrainerId() != null) {
            course.setTrainer(
                    userRepository.findById(req.getTrainerId()).orElseThrow());
        }

        course.setUpdater(userService.getCurrentUser());

        return mapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse getById(UUID id) {
        return mapper.toResponse(courseRepository.findById(id).orElseThrow());
    }

    @Override
    public Page<CourseResponse> getAll(Pageable pageable) {
        return courseRepository.findAll(pageable)
                .map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id) {
        courseRepository.deleteById(id);
    }
}
