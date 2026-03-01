package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleResponse;
import com.example.starter_project_2025.system.topic.entity.TopicDeliveryPrinciple;
import org.springframework.stereotype.Component;

@Component
public class TopicDeliveryPrincipleMapper {

    public TopicDeliveryPrincipleResponse toResponse(TopicDeliveryPrinciple entity) {
        TopicDeliveryPrincipleResponse res = new TopicDeliveryPrincipleResponse();

        res.setId(entity.getId());
        res.setMaxTraineesPerClass(entity.getMaxTraineesPerClass());
        res.setMinTrainerLevel(entity.getMinTrainerLevel());
        res.setMinMentorLevel(entity.getMinMentorLevel());
        res.setTrainingGuidelines(entity.getTrainingGuidelines());
        res.setMarkingPolicy(entity.getMarkingPolicy());
        res.setWaiverNotes(entity.getWaiverNotes());
        res.setOtherNotes(entity.getOtherNotes());

        return res;
    }

    public void updateEntity(TopicDeliveryPrinciple entity,
                             TopicDeliveryPrincipleRequest req) {

        entity.setMaxTraineesPerClass(req.getMaxTraineesPerClass());
        entity.setMinTrainerLevel(req.getMinTrainerLevel());
        entity.setMinMentorLevel(req.getMinMentorLevel());
        entity.setTrainingGuidelines(req.getTrainingGuidelines());
        entity.setMarkingPolicy(req.getMarkingPolicy());
        entity.setWaiverNotes(req.getWaiverNotes());
        entity.setOtherNotes(req.getOtherNotes());
    }
}
