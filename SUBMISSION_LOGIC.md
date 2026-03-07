# Submission Logic – Tài liệu kỹ thuật

## 1. Tổng quan

Submission là module cho phép người dùng **làm bài kiểm tra (Assessment)**. Toàn bộ nội dung bài thi (câu hỏi, đáp án) được **snapshot** tại thời điểm bắt đầu làm bài, đảm bảo rằng dù admin chỉnh sửa câu hỏi sau này, bài thi đang làm vẫn giữ nguyên nội dung cũ.

---

## 2. Sơ đồ quan hệ dữ liệu (Entity Relationship)

```
Assessment
  └── AssessmentQuestion (câu hỏi thuộc bài thi, có score, orderIndex)
        └── AssessmentQuestionOption (đáp án của câu hỏi trong bài thi, có isCorrect)

Submission (bản ghi làm bài của user)
  └── SubmissionQuestion (snapshot câu hỏi tại thời điểm bắt đầu)
        ├── SubmissionQuestionOption (snapshot đáp án, có isCorrect)
        └── SubmissionAnswer (câu trả lời của user)
```

### Chi tiết các bảng

| Bảng | Mô tả | Các trường quan trọng |
|---|---|---|
| `submissions` | Bản ghi làm bài | `assessment_id`, `user_id`, `status`, `started_at`, `submitted_at`, `total_score`, `is_passed`, `attempt_number` |
| `submission_questions` | Snapshot câu hỏi | `submission_id`, `original_question_id`, `content`, `question_type`, `score`, `order_index` |
| `submission_question_options` | Snapshot đáp án | `submission_question_id`, `content`, `is_correct`, `order_index` |
| `submission_answers` | Câu trả lời của user | `submission_id`, `submission_question_id`, `answer_value`, `is_correct`, `score` |

### Trạng thái Submission (`SubmissionStatus`)

| Trạng thái | Ý nghĩa |
|---|---|
| `IN_PROGRESS` | Đang làm bài |
| `SUBMITTED` | Đã nộp bài |

---

## 3. Tại sao cần Snapshot?

> **Vấn đề:** Admin có thể chỉnh sửa nội dung câu hỏi, sửa đáp án, thêm/xóa option bất kỳ lúc nào.
>
> **Giải pháp:** Khi user bắt đầu làm bài, hệ thống **copy toàn bộ** nội dung từ `AssessmentQuestion` → `SubmissionQuestion` và từ `AssessmentQuestionOption` → `SubmissionQuestionOption`.
>
> Sau đó, mọi thao tác (trả lời, chấm điểm, xem kết quả) đều dùng dữ liệu snapshot, **không bao giờ đọc lại từ AssessmentQuestion hay Question gốc.**

```
AssessmentQuestion  ──snapshot──►  SubmissionQuestion
AssessmentQuestionOption ──snapshot──►  SubmissionQuestionOption
```

---

## 4. Luồng hoạt động chi tiết

### 4.1 Bắt đầu làm bài – `POST /api/submissions/start/{assessmentId}`

**Method:** `startSubmission(StartSubmissionRequest)`

```
1. Lấy thông tin user hiện tại từ SecurityContext (JWT)
2. Load Assessment (kèm AssessmentQuestion + AssessmentQuestionOption) từ DB
3. Kiểm tra attempt limit:
   - Đếm số lần user đã làm bài này
   - Nếu đã đạt giới hạn → throw exception
4. Kiểm tra IN_PROGRESS:
   - Nếu user đang có bài làm dở → load full và trả về luôn (không tạo mới)
5. Tạo Submission mới:
   - status = IN_PROGRESS
   - started_at = now()
   - total_score = 0
   - is_passed = false
   - attempt_number = attemptCount + 1
6. Snapshot câu hỏi và đáp án:
   - Lặp qua AssessmentQuestion của Assessment
   - Nếu isShuffleQuestion = true → xáo trộn thứ tự câu hỏi
   - Với mỗi AssessmentQuestion, tạo SubmissionQuestion:
       - originalQuestionId = question.id  (để biết nguồn gốc)
       - content = question.content        (snapshot nội dung)
       - questionType = question.questionType
       - score = assessmentQuestion.score
       - orderIndex = thứ tự (shuffle hoặc gốc)
   - Với mỗi AssessmentQuestionOption của câu hỏi đó, tạo SubmissionQuestionOption:
       - content = option.content
       - isCorrect = option.isCorrect      (snapshot đáp án đúng)
       - orderIndex = option.orderIndex
7. Lưu Submission (cascade → tự lưu SubmissionQuestion + SubmissionQuestionOption)
8. Trả về SubmissionResponse (không hiện isCorrect của options)
```

