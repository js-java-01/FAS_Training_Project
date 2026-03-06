package com.example.starter_project_2025.system.course_class.services;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.course_class.dto.CourseClassRequest;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse.CourseInfo;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseClassServiceImpl implements CourseClassService {

        private final CourseOnlineRepository courseOnlineRepository;
        private final TrainingClassRepository classRepository;
        private final UserRepository userRepository;
        private final CourseClassRepository courseClassRepository;
        private final TopicRepository topicRepository;

        @Override
        @Transactional
        public CourseClassResponse create(CourseClassRequest request) {
                if (courseClassRepository.existsByCourse_IdAndClassInfo_Id(request.courseId(), request.classId())) {
                        throw new BadRequestException("Course is already assigned to this class");
                }

                CourseOnline course = courseOnlineRepository.findById(request.courseId())
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
                CourseInfo courseInfo = null;
                if (cc.getCourse() != null) {
                        var c = cc.getCourse();
                        String topicName = null;
                        String topicCode = null;
                        if (c.getTopicId() != null) {
                                Topic topic = topicRepository.findById(c.getTopicId()).orElse(null);
                                if (topic != null) {
                                        topicName = topic.getTopicName();
                                        topicCode = topic.getTopicCode();
                                }
                        }
                        courseInfo = new CourseInfo(
                                        c.getId(),
                                        c.getCourseName(),
                                        c.getCourseCode(),
                                        c.getTopicId(),
                                        topicName,
                                        topicCode);
                }
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
                throw new UnsupportedOperationException("Unimplemented method 'getByUser'");
        }

        @Override
        public CourseClassResponse getById(UUID id) {
                throw new UnsupportedOperationException("Unimplemented method 'getById'");
        }
}