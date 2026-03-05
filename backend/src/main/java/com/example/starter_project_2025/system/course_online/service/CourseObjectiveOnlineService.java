package com.example.starter_project_2025.system.course_online.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.ObjectiveUpdateOnlineRequest;

import java.util.List;
import java.util.UUID;

public interface CourseObjectiveOnlineService {
        CourseObjectiveOnlineResponse create(
                        UUID courseId,
                        CourseObjectiveCreateOnlineRequest request);

        List<CourseObjectiveOnlineResponse> getByCourse(UUID courseId);

        CourseObjectiveOnlineResponse updateObjective(
                        UUID courseId,
                        UUID objectiveId,
                        ObjectiveUpdateOnlineRequest request);

        void deleteObjective(UUID courseId, UUID objectiveId);

        ResponseEntity<byte[]> exportObjectives(UUID courseId);

        ResponseEntity<byte[]> downloadTemplate();

        void importObjectives(UUID courseId, MultipartFile file);

        void cloneFromTopic(UUID courseId, UUID topicId);
}
