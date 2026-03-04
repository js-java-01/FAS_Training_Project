package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class TopicInitializer {

    private final TopicRepository topicRepository;

    public void initializeTopics() {

        if (topicRepository.count() > 0) {
            log.info("Topics already exist, skipping initialization");
            return;
        }

        List<Topic> topics = List.of(
                build("Java Core", "JAVA_CORE", TopicLevel.BEGINNER,
                        "Basic Java programming including OOP, collections and exceptions"),

                build("Spring Boot Backend", "SPRING_BOOT", TopicLevel.INTERMEDIATE,
                        "Building RESTful APIs using Spring Boot and Spring Data JPA"),

                build("React Frontend", "REACT_FE", TopicLevel.INTERMEDIATE,
                        "Frontend development using React, Hooks and modern JS"),

                build("DevOps Fundamentals", "DEVOPS", TopicLevel.ADVANCED,
                        "CI/CD, Docker, Kubernetes and cloud deployment concepts"),

                build("Data Science Basics", "DATA_SCIENCE", TopicLevel.INTERMEDIATE,
                        "Data analysis, machine learning basics with Python")
        );

        topicRepository.saveAll(topics);

        log.info("Initialized {} Topics", topics.size());
    }

    private Topic build(String name, String code, TopicLevel level, String description) {

        Topic topic = new Topic();
        topic.setTopicName(name);
        topic.setTopicCode(code);
        topic.setLevel(level);
        topic.setDescription(description);
        topic.setStatus(TopicStatus.ACTIVE);
        topic.setVersion("v1.0");

        return topic;
    }
}