package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.AiPreviewLessonResponse;
import com.example.starter_project_2025.system.course.entity.Course;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiServiceImpl implements AiService {

        @Value("${gemini.api-key}")
        private String apiKey;

        @Value("${gemini.model}")
        private String model;

        private final ObjectMapper objectMapper;

        @Override
        public List<AiPreviewLessonResponse> generatePreview(Course course) {

                RestTemplate restTemplate = new RestTemplate();

                String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                                + model + ":generateContent?key=" + apiKey;

                String prompt = buildPrompt(course);

                Map<String, Object> body = Map.of(
                                "contents", List.of(
                                                Map.of("parts", List.of(
                                                                Map.of("text", prompt)))));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                String response = restTemplate.postForObject(url, request, String.class);

                return mapToLessons(response);
        }

        private String buildPrompt(Course course) {
                return """
                                Generate a structured course learning path.

                                Course name: %s
                                Description: %s

                                REQUIREMENTS:
                                - Create 3-5 lessons
                                - Each lesson must have 2-4 sessions
                                - Session types must be exactly one of: VIDEO_LECTURE, LIVE_SESSION, QUIZ, ASSIGNMENT, PROJECT
                                - Each session must include a "duration" field in minutes (realistic time estimate, e.g. 30-120 minutes)

                                Return ONLY a valid JSON array, no markdown, no explanation:
                                [
                                  {
                                    "name": "Lesson name",
                                    "description": "Lesson description",
                                    "sessions": [
                                      {
                                        "order": 1,
                                        "type": "VIDEO_LECTURE",
                                        "topic": "Session topic",
                                        "studentTask": "What students should do",
                                        "duration": 45
                                      }
                                    ]
                                  }
                                ]
                                """
                                .formatted(
                                                course.getCourseName(),
                                                course.getDescription() != null ? course.getDescription()
                                                                : "No description provided");
        }

        private List<AiPreviewLessonResponse> mapToLessons(String response) {
                try {
                        JsonNode root = objectMapper.readTree(response);
                        String text = root
                                        .path("candidates")
                                        .get(0)
                                        .path("content")
                                        .path("parts")
                                        .get(0)
                                        .path("text")
                                        .asText();

                        log.debug("Gemini raw content: {}", text);

                        // Strip markdown code fences if present
                        String json = text.trim();
                        if (json.startsWith("```")) {
                                json = json.replaceAll("(?s)^```[a-zA-Z]*\\s*", "").replaceAll("```\\s*$", "").trim();
                        }

                        return objectMapper.readValue(
                                        json,
                                        new TypeReference<List<AiPreviewLessonResponse>>() {
                                        });

                } catch (Exception e) {
                        log.error("Parse Gemini response error", e);
                        throw new RuntimeException("Parse Gemini response error: " + e.getMessage(), e);
                }
        }
}