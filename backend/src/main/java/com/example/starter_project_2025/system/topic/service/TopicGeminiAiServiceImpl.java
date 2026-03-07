package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewLessonResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
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
public class TopicGeminiAiServiceImpl implements TopicAiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final ObjectMapper objectMapper;

    @Override
    public List<TopicAiPreviewLessonResponse> generatePreview(Topic topic) {

        RestTemplate restTemplate = new RestTemplate();

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        String prompt = buildPrompt(topic);

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

    private String buildPrompt(Topic topic) {
        return """
                Generate a structured topic learning path.

                Topic name: %s
                Topic code: %s
                Description: %s

                REQUIREMENTS:
                - Create 3-5 lessons
                - Each lesson must have 2-4 sessions
                - Session deliveryType must be exactly one of: VIDEO_LECTURE, LIVE_SESSION, QUIZ, ASSIGNMENT, PROJECT
                - Each session must include a "duration" field in minutes (realistic time estimate, e.g. 30-120 minutes)
                - Each session should have a "content" field describing the session topic
                - Each session may have an optional "note" field for additional notes

                Return ONLY a valid JSON array, no markdown, no explanation:
                [
                  {
                    "name": "Lesson name",
                    "description": "Lesson description",
                    "sessions": [
                      {
                        "order": 1,
                        "deliveryType": "LECTURE",
                        "content": "Session content/topic",
                        "note": "Additional notes for students",
                        "duration": 60
                      }
                    ]
                  }
                ]
                """
                .formatted(
                        topic.getTopicName(),
                        topic.getTopicCode() != null ? topic.getTopicCode() : "N/A",
                        topic.getDescription() != null ? topic.getDescription() : "No description provided");
    }

    private List<TopicAiPreviewLessonResponse> mapToLessons(String response) {
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
                    new TypeReference<List<TopicAiPreviewLessonResponse>>() {
                    });

        } catch (Exception e) {
            log.error("Parse Gemini response error", e);
            throw new RuntimeException("Parse Gemini response error: " + e.getMessage(), e);
        }
    }
}
