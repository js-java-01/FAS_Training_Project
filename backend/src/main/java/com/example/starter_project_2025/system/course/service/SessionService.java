package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course.dto.SessionRequest;
import com.example.starter_project_2025.system.course.dto.SessionResponse;
import com.example.starter_project_2025.system.course.entity.Lesson;
import com.example.starter_project_2025.system.course.entity.Session;
import com.example.starter_project_2025.system.course.repository.LessonRepository;
import com.example.starter_project_2025.system.course.repository.SessionRepository;
import com.example.starter_project_2025.system.course.enums.SessionType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final LessonRepository lessonRepository;

    @PreAuthorize("hasAuthority('SESSION_CREATE') or hasRole('ADMIN')")
    public SessionResponse createSession(SessionRequest request) {
        if (sessionRepository.existsByLessonIdAndSessionOrder(request.getLessonId(), request.getSessionOrder())) {
            throw new BadRequestException("Thứ tự session đã tồn tại trong lesson này.");
        }

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));

        Session session = new Session();
        mapRequestToEntity(request, session);
        session.setLesson(lesson);

        return convertToResponse(sessionRepository.save(session));
    }

    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN')")
    public SessionResponse updateSession(UUID id, SessionRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id));

        mapRequestToEntity(request, session);
        
        if (request.getLessonId() != null && !request.getLessonId().equals(session.getLesson().getId())) {
            Lesson newLesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));
            session.setLesson(newLesson);
        }

        return convertToResponse(sessionRepository.save(session));
    }

    @PreAuthorize("hasAuthority('SESSION_DELETE') or hasRole('ADMIN')")
    public void deleteSession(UUID id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Session", "id", id);
        }
        sessionRepository.deleteById(id);
    }

    public SessionResponse getSessionById(UUID id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id));
        return convertToResponse(session);
    }

    public List<SessionResponse> getSessionsByLesson(UUID lessonId) {
        return sessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private void mapRequestToEntity(SessionRequest request, Session session) {
        session.setTopic(request.getTopic());
        session.setSessionOrder(request.getSessionOrder());
        session.setStudentTasks(request.getStudentTasks());
        if (request.getType() != null) {
            session.setType(SessionType.valueOf(request.getType().toUpperCase()));
        }
    }

    private SessionResponse convertToResponse(Session session) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setTopic(session.getTopic());
        response.setType(session.getType() != null ? session.getType().name() : null);
        response.setSessionOrder(session.getSessionOrder());
        response.setStudentTasks(session.getStudentTasks());
        response.setLessonId(session.getLesson().getId());
        return response;
    }
}