**Response trả về:**
```json
{
  "submissionId": "uuid",
  "assessmentId": "uuid",
  "assessmentTitle": "...",
  "status": "IN_PROGRESS",
  "startedAt": "2026-03-07T10:00:00",
  "timeLimitMinutes": 60,
  "remainingTimeSeconds": 3600,
  "questions": [
    {
      "id": "uuid",
      "content": "Câu hỏi 1...",
      "questionType": "SINGLE_CHOICE",
      "score": 5.0,
      "orderIndex": 1,
      "options": [
        { "id": "uuid", "content": "A", "orderIndex": 1, "isCorrect": null },
        { "id": "uuid", "content": "B", "orderIndex": 2, "isCorrect": null }
      ]
    }
  ]
}
```

> ⚠️ `isCorrect` luôn là `null` trong lúc làm bài (chỉ hiện khi review/submit).

---

### 4.2 Trả lời câu hỏi – `POST /api/submissions/{submissionId}/answer`

**Method:** `submitAnswer(UUID submissionId, SubmitAnswerRequest)`

```
1. Load submission đầy đủ (questions + answers + options) bằng loadSubmissionFull()
2. Kiểm tra status = IN_PROGRESS (nếu không → throw)
3. Kiểm tra hết giờ:
   - Nếu now() > startedAt + timeLimitMinutes → tự động nộp bài (gọi submitSubmission)
4. Tìm SubmissionQuestion theo submissionQuestionId
5. Upsert SubmissionAnswer:
   - Nếu đã có answer cho câu này → cập nhật answerValue
   - Nếu chưa có → tạo mới
6. Chấm điểm tức thì (gradeAnswer):
   - Parse answerValue thành Set<UUID> (các option ID được chọn)
   - Lấy Set<UUID> correct từ SubmissionQuestionOption (snapshot) có isCorrect = true
   - So sánh: selected == correct → isCorrect = true, score = question.score
   - Ngược lại → isCorrect = false, score = 0
7. Lưu và trả về SubmissionResponse (không hiện isCorrect của options)
```

**Request body:**
```json
{
  "submissionQuestionId": "uuid-cua-submission-question",
  "answerValue": "uuid-option-1,uuid-option-2"
}
```

> 📝 `answerValue` là chuỗi các UUID của option được chọn, phân cách bằng dấu phẩy.
> - SINGLE_CHOICE: 1 UUID
> - MULTIPLE_CHOICE: nhiều UUID → `"uuid1,uuid2,uuid3"`
> - ESSAY: chuỗi text tự do

---

### 4.3 Nộp bài – `POST /api/submissions/{submissionId}/submit`

**Method:** `submitSubmission(UUID submissionId)`

```
1. Load submission đầy đủ
2. Kiểm tra status = IN_PROGRESS
3. Cập nhật:
   - status = SUBMITTED
   - submitted_at = now()
4. Tính điểm tổng (finalizeScore):
   - total_score = SUM(submissionAnswer.score) của tất cả câu hỏi
   - is_passed = total_score >= assessment.passScore
5. Lưu và trả về SubmissionResponse (hiện isCorrect của options)
```

---

### 4.4 Xem kết quả – `GET /api/submissions/{submissionId}/result`

**Method:** `getSubmissionResult(UUID submissionId)`

```
1. Load submission đầy đủ
2. Kiểm tra status ≠ IN_PROGRESS (phải đã nộp)
3. Thống kê:
   - totalQuestions = số câu hỏi
   - correctAnswers = số câu đúng
   - wrongAnswers = số câu sai
   - unansweredQuestions = số câu chưa trả lời
   - maxScore = tổng điểm tối đa
4. Trả về SubmissionResultResponse kèm chi tiết từng câu (có đáp án đúng)
```

**Response:**
```json
{
  "submissionId": "uuid",
  "assessmentTitle": "...",
  "totalQuestions": 20,
  "correctAnswers": 15,
  "wrongAnswers": 4,
  "unansweredQuestions": 1,
  "totalScore": 75.0,
  "maxScore": 100.0,
  "passScore": 60.0,
  "isPassed": true,
  "startedAt": "...",
  "submittedAt": "...",
  "durationSeconds": 1800,
  "questionDetails": [ ... ]
}
```

---

### 4.5 Xem lại bài làm – `GET /api/submissions/{submissionId}/review`

**Method:** `getSubmissionForReview(UUID submissionId)`

```
1. Load submission đầy đủ
2. Trả về SubmissionResponse với showCorrectAnswers = true
   → isCorrect của từng option được hiển thị
   → correctAnswer (UUID chuỗi các option đúng) được trả về
```

---

## 5. Logic kỹ thuật quan trọng

### 5.1 `loadSubmissionFull()` – Tránh MultipleBagFetchException

Hibernate không cho phép fetch nhiều hơn 1 collection kiểu `List` bằng JOIN FETCH trong cùng 1 query. Có 2 nơi gặp vấn đề này:

#### a) Khi load Submission (submitAnswer / submit / result / review)

`SubmissionQuestion` có 2 collection:
- `submissionAnswers` (Set)
- `options` (List)

**Giải pháp:** Tách thành 2 query riêng biệt rồi merge:

