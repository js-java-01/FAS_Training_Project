package com.example.starter_project_2025.system.classes.scheduler;

import com.example.starter_project_2025.system.classes.entity.ClassStatus;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ClassActivationScheduler {

    private final TrainingClassRepository classRepository;

    @Scheduled(cron = "0 0 0 * * ?") // chạy mỗi ngày 00:00
    @Transactional
    public void activateClasses() {

        LocalDate today = LocalDate.now();

        List<TrainingClass> classes = classRepository.findByClassStatusAndStartDateLessThanEqual(
                ClassStatus.APPROVED,
                today);

        for (TrainingClass c : classes) {
            if (!Boolean.TRUE.equals(c.getIsActive())) {
                c.setIsActive(true);
            }
        }
    }
}