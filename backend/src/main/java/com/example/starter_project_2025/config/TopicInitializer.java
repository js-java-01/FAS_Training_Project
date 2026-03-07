package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
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
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;

    public void init()
    {
        if (topicRepository.count() > 0)
        {
            return;
        }

        TrainingProgram tp1 = trainingProgramRepository.findByName("Java Backend Developer")
                .orElseGet(() -> trainingProgramRepository.save(createProgram("Java Backend Developer", "Chương trình đào tạo Java")));
        TrainingProgram tp2 = trainingProgramRepository.findByName("Data Science Engineer")
                .orElseGet(() -> trainingProgramRepository.save(createProgram("Data Science Engineer", "Khám phá thế giới dữ liệu")));

        Topic t1 = createTopic("Spring Boot Basic", "TOPIC-001",  "Hướng dẫn cơ bản về Spring Framework");
        Topic t2 = createTopic("ReactJS Advanced", "TOPIC-002", "Làm chủ Hook và State Management");
        Topic t3 = createTopic("Python for Data", "TOPIC-003", "Sử dụng Pandas và Numpy");
        topicRepository.saveAll(Arrays.asList(t1, t2, t3));

        // Seed assessment type weights for each topic
        String[] weightTypes  = {"Entrance Quiz", "Midterm Test", "Final Exam"};
        double[] weightValues = {20.0,             30.0,           50.0};
        for (Topic t : Arrays.asList(t1, t2, t3)) {
            for (int i = 0; i < weightTypes.length; i++) {
                final int idx = i;
                assessmentTypeRepository.findByName(weightTypes[idx]).ifPresent(at ->
                        topicAssessmentTypeWeightRepository.save(
                                TopicAssessmentTypeWeight.builder()
                                        .topic(t)
                                        .assessmentType(at)
                                        .weight(weightValues[idx])
                                        .build()));
            }
        }

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

    private Topic createTopic(String name, String code,  String desc)
    {
        Topic topic = new Topic();
        topic.setTopicName(name);
        topic.setTopicCode(code);
        topic.setDescription(desc);
        topic.setStatus(TopicStatus.ACTIVE);
        topic.setVersion("v1.0");
        topic.setMinGpaToPass(5.0);
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