```
Query 1: findByIdWithQuestionsAndAnswers
  → Load Submission + SubmissionQuestion + SubmissionAnswer

Query 2: findByIdWithQuestionsAndOptions
  → Load Submission + SubmissionQuestion + SubmissionQuestionOption

Merge: Lấy options từ Query 2 gắn vào SubmissionQuestion đã load ở Query 1
```

#### b) Khi load Assessment để snapshot (startSubmission)

`Assessment.assessmentQuestions` (List) và `AssessmentQuestion.options` (List) cũng không thể JOIN FETCH cùng lúc.

**Giải pháp:** Tách thành 2 query riêng biệt rồi merge:

```
Query 1: findByIdWithQuestions
  → Load Assessment + AssessmentQuestion + Question (không có options)

Query 2: findByIdWithQuestionOptions
  → Load Assessment + AssessmentQuestion + AssessmentQuestionOption

Merge: Lấy options từ Query 2 gắn vào AssessmentQuestion đã load ở Query 1
       → Sau đó snapshot vào SubmissionQuestionOption
```

### 5.2 `gradeAnswer()` – Chấm điểm

```
answerValue = "uuid1,uuid2"
↓
selected = {uuid1, uuid2}

SubmissionQuestionOption có isCorrect=true → correct = {uuid1, uuid2}

selected == correct → isCorrect = true → score = question.score
selected ≠ correct → isCorrect = false → score = 0
```

> ⚠️ **MULTIPLE_CHOICE:** User phải chọn **đúng tất cả** các đáp án đúng, không thừa không thiếu mới được tính điểm.

### 5.3 Xử lý hết giờ (Auto-submit)

Mỗi lần user gửi câu trả lời (`submitAnswer`), hệ thống kiểm tra:

```
isTimeExpired = now() > startedAt + timeLimitMinutes
→ Nếu true → tự động gọi submitSubmission()
```

`remainingTimeSeconds` trong response được tính:
```
remaining = (startedAt + timeLimitMinutes) - now()
→ Nếu ≤ 0 → trả về 0
→ Nếu timeLimitMinutes = null → trả về null (không giới hạn thời gian)
```

---

## 6. Danh sách API

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `POST` | `/api/submissions/start/{assessmentId}` | Bắt đầu làm bài | ✅ Required |
| `POST` | `/api/submissions/{submissionId}/answer` | Lưu câu trả lời | ✅ Required |
| `POST` | `/api/submissions/{submissionId}/submit` | Nộp bài | ✅ Required |
| `GET` | `/api/submissions/{submissionId}/result` | Xem kết quả | ✅ Required |
| `GET` | `/api/submissions/{submissionId}/review` | Xem lại bài làm + đáp án | ✅ Required |

---

## 7. Sơ đồ luồng tổng thể

```
User nhấn "Start Assessment"
        │
        ▼
POST /start/{assessmentId}
        │
        ├─ Đã có IN_PROGRESS? ──► Trả về submission đang làm
        │
        └─ Chưa có
               │
               ▼
        Tạo Submission (IN_PROGRESS)
               │
               ▼
        Snapshot: AssessmentQuestion → SubmissionQuestion
                  AssessmentQuestionOption → SubmissionQuestionOption
               │
               ▼
        Trả về danh sách câu hỏi + options (ẩn isCorrect)

User chọn đáp án
        │
        ▼
POST /answer  ──► Kiểm tra hết giờ? ──► Auto Submit
        │                    Không
        ▼
Lưu SubmissionAnswer + chấm điểm tức thì

User nhấn "Submit"
        │
        ▼
POST /submit
        │
        ▼
status = SUBMITTED, submitted_at = now()
        │
        ▼
finalizeScore: total_score = SUM, is_passed = score >= passScore
        │
        ▼
Trả về kết quả (hiện isCorrect)

User xem kết quả
        │
        ▼
GET /result  →  { totalQuestions, correctAnswers, wrongAnswers, totalScore, isPassed, ... }
GET /review  →  Chi tiết từng câu + đáp án đúng
```

---

## 8. Lưu ý quan trọng

1. **Snapshot là bất biến:** Sau khi `startSubmission`, dữ liệu trong `submission_questions` và `submission_question_options` **không thay đổi** dù admin sửa assessment.

2. **`originalQuestionId`:** Dùng để truy vết nguồn gốc câu hỏi, nhưng **không dùng để lấy dữ liệu** khi làm bài.

3. **`answerValue` format:**
   - `SINGLE_CHOICE`: `"550e8400-e29b-41d4-a716-446655440000"`
   - `MULTIPLE_CHOICE`: `"uuid1,uuid2,uuid3"` (các UUID phân cách bằng dấu phẩy)
   - `ESSAY`: text tự do

4. **Chấm điểm MULTIPLE_CHOICE:** Phải chọn **chính xác tất cả** đáp án đúng (không thừa, không thiếu) mới tính điểm.

5. **`isCorrect` của options** chỉ được trả về trong 2 trường hợp:
   - Sau khi `submit` (nộp bài)
   - Khi gọi `review`
   - Trong lúc làm bài → luôn là `null`
