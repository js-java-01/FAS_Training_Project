package com.example.starter_project_2025.system.topic_mark.service.impl;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
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
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

    @Override
    public TopicMarkColumnResponse addColumn(UUID courseClassId, TopicMarkColumnRequest request, UUID editorId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        assessmentTypeRepository.findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("AssessmentType not found: " + request.getAssessmentTypeId()));

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

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookResponse getGradebook(UUID courseClassId) {
        CourseClass courseClass = loadCourseClass(courseClassId);

        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        Map<String, CourseAssessmentTypeWeight> weightMap = buildWeightMap(courseClass);


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

        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseIdAndStatus(courseClass.getCourse().getId(), EnrollmentStatus.ACTIVE);

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
                    .email(user.getEmail())
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
    public TopicMarkGradebookSearchResponse searchGradebook(UUID courseClassId, String keyword, Boolean passed, Pageable pageable) {
        TopicMarkGradebookResponse full = getGradebook(courseClassId);

        List<TopicMarkGradebookResponse.Row> filtered = full.getRows().stream()
                .filter(row -> keyword == null || keyword.isBlank() ||
                        row.getFullName().toLowerCase().contains(keyword.toLowerCase().trim()))
                .filter(row -> {
                    if (passed == null) return true;
                    Object val = row.getValues().get("IS_PASSED");
                    return passed.equals(val instanceof Boolean b ? b : false);
                })
                .collect(Collectors.toList());

        if (pageable.getSort().isSorted()) {
            Comparator<TopicMarkGradebookResponse.Row> comparator = null;
            for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
                Comparator<TopicMarkGradebookResponse.Row> c;
                String prop = order.getProperty();
                if ("fullName".equalsIgnoreCase(prop)) {
                    c = Comparator.comparing(TopicMarkGradebookResponse.Row::getFullName,
                            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                } else if ("email".equalsIgnoreCase(prop)) {
                    c = Comparator.comparing(TopicMarkGradebookResponse.Row::getEmail,
                            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                } else if ("IS_PASSED".equalsIgnoreCase(prop)) {

                    c = Comparator.comparing(
                            row -> {
                                Object val = row.getValues().get("IS_PASSED");
                                return (val instanceof Boolean b) ? (b ? 1 : 0) : -1;
                            },
                            Comparator.nullsLast(Comparator.naturalOrder()));
                } else {
                    c = Comparator.comparing(
                            row -> {
                                Object val = row.getValues().get(prop);
                                if (val instanceof Number) return ((Number) val).doubleValue();
                                return null;
                            },
                            Comparator.nullsLast(Comparator.naturalOrder()));
                }
                if (order.isDescending()) c = c.reversed();
                comparator = comparator == null ? c : comparator.thenComparing(c);
            }
            if (comparator != null) filtered.sort(comparator);
        }

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
                log.debug("Updated entry id={} col=[{}] {} -> {}", entry.getId(),
                        column.getColumnLabel(), oldScore, newScore);
            }
        }
        tryComputeAndSaveFinalScore(courseClass, userId, mark);

        return getStudentDetail(courseClassId, userId);
    }

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

    @Override
    @Transactional
    public ImportResultResponse importGradebook(UUID courseClassId, MultipartFile file, UUID editorId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("Editor not found: " + editorId));

        ImportResultResponse result = new ImportResultResponse();
        List<ImportErrorDetail> errors = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            if (sheet == null) {
                result.setMessage("Empty workbook");
                return result;
            }

            // 1. Parse meta row (row 0) to build colIndex -> columnUUID mapping
            Row metaRow = sheet.getRow(0);
            if (metaRow == null || !"#META".equals(getCellString(metaRow.getCell(0)))) {
                result.setMessage("Invalid template: missing #META row");
                return result;
            }

            final int SCORE_COL_START = 4;
            Map<Integer, UUID> colIndexToColumnId = new LinkedHashMap<>();
            for (int c = SCORE_COL_START; c <= metaRow.getLastCellNum(); c++) {
                String uuid = getCellString(metaRow.getCell(c));
                if (uuid != null && !uuid.isBlank()) {
                    try {
                        colIndexToColumnId.put(c, UUID.fromString(uuid.trim()));
                    } catch (IllegalArgumentException ignored) {
                        // skip non-UUID cells
                    }
                }
            }

            if (colIndexToColumnId.isEmpty()) {
                result.setMessage("No column UUIDs found in meta row");
                return result;
            }

            // Pre-load valid columns for this courseClass
            Set<UUID> validColumnIds = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId)
                    .stream().map(TopicMarkColumn::getId).collect(Collectors.toSet());

            // 2. Parse data rows (row 2+), skip header (row 1)
            int totalRows = 0;
            int successCount = 0;
            Set<UUID> updatedUserIds = new HashSet<>();

            for (int r = 2; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                totalRows++;
                int excelRowNum = r + 1; // 1-based for user display

                // Get user ID from hidden column 1
                String userIdStr = getCellString(row.getCell(1));
                if (userIdStr == null || userIdStr.isBlank()) {
                    errors.add(new ImportErrorDetail(excelRowNum, "User ID", "Missing user ID"));
                    continue;
                }

                UUID userId;
                try {
                    userId = UUID.fromString(userIdStr.trim());
                } catch (IllegalArgumentException e) {
                    errors.add(new ImportErrorDetail(excelRowNum, "User ID", "Invalid user UUID: " + userIdStr));
                    continue;
                }

                User student = userRepository.findById(userId).orElse(null);
                if (student == null) {
                    errors.add(new ImportErrorDetail(excelRowNum, "User ID", "User not found: " + userId));
                    continue;
                }

                boolean rowHasError = false;
                int updatedCells = 0;

                for (Map.Entry<Integer, UUID> mapping : colIndexToColumnId.entrySet()) {
                    int colIdx = mapping.getKey();
                    UUID columnId = mapping.getValue();

                    if (!validColumnIds.contains(columnId)) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + columnId, "Column not found or deleted"));
                        rowHasError = true;
                        continue;
                    }

                    Cell cell = row.getCell(colIdx);
                    Double score = getCellNumeric(cell);

                    // Blank = skip (keep existing)
                    if (score == null) continue;

                    // Validate score range
                    if (score < 0 || score > 10) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + columnId, "Score out of range [0-10]: " + score));
                        rowHasError = true;
                        continue;
                    }

                    // Upsert entry
                    TopicMarkColumn column = topicMarkColumnRepository.findById(columnId).orElse(null);
                    if (column == null) continue;

                    TopicMarkEntry entry = topicMarkEntryRepository
                            .findByTopicMarkColumnIdAndUserId(columnId, userId)
                            .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                    .topicMarkColumn(column)
                                    .user(student)
                                    .courseClass(courseClass)
                                    .score(null)
                                    .build()));

                    Double oldScore = entry.getScore();
                    if (!Objects.equals(oldScore, score)) {
                        topicMarkEntryHistoryRepository.save(TopicMarkEntryHistory.builder()
                                .topicMarkEntry(entry)
                                .oldScore(oldScore)
                                .newScore(score)
                                .reason("Excel import")
                                .updatedBy(editor)
                                .build());
                        entry.setScore(score);
                        topicMarkEntryRepository.save(entry);
                    }
                    updatedCells++;
                }

                if (!rowHasError && updatedCells > 0) {
                    updatedUserIds.add(userId);
                    successCount++;
                } else if (!rowHasError && updatedCells == 0) {
                    successCount++; // all blank = still a valid row, just nothing to update
                }
            }

            // 3. Recompute final scores for all affected students
            for (UUID userId : updatedUserIds) {
                TopicMark mark = topicMarkRepository.findByCourseClassIdAndUserId(courseClassId, userId)
                        .orElseGet(() -> {
                            User u = userRepository.findById(userId).orElseThrow();
                            return topicMarkRepository.save(TopicMark.builder()
                                    .courseClass(courseClass)
                                    .user(u)
                                    .isPassed(false)
                                    .build());
                        });
                tryComputeAndSaveFinalScore(courseClass, userId, mark);
            }

            result.setTotalRows(totalRows);
            result.setSuccessCount(successCount);
            result.setFailedCount(errors.size());
            result.setErrors(errors);
            return result;

        } catch (IOException e) {
            throw new RuntimeException("Error reading Excel file: " + e.getMessage(), e);
        }
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BLANK   -> null;
            default      -> cell.toString();
        };
    }

    private Double getCellNumeric(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING  -> {
                String s = cell.getStringCellValue().trim();
                if (s.isEmpty()) yield null;
                try { yield Double.parseDouble(s); }
                catch (NumberFormatException e) { yield null; }
            }
            case BLANK   -> null;
            default      -> null;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportGradebookTemplate(UUID courseClassId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseIdAndStatus(courseClass.getCourse().getId(), EnrollmentStatus.ACTIVE);

        try (Workbook wb = new XSSFWorkbook()) {
            String rawName = courseClass.getCourse().getCourseCode()
                    + " - " + courseClass.getClassInfo().getClassCode();
            Sheet sheet = wb.createSheet(rawName.length() > 31 ? rawName.substring(0, 31) : rawName);

            
            CellStyle metaStyle  = buildMetaStyle(wb);
            CellStyle headerStyle = buildHeaderStyle(wb);
            CellStyle lockedStyle = buildLockedStyle(wb);
            CellStyle inputStyle  = buildInputStyle(wb);


            final int SCORE_COL_START = 4;


            Row metaRow = sheet.createRow(0);
            metaRow.setHeight((short) 300);   
            putCell(metaRow, 0, "#META",   metaStyle);
            putCell(metaRow, 1, "USER_ID", metaStyle);
            putCell(metaRow, 2, "",        metaStyle);
            putCell(metaRow, 3, "",        metaStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(metaRow, SCORE_COL_START + i, columns.get(i).getId().toString(), metaStyle);
            }


            Row headerRow = sheet.createRow(1);
            putCell(headerRow, 0, "STT",       headerStyle);
            putCell(headerRow, 1, "User ID",   headerStyle);
            putCell(headerRow, 2, "Họ và tên", headerStyle);
            putCell(headerRow, 3, "Email",     headerStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(headerRow, SCORE_COL_START + i, columns.get(i).getColumnLabel(), headerStyle);
            }


            int stt = 1;
            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Row row = sheet.createRow(1 + stt);
                putCell(row, 0, stt,                                                        lockedStyle);
                putCell(row, 1, student.getId().toString(),                                 lockedStyle);
                putCell(row, 2, student.getFirstName() + " " + student.getLastName(),       lockedStyle);
                putCell(row, 3, student.getEmail(),                                         lockedStyle);
                for (int i = 0; i < columns.size(); i++) {
                    row.createCell(SCORE_COL_START + i).setCellStyle(inputStyle); // blank – teacher fills in
                }
                stt++;
            }


            sheet.setColumnWidth(0, 1500);   // STT
            sheet.setColumnHidden(1, true);  // USER_ID hidden
            sheet.setColumnWidth(2, 7000);   // Họ và tên
            sheet.setColumnWidth(3, 8000);   // Email
            for (int i = 0; i < columns.size(); i++) {
                sheet.setColumnWidth(SCORE_COL_START + i, 4500);
            }


            sheet.createFreezePane(0, 2);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            String filename = "gradebook-template-" + courseClassId + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error generating gradebook template: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportGradebook(UUID courseClassId) {
        CourseClass courseClass = loadCourseClass(courseClassId);
        List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(courseClassId);
        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseIdAndStatus(courseClass.getCourse().getId(), EnrollmentStatus.ACTIVE);

        // Build score lookup: userId -> columnId -> score
        Map<UUID, Map<UUID, Double>> scoreMap = new HashMap<>();
        topicMarkEntryRepository.findByCourseClassId(courseClassId).forEach(entry -> {
            if (entry.getScore() != null) {
                scoreMap
                    .computeIfAbsent(entry.getUser().getId(), k -> new HashMap<>())
                    .put(entry.getTopicMarkColumn().getId(), entry.getScore());
            }
        });

        // Build final-mark lookup: userId -> TopicMark
        Map<UUID, TopicMark> markMap = new HashMap<>();
        topicMarkRepository.findAllByCourseClassId(courseClassId)
                .forEach(tm -> markMap.put(tm.getUser().getId(), tm));

        try (Workbook wb = new XSSFWorkbook()) {
            String rawName = courseClass.getCourse().getCourseCode()
                    + " - " + courseClass.getClassInfo().getClassCode();
            Sheet sheet = wb.createSheet(rawName.length() > 31 ? rawName.substring(0, 31) : rawName);

            CellStyle headerStyle  = buildHeaderStyle(wb);
            CellStyle lockedStyle  = buildLockedStyle(wb);
            CellStyle scoreStyle   = buildInputStyle(wb);
            CellStyle passStyle    = buildPassStyle(wb);
            CellStyle failStyle    = buildFailStyle(wb);
            CellStyle boldCenter   = buildBoldCenterStyle(wb);

            final int SCORE_COL_START = 3;
            int finalScoreCol = SCORE_COL_START + columns.size();
            int passedCol     = finalScoreCol + 1;

            // Header row
            Row headerRow = sheet.createRow(0);
            putCell(headerRow, 0, "STT",         headerStyle);
            putCell(headerRow, 1, "Họ và tên",   headerStyle);
            putCell(headerRow, 2, "Email",        headerStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(headerRow, SCORE_COL_START + i, columns.get(i).getColumnLabel(), headerStyle);
            }
            putCell(headerRow, finalScoreCol, "Final Score", headerStyle);
            putCell(headerRow, passedCol,     "Passed",      headerStyle);

            // Student rows
            int stt = 1;
            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Map<UUID, Double> studentScores = scoreMap.getOrDefault(student.getId(), Collections.emptyMap());
                TopicMark tm = markMap.get(student.getId());

                Row row = sheet.createRow(stt);
                putCell(row, 0, stt, lockedStyle);
                putCell(row, 1, student.getFirstName() + " " + student.getLastName(), lockedStyle);
                putCell(row, 2, student.getEmail(), lockedStyle);

                for (int i = 0; i < columns.size(); i++) {
                    Double score = studentScores.get(columns.get(i).getId());
                    if (score != null) putCell(row, SCORE_COL_START + i, score, scoreStyle);
                    else row.createCell(SCORE_COL_START + i).setCellStyle(scoreStyle);
                }

                if (tm != null && tm.getFinalScore() != null) {
                    putCell(row, finalScoreCol, tm.getFinalScore(), boldCenter);
                    boolean passed = Boolean.TRUE.equals(tm.getIsPassed());
                    putCell(row, passedCol, passed ? "PASS" : "FAIL", passed ? passStyle : failStyle);
                } else {
                    row.createCell(finalScoreCol).setCellStyle(scoreStyle);
                    row.createCell(passedCol).setCellStyle(scoreStyle);
                }
                stt++;
            }

            // Column widths
            sheet.setColumnWidth(0, 1500);
            sheet.setColumnWidth(1, 7000);
            sheet.setColumnWidth(2, 8000);
            for (int i = 0; i < columns.size(); i++) {
                sheet.setColumnWidth(SCORE_COL_START + i, 4500);
            }
            sheet.setColumnWidth(finalScoreCol, 4500);
            sheet.setColumnWidth(passedCol, 3500);

            sheet.createFreezePane(0, 1);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            String filename = "gradebook-" + courseClassId + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error exporting gradebook: " + e.getMessage(), e);
        }
    }

    private void putCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof String s)       cell.setCellValue(s);
        else if (value instanceof Number n)  cell.setCellValue(n.doubleValue());
        else if (value instanceof Boolean b) cell.setCellValue(b);
        if (style != null) cell.setCellStyle(style);
    }

    private CellStyle buildMetaStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontHeightInPoints((short) 8);
        f.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return s;
    }

    private CellStyle buildHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle buildLockedStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildInputStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildPassStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.DARK_GREEN.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildFailStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.DARK_RED.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildBoldCenterStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }
}
