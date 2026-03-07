package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course-online-feedbacks")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Course Online Feedback Management", description = "Hệ thống đánh giá sao khóa học trực tuyến")
public class CourseOnlineFeedbackController
        extends BaseCrudDataIoController<CourseOnlineFeedback, UUID, CourseOnlineFeedbackDTO, CourseOnlineFeedbackFilter> {

    CourseOnlineFeedbackService service;
    CourseOnlineFeedbackRepository repository;

    @Override
    protected CrudService<UUID, CourseOnlineFeedbackDTO, CourseOnlineFeedbackFilter> getService() { return service; }

    @Override
    protected BaseCrudRepository<CourseOnlineFeedback, UUID> getRepository() { return repository; }

    @Override
    protected Class<CourseOnlineFeedback> getEntityClass() { return CourseOnlineFeedback.class; }
}