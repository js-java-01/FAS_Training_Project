package com.example.starter_project_2025.system.topic_mark.service.impl;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import com.example.starter_project_2025.system.topic_mark.entity.*;
import com.example.starter_project_2025.system.topic_mark.repository.*;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TopicMarkServiceImpl implements TopicMarkService {

    private final TopicMarkRepository topicMarkRepository;
    private final TopicMarkColumnRepository topicMarkColumnRepository;
    private final TopicMarkEntryRepository topicMarkEntryRepository;
    private final TopicMarkEntryHistoryRepository topicMarkEntryHistoryRepository;
    private final CourseClassRepository courseClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseAssessmentTypeWeightRepository courseAssessmentTypeWeightRepository;
    private final UserRepository userRepository;

    // â”€â”€ Column management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public TopicMarkColumnResponse addColumn(UUID courseClassId, TopicMarkColumnRequest request, UUID editorId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        assessmentTypeRepository.findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("AssessmentType not found: " + request.getAssessmentTypeId()));

        // Validate that a weight config exists for this AssessmentType in the course
        CourseAssessmentTypeWeight weight = courseAssessmentTypeWeightRepository
                .findByCourseIdAndAssessmentTypeId(courseClass.getCourse().getId(), request.getAssessmentTypeId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No weight configured for AssessmentType [" + request.getAssessmentTypeId()
                                + "] in course [" + courseClass.getCourse().getId() + "]. Configure it first."));

        int nextIndex = topicMarkColumnRepository.nextColumnIndex(courseClassId, request.getAssessmentTypeId());

        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + editorId));

        TopicMarkColumn column = TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(weight.getAssessmentType())
                .columnLabel(request.getColumnLabel())
                .columnIndex(nextIndex)
                .isDeleted(false)
                .createdBy(editor)
                .build();
        column = topicMarkColumnRepository.save(column);

        // Create null entries for all currently enrolled students
        createNullEntriesForColumn(column, courseClass);

        return mapToColumnResponse(column, weight);
    }

    @Override
    public TopicMarkColumnResponse updateColumnLabel(UUID courseClassId, UUID columnId, String newLabel, UUID editorId) {
        TopicMarkColumn column = loadColumn(courseClassId, columnId);
        column.setColumnLabel(newLabel);
        column = topicMarkColumnRepository.save(column);

        CourseAssessmentTypeWeight weight = courseAssessmentTypeWeightRepository
                .findByCourseIdAndAssessmentTypeId(
                        column.getCourseClass().getCourse().getId(),
                        column.getAssessmentType().getId())
                .orElse(null);

        return mapToColumnResponse(column, weight);
    }

    @Override
    public void deleteColumn(UUID courseClassId, UUID columnId) {
        TopicMarkColumn column = loadColumn(courseClassId, columnId);

        if (topicMarkColumnRepository.hasNonNullEntries(columnId)) {
            throw new IllegalStateException(
                    "Cannot delete column [" + column.getColumnLabel()
                            + "] because it already has scores entered.");
        }

        column.setIsDeleted(true);
        topicMarkColumnRepository.save(column);
        log.info("Soft-deleted TopicMarkColumn id={} label={}", columnId, column.getColumnLabel());
    }

    // â”€â”€ Gradebook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookResponse getGradebook(UUID courseClassId) {
        CourseClass courseClass = loadCourseClass(courseClassId);

        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        Map<String, CourseAssessmentTypeWeight> weightMap = buildWeightMap(courseClass);

        // Build column definitions
        List<TopicMarkGradebookResponse.Column> columnDefs = new ArrayList<>();
        for (TopicMarkColumn col : columns) {
            CourseAssessmentTypeWeight w = weightMap.get(col.getAssessmentType().getId());
            columnDefs.add(TopicMarkGradebookResponse.Column.builder()
                    .key(col.getId().toString())
                    .label(col.getColumnLabel())
                    .assessmentTypeId(col.getAssessmentType().getId())
                    .assessmentTypeName(col.getAssessmentType().getName())
                    .weight(w != null ? w.getWeight() : null)
                    .gradingMethod(w != null && w.getGradingMethod() != null ? w.getGradingMethod().name() : null)
                    .columnIndex(col.getColumnIndex())
                    .build());
        }
        columnDefs.add(new TopicMarkGradebookResponse.Column("FINAL_SCORE", "Final Score"));
        columnDefs.add(new TopicMarkGradebookResponse.Column("IS_PASSED", "Passed"));

        // Enrolled students
        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseIdAndStatus(courseClass.getCourse().getId(), EnrollmentStatus.ACTIVE);

        // All entries for this courseClass: userId â†’ (columnId â†’ score)
        List<TopicMarkEntry> allEntries = topicMarkEntryRepository.findByCourseClassId(courseClassId);
        Map<UUID, Map<UUID, Double>> scoresByUser = new HashMap<>();
        for (TopicMarkEntry entry : allEntries) {
            UUID uid = entry.getUser().getId();
            UUID cid = entry.getTopicMarkColumn().getId();
            scoresByUser.computeIfAbsent(uid, k -> new HashMap<>()).put(cid, entry.getScore());
        }

        Map<UUID, TopicMark> marksByUser = topicMarkRepository.findAllByCourseClassId(courseClassId)
                .stream().collect(Collectors.toMap(m -> m.getUser().getId(), m -> m));

        List<TopicMarkGradebookResponse.Row> rows = enrollments.stream().map(enrollment -> {
            User user = enrollment.getUser();
            Map<String, Object> values = new LinkedHashMap<>();

            Map<UUID, Double> userScores = scoresByUser.getOrDefault(user.getId(), Collections.emptyMap());
            for (TopicMarkColumn col : columns) {
                values.put(col.getId().toString(), userScores.getOrDefault(col.getId(), null));
            }

            TopicMark mark = marksByUser.get(user.getId());
            values.put("FINAL_SCORE", mark != null ? mark.getFinalScore() : null);
            values.put("IS_PASSED", mark != null ? mark.getIsPassed() : false);

            return TopicMarkGradebookResponse.Row.builder()
                    .userId(user.getId())
                    .fullName(user.getFirstName() + " " + user.getLastName())
                    .values(values)
                    .build();
        }).collect(Collectors.toList());

        return TopicMarkGradebookResponse.builder()
                .columns(columnDefs)
                .rows(rows)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookSearchResponse searchGradebook(UUID courseClassId, String keyword, Pageable pageable) {
        TopicMarkGradebookResponse full = getGradebook(courseClassId);

        // Filter rows by student full name
        List<TopicMarkGradebookResponse.Row> filtered = full.getRows().stream()
                .filter(row -> keyword == null || keyword.isBlank() ||
                        row.getFullName().toLowerCase().contains(keyword.toLowerCase().trim()))
                .collect(Collectors.toList());

        // Manual pagination
        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), total);
        List<TopicMarkGradebookResponse.Row> pageContent = start >= total
                ? Collections.emptyList()
                : filtered.subList(start, end);

        Page<TopicMarkGradebookResponse.Row> page = new PageImpl<>(pageContent, pageable, total);

        return TopicMarkGradebookSearchResponse.builder()
                .columns(full.getColumns())
                .rows(PageResponse.from(page))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicMarkDetailResponse getStudentDetail(UUID courseClassId, UUID userId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        Map<String, CourseAssessmentTypeWeight> weightMap = buildWeightMap(courseClass);

        List<TopicMarkEntry> entries = topicMarkEntryRepository.findByCourseClassIdAndUserId(courseClassId, userId);
        Map<UUID, Double> scoreByColumnId = entries.stream()
                .collect(Collectors.toMap(
                        e -> e.getTopicMarkColumn().getId(),
                        TopicMarkEntry::getScore,
                        (a, b) -> a));

        // Group columns by assessmentType preserving order
        Map<String, List<TopicMarkColumn>> columnsByType = columns.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAssessmentType().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<TopicMarkDetailResponse.AssessmentTypeSection> sections = new ArrayList<>();

        for (Map.Entry<String, List<TopicMarkColumn>> entry : columnsByType.entrySet()) {
            String typeId = entry.getKey();
            List<TopicMarkColumn> typeCols = entry.getValue();
            CourseAssessmentTypeWeight w = weightMap.get(typeId);

            List<TopicMarkDetailResponse.ColumnScore> colScores = typeCols.stream()
                    .map(col -> TopicMarkDetailResponse.ColumnScore.builder()
                            .columnId(col.getId())
                            .columnLabel(col.getColumnLabel())
                            .columnIndex(col.getColumnIndex())
                            .score(scoreByColumnId.get(col.getId()))
                            .build())
                    .collect(Collectors.toList());

            boolean sectionHasNull = colScores.stream().anyMatch(cs -> cs.getScore() == null);

            Double sectionScore = null;
            if (!sectionHasNull && !colScores.isEmpty()) {
                sectionScore = computeSectionScore(
                        colScores.stream().map(TopicMarkDetailResponse.ColumnScore::getScore)
                                .collect(Collectors.toList()),
                        w != null && w.getGradingMethod() != null ? w.getGradingMethod() : GradingMethod.HIGHEST);
            }

            sections.add(TopicMarkDetailResponse.AssessmentTypeSection.builder()
                    .assessmentTypeId(typeId)
                    .assessmentTypeName(typeCols.get(0).getAssessmentType().getName())
                    .weight(w != null ? w.getWeight() : null)
                    .gradingMethod(w != null && w.getGradingMethod() != null ? w.getGradingMethod().name() : null)
                    .sectionScore(sectionScore)
                    .columns(colScores)
                    .build());
        }

        TopicMark mark = topicMarkRepository.findByCourseClassIdAndUserId(courseClassId, userId).orElse(null);

        List<TopicMarkEntryHistory> historyList = topicMarkEntryHistoryRepository
                .findByTopicMarkEntry_CourseClass_IdAndTopicMarkEntry_User_IdOrderByUpdatedAtDesc(courseClassId, userId);

        List<TopicMarkDetailResponse.HistoryEntry> history = historyList.stream()
                .map(h -> TopicMarkDetailResponse.HistoryEntry.builder()
                        .columnLabel(h.getTopicMarkEntry().getTopicMarkColumn().getColumnLabel())
                        .oldScore(h.getOldScore())
                        .newScore(h.getNewScore())
                        .reason(h.getReason())
                        .updatedBy(h.getUpdatedBy().getFirstName() + " " + h.getUpdatedBy().getLastName())
                        .updatedAt(h.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return TopicMarkDetailResponse.builder()
                .userId(userId)
                .fullName(user.getFirstName() + " " + user.getLastName())
                .sections(sections)
                .finalScore(mark != null ? mark.getFinalScore() : null)
                .isPassed(mark != null ? mark.getIsPassed() : false)
                .history(history)
                .build();
    }

    // â”€â”€ Score entry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public TopicMarkDetailResponse updateScores(UUID courseClassId, UUID userId,
                                                UpdateTopicMarkRequest request, UUID editorId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("Editor not found: " + editorId));

        // Ensure TopicMark record exists
        TopicMark mark = topicMarkRepository.findByCourseClassIdAndUserId(courseClassId, userId)
                .orElseGet(() -> topicMarkRepository.save(TopicMark.builder()
                        .courseClass(courseClass)
                        .user(user)
                        .isPassed(false)
                        .build()));

        for (UpdateTopicMarkRequest.EntryUpdate update : request.getEntries()) {
            TopicMarkColumn column = topicMarkColumnRepository.findById(update.getColumnId())
                    .orElseThrow(() -> new ResourceNotFoundException("Column not found: " + update.getColumnId()));

            if (!column.getCourseClass().getId().equals(courseClassId)) {
                throw new IllegalArgumentException("Column [" + update.getColumnId()
                        + "] does not belong to courseClass [" + courseClassId + "]");
            }
            if (column.getIsDeleted()) {
                throw new IllegalArgumentException("Column [" + column.getColumnLabel() + "] has been deleted");
            }

            TopicMarkEntry entry = topicMarkEntryRepository
                    .findByTopicMarkColumnIdAndUserId(update.getColumnId(), userId)
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(column)
                            .user(user)
                            .courseClass(courseClass)
                            .score(null)
                            .build()));

            Double oldScore = entry.getScore();
            Double newScore = update.getScore();

            if (!Objects.equals(oldScore, newScore)) {
                topicMarkEntryHistoryRepository.save(TopicMarkEntryHistory.builder()
                        .topicMarkEntry(entry)
                        .oldScore(oldScore)
                        .newScore(newScore)
                        .reason(request.getReason())
                        .updatedBy(editor)
                        .build());
                entry.setScore(newScore);
                topicMarkEntryRepository.save(entry);
                log.debug("Updated entry id={} col=[{}] {} â†’ {}", entry.getId(),
                        column.getColumnLabel(), oldScore, newScore);
            }
        }

        // Recompute (or clear) final score
        tryComputeAndSaveFinalScore(courseClass, userId, mark);

        return getStudentDetail(courseClassId, userId);
    }


    // â”€â”€ Initialization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public void initializeForNewStudent(UUID courseClassId, UUID userId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        topicMarkRepository.findByCourseClassIdAndUserId(courseClassId, userId)
                .orElseGet(() -> topicMarkRepository.save(TopicMark.builder()
                        .courseClass(courseClass)
                        .user(user)
                        .isPassed(false)
                        .build()));

        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        for (TopicMarkColumn col : columns) {
            topicMarkEntryRepository.findByTopicMarkColumnIdAndUserId(col.getId(), userId)
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(col)
                            .user(user)
                            .courseClass(courseClass)
                            .score(null)
                            .build()));
        }
        log.info("Initialized TopicMark + {} entries for user={} in courseClass={}", columns.size(), userId, courseClassId);
    }

    // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private CourseClass loadCourseClass(UUID id) {
        return courseClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CourseClass not found: " + id));
    }

    private TopicMarkColumn loadColumn(UUID courseClassId, UUID columnId) {
        TopicMarkColumn col = topicMarkColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found: " + columnId));
        if (!col.getCourseClass().getId().equals(courseClassId)) {
            throw new IllegalArgumentException("Column [" + columnId
                    + "] does not belong to courseClass [" + courseClassId + "]");
        }
        return col;
    }

    private Map<String, CourseAssessmentTypeWeight> buildWeightMap(CourseClass courseClass) {
        return courseAssessmentTypeWeightRepository
                .findByCourseId(courseClass.getCourse().getId())
                .stream()
                .collect(Collectors.toMap(
                        w -> w.getAssessmentType().getId(),
                        w -> w,
                        (a, b) -> a));
    }

    private void createNullEntriesForColumn(TopicMarkColumn column, CourseClass courseClass) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdAndStatus(
                courseClass.getCourse().getId(), EnrollmentStatus.ACTIVE);
        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getUser();
            topicMarkEntryRepository.findByTopicMarkColumnIdAndUserId(column.getId(), student.getId())
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(column)
                            .user(student)
                            .courseClass(courseClass)
                            .score(null)
                            .build()));
        }
    }

    /**
     * Tries to compute finalScore if all active column entries are filled.
     * Sets finalScore = null and isPassed = false if any entry is still null.
     */
    private void tryComputeAndSaveFinalScore(CourseClass courseClass, UUID userId, TopicMark mark) {
        long nullCount = topicMarkEntryRepository.countNullEntriesForUser(courseClass.getId(), userId);
        if (nullCount > 0) {
            log.debug("FinalScore not computed: {} column(s) still empty for user={}", nullCount, userId);
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findFilledEntriesForUser(courseClass.getId(), userId);

        Map<String, CourseAssessmentTypeWeight> weightMap = buildWeightMap(courseClass);

        Map<String, List<Double>> scoresByType = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getTopicMarkColumn().getAssessmentType().getId(),
                        Collectors.mapping(TopicMarkEntry::getScore, Collectors.toList())));

        double finalScore = 0.0;
        for (Map.Entry<String, CourseAssessmentTypeWeight> wEntry : weightMap.entrySet()) {
            String typeId = wEntry.getKey();
            CourseAssessmentTypeWeight w = wEntry.getValue();
            List<Double> scores = scoresByType.getOrDefault(typeId, Collections.emptyList());
            if (scores.isEmpty()) continue;

            GradingMethod gm = w.getGradingMethod() != null ? w.getGradingMethod() : GradingMethod.HIGHEST;
            double sectionScore = computeSectionScore(scores, gm);
            if (w.getWeight() != null) {
                finalScore += sectionScore * w.getWeight();
            }
        }

        Double minGpa = courseClass.getCourse().getMinGpaToPass();
        boolean isPassed = minGpa != null && finalScore >= minGpa;

        mark.setFinalScore(finalScore);
        mark.setIsPassed(isPassed);
        topicMarkRepository.save(mark);
        log.info("Computed finalScore={} isPassed={} for user={} courseClass={}", finalScore, isPassed, userId, courseClass.getId());
    }

    /** Apply grading method to a list of scores (order matters for LATEST = last by columnIndex). */
    private double computeSectionScore(List<Double> scores, GradingMethod gradingMethod) {
        if (scores == null || scores.isEmpty()) return 0.0;
        return switch (gradingMethod) {
            case HIGHEST -> scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
            case AVERAGE -> scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            case LATEST  -> scores.get(scores.size() - 1); // last element = highest columnIndex
        };
    }

    private TopicMarkColumnResponse mapToColumnResponse(TopicMarkColumn col, CourseAssessmentTypeWeight w) {
        return TopicMarkColumnResponse.builder()
                .id(col.getId())
                .assessmentTypeId(col.getAssessmentType().getId())
                .assessmentTypeName(col.getAssessmentType().getName())
                .weight(w != null ? w.getWeight() : null)
                .gradingMethod(w != null && w.getGradingMethod() != null ? w.getGradingMethod().name() : null)
                .columnLabel(col.getColumnLabel())
                .columnIndex(col.getColumnIndex())
                .build();
    }
}
