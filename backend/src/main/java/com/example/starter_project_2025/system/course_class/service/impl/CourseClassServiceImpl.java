package com.example.starter_project_2025.system.course_class.service.impl;

import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.course_class.service.CourseClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseClassServiceImpl implements CourseClassService {

    private final CourseClassRepository courseClassRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CourseClassResponse> getAll() {
        return courseClassRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CourseClassResponse toResponse(CourseClass cc) {
        CourseClassResponse.CourseInfo courseInfo = cc.getCourse() == null ? null :
                new CourseClassResponse.CourseInfo(
                        cc.getCourse().getId(),
                        cc.getCourse().getCourseName(),
                        cc.getCourse().getCourseCode()
                );

        CourseClassResponse.ClassInfo classInfo = cc.getClassInfo() == null ? null :
                new CourseClassResponse.ClassInfo(
                        cc.getClassInfo().getId(),
                        cc.getClassInfo().getClassName(),
                        cc.getClassInfo().getClassCode()
                );

        CourseClassResponse.TrainerInfo trainerInfo = cc.getTrainer() == null ? null :
                new CourseClassResponse.TrainerInfo(
                        cc.getTrainer().getId(),
                        cc.getTrainer().getFirstName(),
                        cc.getTrainer().getLastName(),
                        cc.getTrainer().getEmail()
                );

        return new CourseClassResponse(
                cc.getId(),
                courseInfo,
                classInfo,
                trainerInfo,
                cc.getCreatedDate(),
                cc.getUpdatedDate()
        );
    }
}
