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

    @Scheduled(cron = "*/15 * * * * ?")
    @Transactional
    public void updateClassStatus() {

        LocalDate today = LocalDate.now();

        List<TrainingClass> classesToActivate =
                classRepository.findByClassStatusAndStartDateLessThanEqual(
                        ClassStatus.APPROVED,
                        today
                );

        for (TrainingClass c : classesToActivate) {
            if (!Boolean.TRUE.equals(c.getIsActive())) {
                c.setIsActive(true);
            }
        }

        List<TrainingClass> classesToDeactivate =
                classRepository.findByEndDateLessThanAndIsActiveTrue(today);

        for (TrainingClass c : classesToDeactivate) {
            c.setIsActive(false);
        }
    }
}