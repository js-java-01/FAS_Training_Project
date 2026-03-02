package com.example.starter_project_2025.system.course_class.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_class.dto.CourseClassRequest;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.course_class.service.CourseClassService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseClassServiceImpl implements CourseClassService {

        private final CourseRepository courseRepository;
        private final TrainingClassRepository classRepository;
        private final UserRepository userRepository;

        private final CourseClassRepository courseClassRepository;

        @Override
        @Transactional
        public CourseClassResponse create(CourseClassRequest request) {
                if (courseClassRepository.existsByCourse_IdAndClassInfo_Id(request.courseId(), request.classId())) {
                        throw new BadRequestException("Course is already assigned to this class");
                }

                Course course = courseRepository.findById(request.courseId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Course not found: " + request.courseId()));

                TrainingClass trainingClass = classRepository.findById(request.classId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Training class not found: " + request.classId()));

                User trainer = null;
                if (request.trainerId() != null) {
                        trainer = userRepository.findById(request.trainerId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Trainer not found: " + request.trainerId()));
                }

                CourseClass courseClass = new CourseClass();
                courseClass.setCourse(course);
                courseClass.setClassInfo(trainingClass);
                courseClass.setTrainer(trainer);

                return toResponse(courseClassRepository.save(courseClass));
        }

        @Override
        @Transactional(readOnly = true)
        public List<CourseClassResponse> getByClassId(UUID classId) {
                return courseClassRepository.findByClassInfo_Id(classId)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<CourseClassResponse> getAll() {
                return courseClassRepository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        private CourseClassResponse toResponse(CourseClass cc) {
                CourseClassResponse.CourseInfo courseInfo = cc.getCourse() == null ? null
                                : new CourseClassResponse.CourseInfo(
                                                cc.getCourse().getId(),
                                                cc.getCourse().getCourseName(),
                                                cc.getCourse().getCourseCode());

                CourseClassResponse.ClassInfo classInfo = cc.getClassInfo() == null ? null
                                : new CourseClassResponse.ClassInfo(
                                                cc.getClassInfo().getId(),
                                                cc.getClassInfo().getClassName(),
                                                cc.getClassInfo().getClassCode());

                CourseClassResponse.TrainerInfo trainerInfo = cc.getTrainer() == null ? null
                                : new CourseClassResponse.TrainerInfo(
                                                cc.getTrainer().getId(),
                                                cc.getTrainer().getFirstName(),
                                                cc.getTrainer().getLastName(),
                                                cc.getTrainer().getEmail());

                return new CourseClassResponse(
                                cc.getId(),
                                courseInfo,
                                classInfo,
                                trainerInfo,
                                cc.getCreatedDate(),
                                cc.getUpdatedDate());
        }

        @Override
        public List<CourseClass> getByUser(User user) {
                return courseClassRepository.findByTrainer(user);
        }
}
