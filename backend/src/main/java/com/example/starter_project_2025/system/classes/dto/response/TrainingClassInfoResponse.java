package com.example.starter_project_2025.system.classes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Response for GET /api/classes/{classId}/training-info
 * Returns class info + its training program + topics in that program.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingClassInfoResponse {

    private ClassInfo classInfo;
    private TrainingProgramInfo trainingProgram;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassInfo {
        private UUID id;
        private String className;
        private String classCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingProgramInfo {
        private UUID id;
        private String name;
        private List<TopicInfo> topics;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicInfo {
        private UUID id;
        private String topicName;
        private String topicCode;
    }
}
