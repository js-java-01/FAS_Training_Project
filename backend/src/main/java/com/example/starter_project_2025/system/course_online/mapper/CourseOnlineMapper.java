package com.example.starter_project_2025.system.course_online.mapper;

import com.example.starter_project_2025.system.course_online.dto.CourseCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseOnlineMapper {

        private final TopicRepository topicRepo;
        private final UserRepository userRepository;

        // CREATE → ENTITY
        public CourseOnline toEntity(CourseCreateOnlineRequest req) {
                return CourseOnline.builder()
                                .courseName(req.getCourseName())
                                .courseCode(req.getCourseCode())
                                .trainerId(req.getTrainerId())
                                .level(req.getLevel())
                                .estimatedTime(req.getEstimatedTime())
                                // .thumbnailUrl(req.getThumbnailUrl())
                                .note(req.getNote())
                                .description(req.getDescription())
                                .minGpaToPass(req.getMinGpaToPass())
                                .minAttendancePercent(req.getMinAttendancePercent())
                                .allowFinalRetake(req.getAllowFinalRetake())
                                .topicId(req.getTopicId())
                                .status(CourseStatusOnline.DRAFT) // default workflow
                                .build();
        }

        // ENTITY → RESPONSE
        public CourseOnlineResponse toResponse(CourseOnline c) {
                return CourseOnlineResponse.builder()
                                .id(c.getId())

                                // BASIC
                                .courseName(c.getCourseName())
                                .courseCode(c.getCourseCode())

                                // DETAILS
                                .level(c.getLevel())
                                .estimatedTime(c.getEstimatedTime())
                                .thumbnailUrl(c.getThumbnailUrl())

                                // WORKFLOW
                                .status(c.getStatus())

                                // ADDITIONAL
                                .note(c.getNote())
                                .description(c.getDescription())

                                // ASSESSMENT
                                .minGpaToPass(c.getMinGpaToPass())
                                .minAttendancePercent(c.getMinAttendancePercent())
                                .allowFinalRetake(c.getAllowFinalRetake())

                                // TRAINER
                                .trainerId(c.getTrainerId())
                                .trainerName(c.getTrainerId() != null
                                                ? userRepository.findById(c.getTrainerId())
                                                                .map(User::getEmail)
                                                                .orElse(null)
                                                : null)

                                // TOPIC
                                .topicId(c.getTopicId())
                                .topicName(c.getTopicId() != null
                                                ? topicRepo.findById(c.getTopicId())
                                                                .map(Topic::getTopicName)
                                                                .orElse(null)
                                                : null)

                                // CREATOR
                                .createdBy(
                                                c.getCreator() != null ? c.getCreator().getId() : null)
                                .createdByName(
                                                c.getCreator() != null ? c.getCreator().getEmail() : null)
                                .createdDate(c.getCreatedDate())

                                // UPDATER
                                .updatedBy(
                                                c.getUpdater() != null ? c.getUpdater().getId() : null)
                                .updatedByName(
                                                c.getUpdater() != null ? c.getUpdater().getEmail() : null)
                                .updatedDate(c.getUpdatedDate())

                                .build();
        }
}