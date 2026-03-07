package com.example.starter_project_2025.system.topic_mark.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import com.example.starter_project_2025.system.topic_mark.entity.*;
import com.example.starter_project_2025.system.topic_mark.enums.ChangeType;
import com.example.starter_project_2025.system.topic_mark.repository.*;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
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
    private final TopicMarkEntryRepository topicMarkEntryRepository;
    private final TopicMarkEntryHistoryRepository topicMarkEntryHistoryRepository;
    private final TopicRepository topicRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TopicAssessmentSchemeRepository schemeRepository;
    private final TopicAssessmentComponentRepository componentRepository;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;
    private final UserRepository userRepository;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Topic loadTopic(UUID topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
    }

    private TrainingClass loadTrainingClass(UUID trainingClassId) {
        return trainingClassRepository.findById(trainingClassId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingClass not found: " + trainingClassId));
    }

    private TrainingProgramTopic resolveTrainingProgramTopic(UUID topicId, UUID trainingClassId) {
        UUID tpId = loadTrainingClass(trainingClassId).getTrainingProgram().getId();
        return trainingProgramTopicRepository.findByTrainingProgram_IdAndTopic_Id(tpId, topicId)
                .orElseGet(() -> trainingProgramTopicRepository.findFirstByTrainingProgram_Id(tpId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No TrainingProgramTopic for program: " + tpId + " / topic: " + topicId)));
    }

    /** All assessment components for a topic, ordered by displayOrder. */
    private List<TopicAssessmentComponent> loadComponents(UUID topicId) {
        return componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId);
    }

    /** Build a column key consistent with the gradebook format. */
    private String columnKey(UUID componentId, int index) {
        return componentId.toString() + "_" + index;
    }

    /** Build a human-readable label like "Quiz 2". */
    private String columnLabel(TopicAssessmentComponent comp, int index) {
        return comp.getName() + " " + index;
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

    /**
     * Recompute final score if ALL graded slots are filled.
     *
     * finalScore = Σ ( avg(graded component slots) × weight / 100 )
     * isPassed   = finalScore >= scheme.minGpaToPass
     */
    private void tryComputeAndSaveFinalScore(UUID topicId, UUID trainingClassId, UUID userId,
                                              TopicMark mark) {
        List<TopicAssessmentComponent> allComponents = loadComponents(topicId);
        List<TopicAssessmentComponent> gradedComponents = allComponents.stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsGraded()))
                .toList();

        if (gradedComponents.isEmpty()) {
            mark.setFinalScore(null);
            mark.setIsPassed(false);
            topicMarkRepository.save(mark);
            return;
        }

        // Fetch all entries for this student in this topic-class
        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);

        // Index: componentId -> componentIndex -> score
        Map<UUID, Map<Integer, Double>> scoreMap = new HashMap<>();
        for (TopicMarkEntry entry : entries) {
            scoreMap.computeIfAbsent(entry.getComponent().getId(), k -> new HashMap<>())
                    .put(entry.getComponentIndex(), entry.getScore());
        }

        // Check every graded slot is non-null and compute weighted sum
        double finalScore = 0.0;
        for (TopicAssessmentComponent comp : gradedComponents) {
            int count = comp.getCount() != null ? comp.getCount() : 0;
            if (count == 0) continue;

            Map<Integer, Double> slotScores = scoreMap.getOrDefault(comp.getId(), Collections.emptyMap());
            double sum = 0.0;
            boolean hasMissing = false;
            for (int idx = 1; idx <= count; idx++) {
                Double score = slotScores.get(idx);
                if (score == null) {
                    hasMissing = true;
                    break;
                }
                sum += score;
            }

            if (hasMissing) {
                mark.setFinalScore(null);
                mark.setIsPassed(false);
                topicMarkRepository.save(mark);
                return;
            }

            double avg = sum / count;
            double weight = comp.getWeight() != null ? comp.getWeight() : 0.0;
            finalScore += avg * (weight / 100.0);
        }

        double rounded = Math.round(finalScore * 100.0) / 100.0;

        // Get minGpaToPass from scheme
        Double minGpa = schemeRepository.findByTopicId(topicId)
                .map(TopicAssessmentScheme::getMinGpaToPass)
                .orElse(null);
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

    private String buildUserFullName(User user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last = user.getLastName() != null ? user.getLastName() : "";
        return (first + " " + last).trim();
    }

    // ── API Methods ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookResponse getGradebook(UUID topicId, UUID trainingClassId) {
        List<TopicAssessmentComponent> components = loadComponents(topicId);

        // Build column definitions
        List<TopicMarkGradebookResponse.Column> columnDefs = new ArrayList<>();
        for (TopicAssessmentComponent comp : components) {
            int count = comp.getCount() != null ? comp.getCount() : 0;
            for (int idx = 1; idx <= count; idx++) {
                columnDefs.add(TopicMarkGradebookResponse.Column.builder()
                        .key(columnKey(comp.getId(), idx))
                        .label(columnLabel(comp, idx))
                        .componentId(comp.getId().toString())
                        .componentIndex(idx)
                        .componentType(comp.getType() != null ? comp.getType().name() : null)
                        .weight(comp.getWeight())
                        .isGraded(comp.getIsGraded())
                        .build());
            }
        }
        columnDefs.add(new TopicMarkGradebookResponse.Column("FINAL_SCORE", "Final Score"));
        columnDefs.add(new TopicMarkGradebookResponse.Column("IS_PASSED", "Passed"));

        // Enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);

        // All entries for this topic-class
        List<TopicMarkEntry> allEntries = topicMarkEntryRepository
                .findByTopicAndClass(topicId, trainingClassId);
        // userId -> "{componentId}_{index}" -> score
        Map<UUID, Map<String, Double>> scoresByUser = new HashMap<>();
        for (TopicMarkEntry entry : allEntries) {
            UUID uid = entry.getUser().getId();
            String key = columnKey(entry.getComponent().getId(), entry.getComponentIndex());
            scoresByUser.computeIfAbsent(uid, k -> new HashMap<>()).put(key, entry.getScore());
        }

        // TopicMark (final score) by user
        Map<UUID, TopicMark> marksByUser = topicMarkRepository
                .findByTopicIdAndTrainingClassId(topicId, trainingClassId)
                .stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m, (a, b) -> b));

        // Build rows
        List<TopicMarkGradebookResponse.Row> rows = enrollments.stream().map(enrollment -> {
            User user = enrollment.getUser();
            Map<String, Object> values = new LinkedHashMap<>();
            Map<String, Double> userScores = scoresByUser.getOrDefault(user.getId(), Collections.emptyMap());

            for (TopicMarkGradebookResponse.Column colDef : columnDefs) {
                String key = colDef.getKey();
                if ("FINAL_SCORE".equals(key) || "IS_PASSED".equals(key)) continue;
                values.put(key, userScores.get(key));
            }
            TopicMark mark = marksByUser.get(user.getId());
            values.put("FINAL_SCORE", mark != null ? mark.getFinalScore() : null);
            values.put("IS_PASSED", mark != null ? mark.getIsPassed() : false);

            return TopicMarkGradebookResponse.Row.builder()
                    .userId(user.getId())
                    .fullName(buildUserFullName(user))
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

        // Sorting
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
                                if (val instanceof Number n) return n.doubleValue();
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

        List<TopicAssessmentComponent> components = loadComponents(topicId);

        // All entries for this student
        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);
        // componentId -> componentIndex -> score
        Map<UUID, Map<Integer, Double>> scoreMap = new HashMap<>();
        for (TopicMarkEntry entry : entries) {
            scoreMap.computeIfAbsent(entry.getComponent().getId(), k -> new HashMap<>())
                    .put(entry.getComponentIndex(), entry.getScore());
        }

        // Build sections (one per component)
        List<TopicMarkDetailResponse.ComponentSection> sections = new ArrayList<>();
        for (TopicAssessmentComponent comp : components) {
            int count = comp.getCount() != null ? comp.getCount() : 0;
            Map<Integer, Double> slotScores = scoreMap.getOrDefault(comp.getId(), Collections.emptyMap());

            List<TopicMarkDetailResponse.SlotScore> slots = new ArrayList<>();
            boolean hasNull = false;
            double sum = 0.0;
            for (int idx = 1; idx <= count; idx++) {
                Double score = slotScores.get(idx);
                slots.add(TopicMarkDetailResponse.SlotScore.builder()
                        .index(idx)
                        .score(score)
                        .build());
                if (score == null) {
                    hasNull = true;
                } else {
                    sum += score;
                }
            }

            Double sectionScore = (!hasNull && count > 0) ? sum / count : null;

            sections.add(TopicMarkDetailResponse.ComponentSection.builder()
                    .componentId(comp.getId().toString())
                    .componentName(comp.getName())
                    .componentType(comp.getType() != null ? comp.getType().name() : null)
                    .weight(comp.getWeight())
                    .isGraded(comp.getIsGraded())
                    .sectionScore(sectionScore)
                    .slots(slots)
                    .build());
        }

        TopicMark mark = topicMarkRepository
                .findByTopicIdAndTrainingClassIdAndUserId(topicId, trainingClassId, userId)
                .orElse(null);

        // History
        List<TopicMarkEntryHistory> historyList = topicMarkEntryHistoryRepository
                .findByTopicAndClassAndUser(topicId, trainingClassId, userId);
        List<TopicMarkDetailResponse.HistoryEntry> history = historyList.stream()
                .map(h -> {
                    TopicMarkEntry entry = h.getTopicMarkEntry();
                    return TopicMarkDetailResponse.HistoryEntry.builder()
                            .componentLabel(columnLabel(entry.getComponent(), entry.getComponentIndex()))
                            .oldScore(h.getOldScore())
                            .newScore(h.getNewScore())
                            .changeType(h.getChangeType() != null ? h.getChangeType().name() : null)
                            .reason(h.getReason())
                            .updatedBy(buildUserFullName(h.getUpdatedBy()))
                            .updatedAt(h.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return TopicMarkDetailResponse.builder()
                .userId(userId)
                .fullName(buildUserFullName(user))
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
            throw new BadRequestException("At least one entry must be provided");
        }

        TopicMark mark = ensureTopicMark(topicId, trainingClassId, userId, topic, trainingClass, user);

        for (UpdateTopicMarkRequest.EntryUpdate update : updates) {
            TopicAssessmentComponent component = componentRepository.findById(update.getComponentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Component not found: " + update.getComponentId()));

            // Validate componentIndex is within range
            int maxIndex = component.getCount() != null ? component.getCount() : 0;
            if (update.getComponentIndex() < 1 || update.getComponentIndex() > maxIndex) {
                throw new BadRequestException("Component index " + update.getComponentIndex()
                        + " is out of range [1-" + maxIndex + "] for component: " + component.getName());
            }

            TopicMarkEntry entry = topicMarkEntryRepository
                    .findByComponentIdAndComponentIndexAndUserIdAndTrainingClassId(
                            update.getComponentId(), update.getComponentIndex(), userId, trainingClassId)
                    .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                            .component(component)
                            .componentIndex(update.getComponentIndex())
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
                log.debug("Updated entry [{}] {} -> {}", columnLabel(component, update.getComponentIndex()),
                        oldScore, newScore);
            }
        }

        tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, mark);
        return getStudentDetail(topicId, trainingClassId, userId);
    }

    @Override
    @Transactional(readOnly = true)
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
                                    .name(buildUserFullName(student))
                                    .build())
                            .column(ScoreHistoryResponse.ColumnRef.builder()
                                    .id(columnKey(entry.getComponent().getId(), entry.getComponentIndex()))
                                    .name(columnLabel(entry.getComponent(), entry.getComponentIndex()))
                                    .build())
                            .oldScore(h.getOldScore())
                            .newScore(h.getNewScore())
                            .changeType(h.getChangeType() != null ? h.getChangeType().name() : null)
                            .reason(h.getReason())
                            .updatedBy(ScoreHistoryResponse.UserRef.builder()
                                    .id(ed.getId())
                                    .name(buildUserFullName(ed))
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

        List<TopicAssessmentComponent> components = loadComponents(topicId);
        int entryCount = 0;
        for (TopicAssessmentComponent comp : components) {
            int count = comp.getCount() != null ? comp.getCount() : 0;
            for (int idx = 1; idx <= count; idx++) {
                int finalIdx = idx;
                topicMarkEntryRepository
                        .findByComponentIdAndComponentIndexAndUserIdAndTrainingClassId(
                                comp.getId(), idx, userId, trainingClassId)
                        .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                .component(comp)
                                .componentIndex(finalIdx)
                                .user(user)
                                .topic(topic)
                                .trainingClass(trainingClass)
                                .score(null)
                                .build()));
                entryCount++;
            }
        }

        tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, mark);
        log.info("Initialized TopicMark + {} entries for user={} topic={} class={}",
                entryCount, userId, topicId, trainingClassId);
    }

    // ── Excel export / import ───────────────────────────────────────────────

    /**
     * Build a flat ordered list of (component, index) pairs for column ordering in Excel.
     * Each element is a simple record-like pair.
     */
    private record ComponentSlot(TopicAssessmentComponent component, int index) {}

    private List<ComponentSlot> buildSlotList(UUID topicId) {
        List<TopicAssessmentComponent> components = loadComponents(topicId);
        List<ComponentSlot> slots = new ArrayList<>();
        for (TopicAssessmentComponent comp : components) {
            int count = comp.getCount() != null ? comp.getCount() : 0;
            for (int idx = 1; idx <= count; idx++) {
                slots.add(new ComponentSlot(comp, idx));
            }
        }
        return slots;
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportGradebookTemplate(UUID topicId, UUID trainingClassId) {
        Topic topic = loadTopic(topicId);
        TrainingClass trainingClass = loadTrainingClass(trainingClassId);
        List<ComponentSlot> slots = buildSlotList(topicId);
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

            // Row 0: hidden meta row with component_index keys
            Row metaRow = sheet.createRow(0);
            metaRow.setHeight((short) 300);
            metaRow.setZeroHeight(true);
            putCell(metaRow, 0, "#META", metaStyle);
            putCell(metaRow, 1, "USER_ID", metaStyle);
            putCell(metaRow, 2, "", metaStyle);
            putCell(metaRow, 3, "", metaStyle);
            for (int i = 0; i < slots.size(); i++) {
                ComponentSlot s = slots.get(i);
                putCell(metaRow, SCORE_COL_START + i,
                        columnKey(s.component().getId(), s.index()), metaStyle);
            }

            // Row 1: header
            Row headerRow = sheet.createRow(1);
            putCell(headerRow, 0, "No.", headerStyle);
            putCell(headerRow, 1, "User ID", headerStyle);
            putCell(headerRow, 2, "Full Name", headerStyle);
            putCell(headerRow, 3, "Email", headerStyle);
            for (int i = 0; i < slots.size(); i++) {
                ComponentSlot s = slots.get(i);
                putCell(headerRow, SCORE_COL_START + i,
                        columnLabel(s.component(), s.index()), headerStyle);
            }

            // Data rows
            int stt = 1;
            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Row row = sheet.createRow(1 + stt);
                putCell(row, 0, stt, lockedStyle);
                putCell(row, 1, student.getId().toString(), lockedStyle);
                putCell(row, 2, buildUserFullName(student), lockedStyle);
                putCell(row, 3, student.getEmail(), lockedStyle);
                for (int i = 0; i < slots.size(); i++) {
                    row.createCell(SCORE_COL_START + i).setCellStyle(inputStyle);
                }
                stt++;
            }

            // Column widths
            sheet.setColumnWidth(0, 1500);
            sheet.setColumnHidden(1, true);
            sheet.setColumnWidth(2, 7000);
            sheet.setColumnWidth(3, 8000);
            for (int i = 0; i < slots.size(); i++) {
                sheet.setColumnWidth(SCORE_COL_START + i, 4500);
            }
            sheet.createFreezePane(0, 2);

            // Note section
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
        List<ComponentSlot> slots = buildSlotList(topicId);
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClassId);

        // All scores indexed: userId -> "componentId_index" -> score
        Map<UUID, Map<String, Double>> scoreMap = new HashMap<>();
        topicMarkEntryRepository.findByTopicAndClass(topicId, trainingClassId).forEach(entry -> {
            if (entry.getScore() != null) {
                scoreMap.computeIfAbsent(entry.getUser().getId(), k -> new HashMap<>())
                        .put(columnKey(entry.getComponent().getId(), entry.getComponentIndex()), entry.getScore());
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
            int finalScoreCol = SCORE_COL_START + slots.size();
            int passedCol = finalScoreCol + 1;

            // Header
            Row headerRow = sheet.createRow(0);
            putCell(headerRow, 0, "No", headerStyle);
            putCell(headerRow, 1, "Full Name", headerStyle);
            putCell(headerRow, 2, "Email", headerStyle);
            for (int i = 0; i < slots.size(); i++) {
                ComponentSlot s = slots.get(i);
                putCell(headerRow, SCORE_COL_START + i, columnLabel(s.component(), s.index()), headerStyle);
            }
            putCell(headerRow, finalScoreCol, "Final Score", headerStyle);
            putCell(headerRow, passedCol, "Passed", headerStyle);

            // Data rows
            int stt = 1;
            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Map<String, Double> studentScores = scoreMap.getOrDefault(student.getId(), Collections.emptyMap());
                TopicMark tm = markMap.get(student.getId());

                Row row = sheet.createRow(stt);
                putCell(row, 0, stt, lockedStyle);
                putCell(row, 1, buildUserFullName(student), lockedStyle);
                putCell(row, 2, student.getEmail(), lockedStyle);

                for (int i = 0; i < slots.size(); i++) {
                    ComponentSlot s = slots.get(i);
                    Double sc = studentScores.get(columnKey(s.component().getId(), s.index()));
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

            // Column widths
            sheet.setColumnWidth(0, 1500);
            sheet.setColumnWidth(1, 7000);
            sheet.setColumnWidth(2, 8000);
            for (int i = 0; i < slots.size(); i++) sheet.setColumnWidth(SCORE_COL_START + i, 4500);
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

            // Parse meta row: colExcelIndex -> "componentId_slotIndex" key
            final int SCORE_COL_START = 4;
            Map<Integer, String> colIndexToKey = new LinkedHashMap<>();
            for (int c = SCORE_COL_START; c <= metaRow.getLastCellNum(); c++) {
                String key = getCellString(metaRow.getCell(c));
                if (key != null && !key.isBlank()) {
                    colIndexToKey.put(c, key.trim());
                }
            }

            if (colIndexToKey.isEmpty()) {
                throw new BadRequestException("Invalid template: no score columns found in meta row.");
            }

            // Build a lookup: "componentId_index" -> TopicAssessmentComponent
            // and validate keys exist
            List<TopicAssessmentComponent> allComponents = loadComponents(topicId);
            Map<UUID, TopicAssessmentComponent> componentById = allComponents.stream()
                    .collect(Collectors.toMap(TopicAssessmentComponent::getId, c -> c, (a, b) -> b));

            // Valid keys set
            Set<String> validKeys = new HashSet<>();
            for (TopicAssessmentComponent comp : allComponents) {
                int count = comp.getCount() != null ? comp.getCount() : 0;
                for (int idx = 1; idx <= count; idx++) {
                    validKeys.add(columnKey(comp.getId(), idx));
                }
            }

            int totalRows = 0, successCount = 0;
            Set<UUID> updatedUserIds = new HashSet<>();

            for (int r = 2; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                int excelRowNum = r + 1;

                String userIdStr = getCellString(row.getCell(1));
                if ((userIdStr == null || userIdStr.isBlank())
                        && !hasAnyScoreInput(row, colIndexToKey.keySet())
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

                for (Map.Entry<Integer, String> mapping : colIndexToKey.entrySet()) {
                    int colIdx = mapping.getKey();
                    String key = mapping.getValue();

                    if (!validKeys.contains(key)) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + key, "Column not found or invalid"));
                        rowHasError = true;
                        continue;
                    }

                    Double score = getCellNumeric(row.getCell(colIdx));
                    if (score == null) continue; // blank cell = skip
                    if (score < 0 || score > 10) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + key,
                                "Score out of range [0-10]: " + score));
                        rowHasError = true;
                        continue;
                    }

                    // Parse componentId and index from key
                    String[] parts = key.split("_");
                    if (parts.length < 2) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + key, "Invalid column key format"));
                        rowHasError = true;
                        continue;
                    }
                    UUID componentId;
                    int componentIndex;
                    try {
                        componentId = UUID.fromString(key.substring(0, key.lastIndexOf('_')));
                        componentIndex = Integer.parseInt(key.substring(key.lastIndexOf('_') + 1));
                    } catch (Exception ex) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + key, "Invalid column key format"));
                        rowHasError = true;
                        continue;
                    }

                    TopicAssessmentComponent component = componentById.get(componentId);
                    if (component == null) {
                        errors.add(new ImportErrorDetail(excelRowNum, "Column " + key, "Component not found"));
                        rowHasError = true;
                        continue;
                    }

                    TopicMarkEntry entry = topicMarkEntryRepository
                            .findByComponentIdAndComponentIndexAndUserIdAndTrainingClassId(
                                    componentId, componentIndex, userId, trainingClassId)
                            .orElseGet(() -> topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                    .component(component)
                                    .componentIndex(componentIndex)
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

            // Recompute final scores for updated students
            for (UUID userId : updatedUserIds) {
                User u = userRepository.findById(userId).orElseThrow();
                TopicMark mark = ensureTopicMark(topicId, trainingClassId, userId, topic, trainingClass, u);
                tryComputeAndSaveFinalScore(topicId, trainingClassId, userId, mark);
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

    // ── POI helpers ─────────────────────────────────────────────────────────

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

    // ── Cell style builders ─────────────────────────────────────────────────

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
