package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentRequest;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentResponse;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseAssessmentComponent;
import com.example.starter_project_2025.system.course.entity.CourseAssessmentScheme;
import com.example.starter_project_2025.system.course.enums.AssessmentType;
import com.example.starter_project_2025.system.course.mapper.CourseAssessmentComponentMapper;
import com.example.starter_project_2025.system.course.repository.CourseAssessmentComponentRepository;
import com.example.starter_project_2025.system.course.repository.CourseAssessmentSchemeRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseAssessmentSchemeServiceImpl
                implements CourseAssessmentSchemeService {

        private final CourseAssessmentSchemeRepository schemeRepo;
        private final CourseAssessmentComponentRepository componentRepo;
        private final CourseAssessmentComponentMapper mapper;
        private final CourseRepository courseRepo;
        private final TopicAssessmentSchemeRepository topicSchemeRepo;
        private final TopicAssessmentComponentRepository topicComponentRepo;

        @Override
        public CourseAssessmentSchemeConfigDTO getSchemeConfig(UUID courseId) {

                CourseAssessmentScheme scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        Course course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("Course not found"));
                                        CourseAssessmentScheme newScheme = CourseAssessmentScheme.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build();
                                        return schemeRepo.save(newScheme);
                                });

                CourseAssessmentSchemeConfigDTO dto = new CourseAssessmentSchemeConfigDTO();
                dto.setMinGpaToPass(scheme.getMinGpaToPass());
                dto.setMinAttendance(scheme.getMinAttendance());
                dto.setAllowFinalRetake(scheme.getAllowFinalRetake());

                return dto;
        }

        @Override
        public void updateSchemeConfig(UUID courseId,
                        CourseAssessmentSchemeConfigDTO dto) {

                CourseAssessmentScheme scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        Course course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("Course not found"));
                                        return schemeRepo.save(CourseAssessmentScheme.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build());
                                });

                scheme.setMinGpaToPass(dto.getMinGpaToPass());
                scheme.setMinAttendance(dto.getMinAttendance());
                scheme.setAllowFinalRetake(dto.getAllowFinalRetake());
        }

        @Override
        public List<CourseAssessmentComponentResponse> getComponents(UUID courseId) {

                return componentRepo
                                .findByScheme_CourseIdOrderByDisplayOrder(courseId)
                                .stream()
                                .map(mapper::toResponse)
                                .toList();
        }

        @Override
        public void updateComponents(UUID courseId,
                        List<CourseAssessmentComponentRequest> request) {

                CourseAssessmentScheme scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        Course course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("Course not found"));
                                        return schemeRepo.save(CourseAssessmentScheme.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build());
                                });

                scheme.getComponents().clear();

                for (CourseAssessmentComponentRequest r : request) {

                        CourseAssessmentComponent component = CourseAssessmentComponent.builder()
                                        .scheme(scheme)
                                        .type(r.getType())
                                        .name(r.getName())
                                        .itemCount(r.getCount())
                                        .weight(r.getWeight())
                                        .duration(r.getDuration())
                                        .displayOrder(r.getDisplayOrder())
                                        .graded(r.getGraded())
                                        .build();

                        scheme.getComponents().add(component);
                }
        }

        @Override
        public void deleteComponent(UUID courseId, UUID componentId) {

                CourseAssessmentComponent component = componentRepo.findById(componentId)
                                .orElseThrow(() -> new RuntimeException("Not found"));

                if (!component.getScheme().getCourse().getId().equals(courseId)) {
                        throw new RuntimeException("Invalid course");
                }

                componentRepo.delete(component);
        }

        @Override
        public void cloneFromTopic(UUID topicId, UUID courseId) {

                // get course
                Course course = courseRepo.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                // get topic scheme
                TopicAssessmentScheme topicScheme = topicSchemeRepo.findByTopicId(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic scheme not found"));

                // delete existing scheme if any
                schemeRepo.findByCourseId(courseId).ifPresent(schemeRepo::delete);
                schemeRepo.flush();

                // create course scheme
                CourseAssessmentScheme courseScheme = CourseAssessmentScheme.builder()
                                .course(course)
                                .minGpaToPass(topicScheme.getMinGpaToPass())
                                .minAttendance(topicScheme.getMinAttendance() != null
                                                ? topicScheme.getMinAttendance().doubleValue()
                                                : 80.0)
                                .allowFinalRetake(topicScheme.getAllowFinalRetake())
                                .build();

                schemeRepo.save(courseScheme);

                // get topic components
                List<TopicAssessmentComponent> topicComponents = topicComponentRepo
                                .findByScheme_TopicIdOrderByDisplayOrder(topicId);

                // clone components
                List<CourseAssessmentComponent> courseComponents = topicComponents.stream()
                                .map(tc -> CourseAssessmentComponent.builder()
                                                .scheme(courseScheme)
                                                .type(AssessmentType.valueOf(tc.getType().name()))
                                                .name(tc.getName())
                                                .itemCount(tc.getCount())
                                                .weight(tc.getWeight())
                                                .duration(tc.getDuration())
                                                .displayOrder(tc.getDisplayOrder())
                                                .graded(tc.getIsGraded())
                                                .build())
                                .toList();

                componentRepo.saveAll(courseComponents);
        }
}
