package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TrainingProgramInitializer  {

    private final TrainingProgramRepository trainingProgramRepository;


    public void initializeTrainingProgram() {

        if (trainingProgramRepository.count() > 0) {
            log.info("Training programs already exist, skipping initialization");
            return;
        }

        List<TrainingProgram> programs = List.of(
                build("Java Backend Developer",
                        "Training program for backend development using Java and Spring Boot"),

                build("Fullstack Web Developer",
                        "Training program covering React frontend and Spring Boot backend"),

                build("Data Science Engineer",
                        "Training program for data analysis and machine learning using Python"),

                build("DevOps Engineer",
                        "Training program for CI/CD, Docker, Kubernetes and cloud deployment")
        );

        trainingProgramRepository.saveAll(programs);

        log.info("Initialized {} Training Programs", programs.size());
    }

    private TrainingProgram build(String name, String description) {
        TrainingProgram p = new TrainingProgram();
        p.setName(name);
        p.setDescription(description);
        p.setVersion("1.0");
        return p;
    }
}