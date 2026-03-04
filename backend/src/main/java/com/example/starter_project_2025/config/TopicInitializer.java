package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class TopicInitializer
{

    private final TopicRepository topicRepository;
    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;

    public void init()
    {
        if (topicRepository.count() > 0)
        {
            return;
        }

        TrainingProgram tp1 = createProgram("Fullstack Java Web Development", "Chương trình đào tạo chuyên sâu Java");
        TrainingProgram tp2 = createProgram("Data Science & AI", "Khám phá thế giới dữ liệu và trí tuệ nhân tạo");
        trainingProgramRepository.saveAll(Arrays.asList(tp1, tp2));

        Topic t1 = createTopic("Spring Boot Basic", "TOPIC-001", TopicLevel.BEGINNER, "Hướng dẫn cơ bản về Spring Framework");
        Topic t2 = createTopic("ReactJS Advanced", "TOPIC-002", TopicLevel.ADVANCED, "Làm chủ Hook và State Management");
        Topic t3 = createTopic("Python for Data", "TOPIC-003", TopicLevel.INTERMEDIATE, "Sử dụng Pandas và Numpy");
        topicRepository.saveAll(Arrays.asList(t1, t2, t3));

        linkTopicToProgram(t1, tp1);
        linkTopicToProgram(t2, tp1);

        linkTopicToProgram(t3, tp2);

        System.out.println(">>> TopicInitializer: Đã khởi tạo dữ liệu mẫu thành công!");
    }

    private TrainingProgram createProgram(String name, String desc)
    {
        TrainingProgram tp = new TrainingProgram();
        tp.setName(name);
        tp.setDescription(desc);
        tp.setVersion("v1.0");
        return tp;
    }

    private Topic createTopic(String name, String code, TopicLevel level, String desc)
    {
        Topic topic = new Topic();
        topic.setTopicName(name);
        topic.setTopicCode(code);
        topic.setLevel(level);
        topic.setDescription(desc);
        topic.setStatus(TopicStatus.ACTIVE);
        topic.setVersion("v1.0");
        return topic;
    }

    private void linkTopicToProgram(Topic topic, TrainingProgram program)
    {
        TrainingProgramTopic link = new TrainingProgramTopic();
        link.setTopic(topic);
        link.setTrainingProgram(program);
        trainingProgramTopicRepository.save(link);
    }
}