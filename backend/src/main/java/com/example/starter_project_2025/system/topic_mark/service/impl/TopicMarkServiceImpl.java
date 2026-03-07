package com.example.starter_project_2025.system.topic_mark.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import com.example.starter_project_2025.system.topic_mark.entity.*;
import com.example.starter_project_2025.system.topic_mark.enums.ChangeType;
import com.example.starter_project_2025.system.topic_mark.repository.*;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TopicMarkServiceImpl implements TopicMarkService {

    private final TopicMarkRepository topicMarkRepository;
    private final TopicMarkColumnRepository topicMarkColumnRepository;
    private final TopicMarkEntryRepository topicMarkEntryRepository;
    private final TopicMarkEntryHistoryRepository topicMarkEntryHistoryRepository;
    private final TopicRepository topicRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;
    private final UserRepository userRepository;

    //  Helpers 

    private Topic loadTopic(UUID topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
    }

    private TrainingClass loadTrainingClass(UUID trainingClassId) {
        return trainingClassRepository.findById(trainingClassId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingClass not found: " + trainingClassId));
    }

    private TopicMarkColumn loadColumn(UUID topicId, UUID trainingClassId, UUID columnId) {
        TopicMarkColumn col = topicMarkColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found: " + columnId));
        if (!col.getTopic().getId().equals(topicId) || !col.getTrainingClass().getId().equals(trainingClassId)) {
            throw new BadRequestException("Column [" + columnId
                    + "] does not belong to topic [" + topicId + "] / trainingClass [" + trainingClassId + "]");
        }
        return col;
    }

    private TrainingProgramTopic resolveTrainingProgramTopic(UUID topicId, UUID trainingClassId) {
        UUID tpId = loadTrainingClass(trainingClassId).getTrainingProgram().getId();
        return trainingProgramTopicRepository.findByTrainingProgram_IdAndTopic_Id(tpId, topicId)
                .orElseGet(() -> trainingProgramTopicRepository.findFirstByTrainingProgram_Id(tpId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No TrainingProgramTopic for program: " + tpId + " / topic: " + topicId)));
    }

    private Map<String, Double> buildWeightMap(UUID topicId) {
        return topicAssessmentTypeWeightRepository.findByTopicId(topicId)
                .stream()
                .filter(w -> w.getAssessmentType() != null && w.getWeight() != null)
                .collect(Collectors.toMap(
                        w -> w.getAssessmentType().getId(),
                        w -> w.getWeight(),
                        (a, b) -> b));
    }

    private void createNullEntriesForColumn(TopicMarkColumn column, UUID trainingClassId) {
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);
        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getUser();
            topicMarkEntryRepository.findByTopicMarkColumnIdAndUserId(column.getId(), student.getId())
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(column)
                            .user(student)
                            .topic(column.getTopic())
                            .trainingClass(column.getTrainingClass())
                            .score(null)
                            .build()));
        }
    }

    private TopicMark ensureTopicMark(UUID topicId, UUID trainingClassId, UUID userId,
                                       Topic topic, TrainingClass trainingClass, User user) {
        return topicMarkRepository.findByTopicIdAndTrainingClassIdAndUserId(topicId, trainingClassId, userId)
                .orElseGet(() -> topicMarkRepository.save(TopicMark.builder()
                        .topic(topic)
                        .trainingClass(trainingClass)
                        .user(user)
                        .trainingProgram(trainingClass.getTrainingProgram())
                        .trainingProgramTopic(resolveTrainingProgramTopic(topicId, trainingClassId))
                        .isPassed(false)
                        .build()));
    }

    private void tryComputeAndSaveFinalScore(UUID topicId, UUID trainingClassId, UUID userId,
                                              Topic topic, TopicMark mark) {
        List<TopicMarkColumn> activeColumns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);

        if (activeColumns.isEmpty()) {
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);
        Map<UUID, Double> scoreByColumnId = entries.stream()
                .collect(Collectors.toMap(
                        e -> e.getTopicMarkColumn().getId(),
                        TopicMarkEntry::getScore,
                        (a, b) -> b));

        boolean hasMissingScore = activeColumns.stream()
                .anyMatch(c -> scoreByColumnId.get(c.getId()) == null);
        if (hasMissingScore) {
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        Map<String, Double> weightByType = buildWeightMap(topicId);
        if (weightByType.isEmpty()) {
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        Set<String> activeTypeIds = activeColumns.stream()
                .map(c -> c.getAssessmentType().getId())
                .collect(Collectors.toSet());
        if (activeTypeIds.stream().anyMatch(id -> !weightByType.containsKey(id))) {
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        Map<String, List<Double>> scoresByType = activeColumns.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAssessmentType().getId(),
                        Collectors.mapping(c -> scoreByColumnId.get(c.getId()), Collectors.toList())));

        double finalScore = 0.0;
        for (Map.Entry<String, List<Double>> entry : scoresByType.entrySet()) {
            Double w = weightByType.get(entry.getKey());
            if (w == null || entry.getValue().isEmpty()) continue;
            double colWeightFactor = (w / 100.0) / entry.getValue().size();
            for (Double s : entry.getValue()) {
                finalScore += s * colWeightFactor;
            }
        }

        double rounded = Math.round(finalScore * 100.0) / 100.0;
        Double minGpa = topic.getMinGpaToPass();
        boolean isPassed = minGpa != null && rounded >= minGpa;

        mark.setFinalScore(rounded);
        mark.setIsPassed(isPassed);
        topicMarkRepository.save(mark);
    }

    private ChangeType determineChangeType(Double oldScore, Double newScore) {
        if (oldScore == null && newScore == null) return null;
        if (oldScore == null) return ChangeType.INCREASE;
        if (newScore == null) return ChangeType.DECREASE;
        return newScore >= oldScore ? ChangeType.INCREASE : ChangeType.DECREASE;
    }

    //  API Methods 

    @Override
    public TopicMarkColumnResponse addColumn(UUID topicId, UUID trainingClassId,
                                              TopicMarkColumnRequest request, UUID editorId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        AssessmentType assessmentType = assessmentTypeRepository.findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AssessmentType not found: " + request.getAssessmentTypeId()));

        // Verify weight is configured for this topic + assessment type
        topicAssessmentTypeWeightRepository.findByTopicId(topicId)
                .stream()
                .filter(w -> w.getAssessmentType() != null
                        && w.getAssessmentType().getId().equals(request.getAssessmentTypeId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "No weight configured for AssessmentType [" + request.getAssessmentTypeId()
                                + "] in topic [" + topicId + "]. Configure it first."));

        int nextIndex = topicMarkColumnRepository
                .findMaxColumnIndex(topicId, trainingClassId, request.getAssessmentTypeId()) + 1;

        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + editorId));

        TopicMarkColumn column = TopicMarkColumn.builder()
                .topic(topic)
                .trainingClass(trainingClass)
                .assessmentType(assessmentType)
                .columnLabel(request.getColumnLabel())
                .columnIndex(nextIndex)
                .isDeleted(false)
                .createdBy(editor)
                .build();
        column = topicMarkColumnRepository.save(column);
        createNullEntriesForColumn(column, trainingClassId);

        Map<String, Double> weights = buildWeightMap(topicId);
        return TopicMarkColumnResponse.builder()
                .id(column.getId())
                .assessmentTypeId(assessmentType.getId())
                .assessmentTypeName(assessmentType.getName())
                .weight(weights.get(assessmentType.getId()))
                .columnLabel(column.getColumnLabel())
                .columnIndex(column.getColumnIndex())
                .build();
    }

    @Override
    public TopicMarkColumnResponse updateColumnLabel(UUID topicId, UUID trainingClassId,
                                                      UUID columnId, String newLabel, UUID editorId) {
        TopicMarkColumn column = loadColumn(topicId, trainingClassId, columnId);
        column.setColumnLabel(newLabel);
        column = topicMarkColumnRepository.save(column);

        Map<String, Double> weights = buildWeightMap(topicId);
        return TopicMarkColumnResponse.builder()
                .id(column.getId())
                .assessmentTypeId(column.getAssessmentType().getId())
                .assessmentTypeName(column.getAssessmentType().getName())
                .weight(weights.get(column.getAssessmentType().getId()))
                .columnLabel(column.getColumnLabel())
                .columnIndex(column.getColumnIndex())
                .build();
    }

    @Override
    public void deleteColumn(UUID topicId, UUID trainingClassId, UUID columnId) {
        TopicMarkColumn column = loadColumn(topicId, trainingClassId, columnId);
        if (topicMarkColumnRepository.hasNonNullEntries(columnId)) {
            throw new BadRequestException("Cannot delete column [" + column.getColumnLabel()
                    + "] because it already has scores entered.");
        }
        column.setIsDeleted(true);
        topicMarkColumnRepository.save(column);
        log.info("Soft-deleted TopicMarkColumn id={} label={}", columnId, column.getColumnLabel());
    }

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookResponse getGradebook(UUID topicId, UUID trainingClassId) {
        Map<String, Double> weightByTypeId = buildWeightMap(topicId);
        List<TopicMarkColumn> columns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);

        List<TopicMarkGradebookResponse.Column> columnDefs = new ArrayList<>();
        for (TopicMarkColumn col : columns) {
            columnDefs.add(TopicMarkGradebookResponse.Column.builder()
                    .key(col.getId().toString())
                    .label(col.getColumnLabel())
                    .assessmentTypeId(col.getAssessmentType().getId())
                    .assessmentTypeName(col.getAssessmentType().getName())
                    .weight(weightByTypeId.get(col.getAssessmentType().getId()))
                    .columnIndex(col.getColumnIndex())
                    .build());
        }
        columnDefs.add(new TopicMarkGradebookResponse.Column("FINAL_SCORE", "Final Score"));
        columnDefs.add(new TopicMarkGradebookResponse.Column("IS_PASSED", "Passed"));

        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);

        List<TopicMarkEntry> allEntries = topicMarkEntryRepository
                .findByTopicAndClass(topicId, trainingClassId);
        Map<UUID, Map<UUID, Double>> scoresByUser = new HashMap<>();
        for (TopicMarkEntry entry : allEntries) {
            UUID uid = entry.getUser().getId();
            UUID cid = entry.getTopicMarkColumn().getId();
            scoresByUser.computeIfAbsent(uid, k -> new HashMap<>()).put(cid, entry.getScore());
        }

        Map<UUID, TopicMark> marksByUser = topicMarkRepository
                .findByTopicIdAndTrainingClassId(topicId, trainingClassId)
                .stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m, (a, b) -> b));

        List<TopicMarkGradebookResponse.Row> rows = enrollments.stream().map(enrollment -> {
            User user = enrollment.getUser();
            Map<String, Object> values = new LinkedHashMap<>();
            Map<UUID, Double> userScores = scoresByUser.getOrDefault(user.getId(), Collections.emptyMap());
            for (TopicMarkColumn col : columns) {
                values.put(col.getId().toString(), userScores.get(col.getId()));
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
    public TopicMarkGradebookSearchResponse searchGradebook(UUID topicId, UUID trainingClassId,
                                                             String keyword, Boolean passed,
                                                             Pageable pageable) {
        TopicMarkGradebookResponse full = getGradebook(topicId, trainingClassId);
        String norm = keyword == null ? "" : keyword.trim().toLowerCase();

        List<TopicMarkGradebookResponse.Row> filtered = full.getRows().stream()
                .filter(row -> {
                    if (norm.isBlank()) return true;
                    String name = row.getFullName() == null ? "" : row.getFullName().toLowerCase();
                    String email = row.getEmail() == null ? "" : row.getEmail().toLowerCase();
                    return name.contains(norm) || email.contains(norm);
                })
                .filter(row -> {
                    if (passed == null) return true;
                    Object val = row.getValues().get("IS_PASSED");
                    return passed.equals(val instanceof Boolean b ? b : false);
                })
                .collect(Collectors.toList());

        if (pageable.getSort().isSorted()) {
            Comparator<TopicMarkGradebookResponse.Row> comp = null;
            for (Sort.Order order : pageable.getSort()) {
                Comparator<TopicMarkGradebookResponse.Row> c;
                String prop = order.getProperty();
                if ("fullName".equalsIgnoreCase(prop)) {
                    c = Comparator.comparing(TopicMarkGradebookResponse.Row::getFullName,
                            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                } else if ("email".equalsIgnoreCase(prop)) {
                    c = Comparator.comparing(TopicMarkGradebookResponse.Row::getEmail,
                            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
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
                comp = comp == null ? c : comp.thenComparing(c);
            }
            if (comp != null) filtered.sort(comp);
        }

        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<TopicMarkGradebookResponse.Row> pageContent = start >= total
                ? Collections.emptyList() : filtered.subList(start, end);

        return TopicMarkGradebookSearchResponse.builder()
                .columns(full.getColumns())
                .rows(PageResponse.from(new PageImpl<>(pageContent, pageable, total)))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicMarkDetailResponse getStudentDetail(UUID topicId, UUID trainingClassId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<TopicMarkColumn> columns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);
        Map<String, Double> weightByTypeId = buildWeightMap(topicId);

        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);
        Map<UUID, Double> scoreByColumnId = entries.stream()
                .collect(Collectors.toMap(
                        e -> e.getTopicMarkColumn().getId(),
                        TopicMarkEntry::getScore,
                        (a, b) -> b));

        Map<String, List<TopicMarkColumn>> columnsByType = columns.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAssessmentType().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<TopicMarkDetailResponse.AssessmentTypeSection> sections = new ArrayList<>();
        for (Map.Entry<String, List<TopicMarkColumn>> grouped : columnsByType.entrySet()) {
            String typeId = grouped.getKey();
            List<TopicMarkColumn> typeCols = grouped.getValue();
            List<TopicMarkDetailResponse.ColumnScore> colScores = typeCols.stream()
                    .map(col -> TopicMarkDetailResponse.ColumnScore.builder()
                            .columnId(col.getId())
                            .columnLabel(col.getColumnLabel())
                            .columnIndex(col.getColumnIndex())
                            .score(scoreByColumnId.get(col.getId()))
                            .build())
                    .collect(Collectors.toList());

            boolean hasNull = colScores.stream().anyMatch(cs -> cs.getScore() == null);
            Double sectionScore = (!hasNull && !colScores.isEmpty())
                    ? colScores.stream().mapToDouble(cs -> cs.getScore()).average().orElse(0.0)
                    : null;

            sections.add(TopicMarkDetailResponse.AssessmentTypeSection.builder()
                    .assessmentTypeId(typeId)
                    .assessmentTypeName(typeCols.get(0).getAssessmentType().getName())
                    .weight(weightByTypeId.get(typeId))
                    .sectionScore(sectionScore)
                    .columns(colScores)
                    .build());
        }

        TopicMark mark = topicMarkRepository
                .findByTopicIdAndTrainingClassIdAndUserId(topicId, trainingClassId, userId)
                .orElse(null);

        List<TopicMarkEntryHistory> historyList = topicMarkEntryHistoryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);
        List<TopicMarkDetailResponse.HistoryEntry> history = historyList.stream()
                .map(h -> TopicMarkDetailResponse.HistoryEntry.builder()
                        .columnLabel(h.getTopicMarkEntry().getTopicMarkColumn().getColumnLabel())
                        .oldScore(h.getOldScore())
                        .newScore(h.getNewScore())
                        .changeType(h.getChangeType() != null ? h.getChangeType().name() : null)
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
    public TopicMarkDetailResponse updateScores(UUID topicId, UUID trainingClassId, UUID userId,
                                                 UpdateTopicMarkRequest request, UUID editorId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("Editor not found: " + editorId));

        List<UpdateTopicMarkRequest.EntryUpdate> updates = request.getEntries();
        if (updates == null || updates.isEmpty()) {
            if (request.getColumnId() != null) {
                updates = List.of(new UpdateTopicMarkRequest.EntryUpdate(request.getColumnId(), request.getScore()));
            } else {
                throw new BadRequestException("At least one entry must be provided");
            }
        }

        TopicMark mark = ensureTopicMark(topicId, trainingClassId, userId, topic, trainingClass, user);

        for (UpdateTopicMarkRequest.EntryUpdate update : updates) {
            TopicMarkColumn column = topicMarkColumnRepository.findById(update.getColumnId())
                    .orElseThrow(() -> new ResourceNotFoundException("Column not found: " + update.getColumnId()));
            if (!column.getTopic().getId().equals(topicId) || !column.getTrainingClass().getId().equals(trainingClassId)) {
                throw new BadRequestException("Column [" + update.getColumnId()
                        + "] does not belong to topic/class [" + topicId + "/" + trainingClassId + "]");
            }
            if (column.getIsDeleted()) {
                throw new BadRequestException("Column [" + column.getColumnLabel() + "] has been deleted");
            }

            TopicMarkEntry entry = topicMarkEntryRepository
                    .findByTopicMarkColumnIdAndUserId(update.getColumnId(), userId)
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(column)
                            .user(user)
                            .topic(topic)
                            .trainingClass(trainingClass)
                            .score(null)
                            .build()));

            Double oldScore = entry.getScore();
            Double newScore = update.getScore();
            if (!Objects.equals(oldScore, newScore)) {
                topicMarkEntryHistoryRepository.save(TopicMarkEntryHistory.builder()
                        .topicMarkEntry(entry)
                        .oldScore(oldScore)
                        .newScore(newScore)
                        .changeType(determineChangeType(oldScore, newScore))
                        .reason(request.getReason())
                        .updatedBy(editor)
                        .build());
                entry.setScore(newScore);
                topicMarkEntryRepository.save(entry);
                log.debug("Updated entry col=[{}] {} -> {}", column.getColumnLabel(), oldScore, newScore);
            }
        }
        tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, topic, mark);
        return getStudentDetail(topicId, trainingClassId, userId);
    }

    @Override
    public ScoreHistoryResponse getScoreHistory(UUID topicId, UUID trainingClassId, Pageable pageable) {
        Pageable effective = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<TopicMarkEntryHistory> page = topicMarkEntryHistoryRepository
                .findPageByTopicAndClass(topicId, trainingClassId, effective);

        String sortStr = page.getSort().isSorted()
                ? page.getSort().stream()
                .map(o -> o.getProperty() + "," + o.getDirection().name().toLowerCase())
                .collect(Collectors.joining(";"))
                : "unsorted";

        List<ScoreHistoryResponse.HistoryItem> items = page.getContent().stream()
                .map(h -> {
                    TopicMarkEntry entry = h.getTopicMarkEntry();
                    User student = entry.getUser();
                    User ed = h.getUpdatedBy();
                    return ScoreHistoryResponse.HistoryItem.builder()
                            .id(h.getId())
                            .trainingClassId(entry.getTrainingClass().getId())
                            .student(ScoreHistoryResponse.UserRef.builder()
                                    .id(student.getId())
                                    .name(student.getFirstName() + " " + student.getLastName())
                                    .build())
                            .column(ScoreHistoryResponse.ColumnRef.builder()
                                    .id(entry.getTopicMarkColumn().getId())
                                    .name(entry.getTopicMarkColumn().getColumnLabel())
                                    .build())
                            .oldScore(h.getOldScore())
                            .newScore(h.getNewScore())
                            .changeType(h.getChangeType() != null ? h.getChangeType().name() : null)
                            .reason(h.getReason())
                            .updatedBy(ScoreHistoryResponse.UserRef.builder()
                                    .id(ed.getId())
                                    .name(ed.getFirstName() + " " + ed.getLastName())
                                    .build())
                            .updatedAt(h.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return ScoreHistoryResponse.builder()
                .content(items)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .sort(sortStr)
                .build();
    }

    @Override
    public void initializeForNewStudent(UUID topicId, UUID trainingClassId, UUID userId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        TopicMark mark = ensureTopicMark(topicId, trainingClassId, userId, topic, trainingClass, user);

        List<TopicMarkColumn> columns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);
        for (TopicMarkColumn col : columns) {
            topicMarkEntryRepository.findByTopicMarkColumnIdAndUserId(col.getId(), userId)
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .topicMarkColumn(col)
                            .user(user)
                            .topic(topic)
                            .trainingClass(trainingClass)
                            .score(null)
                            .build()));
        }
        tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, topic, mark);
        log.info("Initialized TopicMark + {} entries for user={} topic={} class={}",
                columns.size(), userId, topicId, trainingClassId);
    }

    //  Excel import / export 

    @Override
    @Transactional
    public ImportResultResponse importGradebook(UUID topicId, UUID trainingClassId,
                                                 MultipartFile file, UUID editorId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("Editor not found: " + editorId));

        ImportResultResponse result = new ImportResultResponse();
        List<ImportErrorDetail> errors = new ArrayList<>();

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File import is empty.");
        }

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            if (sheet == null) throw new BadRequestException("File import is empty.");

            Row metaRow = sheet.getRow(0);
            if (metaRow == null || !"#META".equals(getCellString(metaRow.getCell(0)))) {
                throw new BadRequestException("Invalid template: wrong format.");
            }

            final int SCORE_COL_START = 4;
            Map<Integer, UUID> colIndexToColumnId = new LinkedHashMap<>();
            for (int c = SCORE_COL_START; c <= metaRow.getLastCellNum(); c++) {
                String uuid = getCellString(metaRow.getCell(c));
                if (uuid != null && !uuid.isBlank()) {
                    try {
                        colIndexToColumnId.put(c, UUID.fromString(uuid.trim()));
                    } catch (IllegalArgumentException ignored) {}
                }
            }

            if (colIndexToColumnId.isEmpty()) {
                throw new BadRequestException("Invalid template: no score columns found in meta row.");
            }

            Set<UUID> validColumnIds = topicMarkColumnRepository
                    .findActiveByTopicAndClass(topicId, trainingClassId)
                    .stream().map(TopicMarkColumn::getId).collect(Collectors.toSet());

            int totalRows = 0, successCount = 0;
            Set<UUID> updatedUserIds = new HashSet<>();

            for (int r = 2; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                int excelRowNum = r + 1;

                String userIdStr = getCellString(row.getCell(1));
                if ((userIdStr == null || userIdStr.isBlank())
                        && !hasAnyScoreInput(row, colIndexToColumnId.keySet())
                        && !isPotentialStudentRow(row)) {
                    continue;
                }
                totalRows++;

                if (userIdStr == null || userIdStr.isBlank()) {
                    errors.add(new ImportErrorDetail(excelRowNum, "User ID", "Missing user ID"));
                    continue;
                }
                UUID userId;
                try {
                    userId = UUID.fromString(userIdStr.trim());
                } catch (IllegalArgumentException e) {
                    errors.add(new ImportErrorDetail(excelRowNum, "User ID", "Invalid UUID: " + userIdStr));
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
                    Double score = getCellNumeric(row.getCell(colIdx));
                    if (score == null) continue;
                    if (score < 0 || score > 10) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + columnId,
                                "Score out of range [0-10]: " + score));
                        rowHasError = true;
                        continue;
                    }
                    TopicMarkColumn column = topicMarkColumnRepository.findById(columnId).orElse(null);
                    if (column == null) continue;

                    TopicMarkEntry entry = topicMarkEntryRepository
                            .findByTopicMarkColumnIdAndUserId(columnId, userId)
                            .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                    .topicMarkColumn(column)
                                    .user(student)
                                    .topic(topic)
                                    .trainingClass(trainingClass)
                                    .score(null)
                                    .build()));

                    Double oldScore = entry.getScore();
                    if (!Objects.equals(oldScore, score)) {
                        topicMarkEntryHistoryRepository.save(TopicMarkEntryHistory.builder()
                                .topicMarkEntry(entry)
                                .oldScore(oldScore)
                                .newScore(score)
                                .changeType(determineChangeType(oldScore, score))
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
                } else if (!rowHasError) {
                    successCount++;
                }
            }

            for (UUID userId : updatedUserIds) {
                User u = userRepository.findById(userId).orElseThrow();
                TopicMark mark = ensureTopicMark(topicId, trainingClassId, userId, topic, trainingClass, u);
                tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, topic, mark);
            }

            result.setTotalRows(totalRows);
            result.setSuccessCount(successCount);
            result.setFailedCount(errors.size());
            result.setErrors(errors);

            if (totalRows == 0) {
                result.setMessage("Null file. Please check again.");
                result.setFailedCount(Math.max(result.getFailedCount(), 1));
            } else if (updatedUserIds.isEmpty()) {
                result.setMessage("File is invalid. Please check again.");
                result.setFailedCount(Math.max(result.getFailedCount(), 1));
            }
            return result;

        } catch (IOException e) {
            throw new RuntimeException("Error reading Excel file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportGradebookTemplate(UUID topicId, UUID trainingClassId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        List<TopicMarkColumn> columns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);

        try (Workbook wb = new XSSFWorkbook()) {
            String rawName = topic.getTopicCode() + " - " + trainingClass.getClassCode();
            Sheet sheet = wb.createSheet(rawName.length() > 31 ? rawName.substring(0, 31) : rawName);

            CellStyle metaStyle = buildMetaStyle(wb);
            CellStyle headerStyle = buildHeaderStyle(wb);
            CellStyle lockedStyle = buildLockedStyle(wb);
            CellStyle inputStyle = buildInputStyle(wb);
            CellStyle noteTitleStyle = buildNoteTitleStyle(wb);
            CellStyle noteBodyStyle = buildNoteBodyStyle(wb);

            final int SCORE_COL_START = 4;
            Row metaRow = sheet.createRow(0);
            metaRow.setHeight((short) 300);
            metaRow.setZeroHeight(true);
            putCell(metaRow, 0, "#META", metaStyle);
            putCell(metaRow, 1, "USER_ID", metaStyle);
            putCell(metaRow, 2, "", metaStyle);
            putCell(metaRow, 3, "", metaStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(metaRow, SCORE_COL_START + i, columns.get(i).getId().toString(), metaStyle);
            }

            Row headerRow = sheet.createRow(1);
            putCell(headerRow, 0, "No.", headerStyle);
            putCell(headerRow, 1, "User ID", headerStyle);
            putCell(headerRow, 2, "Full Name", headerStyle);
            putCell(headerRow, 3, "Email", headerStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(headerRow, SCORE_COL_START + i, columns.get(i).getColumnLabel(), headerStyle);
            }

            int stt = 1;
            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Row row = sheet.createRow(1 + stt);
                putCell(row, 0, stt, lockedStyle);
                putCell(row, 1, student.getId().toString(), lockedStyle);
                String firstName = student.getFirstName() != null ? student.getFirstName() : "";
                String lastName = student.getLastName() != null ? student.getLastName() : "";
                putCell(row, 2, (firstName + " " + lastName).trim(), lockedStyle);
                putCell(row, 3, student.getEmail(), lockedStyle);
                for (int i = 0; i < columns.size(); i++) {
                    row.createCell(SCORE_COL_START + i).setCellStyle(inputStyle);
                }
                stt++;
            }

            sheet.setColumnWidth(0, 1500);
            sheet.setColumnHidden(1, true);
            sheet.setColumnWidth(2, 7000);
            sheet.setColumnWidth(3, 8000);
            for (int i = 0; i < columns.size(); i++) {
                sheet.setColumnWidth(SCORE_COL_START + i, 4500);
            }
            sheet.createFreezePane(0, 2);

            int noteStartRow = enrollments.size() + 4;
            for (int ri = noteStartRow; ri <= noteStartRow + 3; ri++) {
                Row noteBgRow = sheet.createRow(ri);
                for (int c = 0; c <= 2; c++) noteBgRow.createCell(c).setCellStyle(noteBodyStyle);
            }
            Row noteTitleRow = sheet.getRow(noteStartRow);
            putCell(noteTitleRow, 0, "Note", noteTitleStyle);
            putCell(noteTitleRow, 2, "Score format requirement:", noteTitleStyle);
            putCell(sheet.getRow(noteStartRow + 1), 2, "Use dot (.) for decimal", noteBodyStyle);
            putCell(sheet.getRow(noteStartRow + 2), 2, "Accepted example: 9.99", noteBodyStyle);
            putCell(sheet.getRow(noteStartRow + 3), 2, "Not accepted: 6,88", noteBodyStyle);
            sheet.addMergedRegion(new CellRangeAddress(noteStartRow, noteStartRow + 3, 0, 0));
            sheet.addMergedRegion(new CellRangeAddress(noteStartRow, noteStartRow, 2, 4));
            sheet.addMergedRegion(new CellRangeAddress(noteStartRow + 1, noteStartRow + 1, 2, 4));
            sheet.addMergedRegion(new CellRangeAddress(noteStartRow + 2, noteStartRow + 2, 2, 4));
            sheet.addMergedRegion(new CellRangeAddress(noteStartRow + 3, noteStartRow + 3, 2, 4));

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"gradebook-template-" + topicId + "-" + trainingClassId + ".xlsx\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error generating gradebook template: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportGradebook(UUID topicId, UUID trainingClassId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        List<TopicMarkColumn> columns = topicMarkColumnRepository
                .findActiveByTopicAndClass(topicId, trainingClassId);
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);

        Map<UUID, Map<UUID, Double>> scoreMap = new HashMap<>();
        topicMarkEntryRepository.findByTopicAndClass(topicId, trainingClassId).forEach(entry -> {
            if (entry.getScore() != null) {
                scoreMap.computeIfAbsent(entry.getUser().getId(), k -> new HashMap<>())
                        .put(entry.getTopicMarkColumn().getId(), entry.getScore());
            }
        });
        Map<UUID, TopicMark> markMap = topicMarkRepository
                .findByTopicIdAndTrainingClassId(topicId, trainingClassId)
                .stream().collect(Collectors.toMap(tm -> tm.getUser().getId(), tm -> tm, (a, b) -> b));

        try (Workbook wb = new XSSFWorkbook()) {
            String rawName = topic.getTopicCode() + " - " + trainingClass.getClassCode();
            Sheet sheet = wb.createSheet(rawName.length() > 31 ? rawName.substring(0, 31) : rawName);

            CellStyle headerStyle = buildHeaderStyle(wb);
            CellStyle lockedStyle = buildLockedStyle(wb);
            CellStyle scoreStyle = buildInputStyle(wb);
            CellStyle passStyle = buildPassStyle(wb);
            CellStyle failStyle = buildFailStyle(wb);
            CellStyle boldCenter = buildBoldCenterStyle(wb);

            final int SCORE_COL_START = 3;
            int finalScoreCol = SCORE_COL_START + columns.size();
            int passedCol = finalScoreCol + 1;

            Row headerRow = sheet.createRow(0);
            putCell(headerRow, 0, "No", headerStyle);
            putCell(headerRow, 1, "Full Name", headerStyle);
            putCell(headerRow, 2, "Email", headerStyle);
            for (int i = 0; i < columns.size(); i++) {
                putCell(headerRow, SCORE_COL_START + i, columns.get(i).getColumnLabel(), headerStyle);
            }
            putCell(headerRow, finalScoreCol, "Final Score", headerStyle);
            putCell(headerRow, passedCol, "Passed", headerStyle);

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
                    Double sc = studentScores.get(columns.get(i).getId());
                    if (sc != null) putCell(row, SCORE_COL_START + i, sc, scoreStyle);
                    else row.createCell(SCORE_COL_START + i).setCellStyle(scoreStyle);
                }
                if (tm != null && tm.getFinalScore() != null) {
                    putCell(row, finalScoreCol, tm.getFinalScore(), boldCenter);
                    boolean p = Boolean.TRUE.equals(tm.getIsPassed());
                    putCell(row, passedCol, p ? "PASS" : "FAIL", p ? passStyle : failStyle);
                } else {
                    row.createCell(finalScoreCol).setCellStyle(scoreStyle);
                    row.createCell(passedCol).setCellStyle(scoreStyle);
                }
                stt++;
            }

            sheet.setColumnWidth(0, 1500);
            sheet.setColumnWidth(1, 7000);
            sheet.setColumnWidth(2, 8000);
            for (int i = 0; i < columns.size(); i++) sheet.setColumnWidth(SCORE_COL_START + i, 4500);
            sheet.setColumnWidth(finalScoreCol, 4500);
            sheet.setColumnWidth(passedCol, 3500);
            sheet.createFreezePane(0, 1);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"gradebook-" + topicId + "-" + trainingClassId + ".xlsx\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error exporting gradebook: " + e.getMessage(), e);
        }
    }

    //  POI helpers 

    private void putCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof String s) cell.setCellValue(s);
        else if (value instanceof Number n) cell.setCellValue(n.doubleValue());
        else if (value instanceof Boolean b) cell.setCellValue(b);
        if (style != null) cell.setCellStyle(style);
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BLANK -> null;
            default -> cell.toString();
        };
    }

    private Double getCellNumeric(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                String s = cell.getStringCellValue().trim();
                if (s.isEmpty()) yield null;
                try { yield Double.parseDouble(s); } catch (NumberFormatException e) { yield null; }
            }
            case BLANK -> null;
            default -> null;
        };
    }

    private boolean hasAnyScoreInput(Row row, Set<Integer> scoreColumns) {
        for (Integer colIdx : scoreColumns) {
            String raw = getCellString(row.getCell(colIdx));
            if (raw != null && !raw.isBlank()) return true;
        }
        return false;
    }

    private boolean isPotentialStudentRow(Row row) {
        String stt = getCellString(row.getCell(0));
        if (stt != null && !stt.isBlank()) {
            try { Double.parseDouble(stt.trim()); return true; } catch (NumberFormatException ignored) {}
        }
        String email = getCellString(row.getCell(3));
        return email != null && !email.isBlank();
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
        Font f = wb.createFont(); f.setBold(true); s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle buildLockedStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildInputStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildPassStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont(); f.setBold(true); f.setColor(IndexedColors.DARK_GREEN.getIndex()); s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildFailStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont(); f.setBold(true); f.setColor(IndexedColors.DARK_RED.getIndex()); s.setFont(f);
        s.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildBoldCenterStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont(); f.setBold(true); s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle buildNoteTitleStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont(); f.setBold(true); s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setVerticalAlignment(VerticalAlignment.TOP);
        s.setAlignment(HorizontalAlignment.LEFT);
        return s;
    }

    private CellStyle buildNoteBodyStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }
}