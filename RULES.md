
# Git Commit Convention / Branch Naming Convention

Tài liệu này mô tả **quy ước viết commit message** nhằm giúp lịch sử Git rõ ràng, dễ đọc, dễ tra cứu và hỗ trợ tốt cho code review, CI/CD, và quản lý phiên bản.

---

## Mục tiêu

- Commit message **ngắn gọn – rõ nghĩa – thống nhất**
- Dễ hiểu cho cả team (kể cả người mới)
- Dễ tự động hoá (generate changelog, semantic versioning)

---

## Cấu trúc commit message

<type>(<scope>): <subject>

<body>

<footer>
```

### Ví dụ

```
feat(auth): add refresh token mechanism

Implement refresh token with DB storage and revoke support.

Closes #21
```

---

## Type (bắt buộc)

| Type       | Ý nghĩa                                               |
| ---------- | ----------------------------------------------------- |
| `feat`     | Thêm tính năng mới                                    |
| `fix`      | Sửa bug                                               |
| `refactor` | Tái cấu trúc code, không thêm tính năng/không fix bug |
| `perf`     | Cải thiện hiệu năng                                   |
| `docs`     | Chỉ thay đổi tài liệu                                 |
| `style`    | Format code (indent, dấu cách, không ảnh hưởng logic) |
| `test`     | Thêm hoặc sửa test                                    |
| `chore`    | Công việc lặt vặt (build, config, deps, CI/CD)        |
| `build`    | Thay đổi build system hoặc dependencies               |
| `ci`       | Thay đổi cấu hình CI                                  |
| `revert`   | Revert commit trước                                   |

---

## Scope

Scope dùng để chỉ **phạm vi ảnh hưởng** của commit.

Ví dụ:

* `auth`
* `user`
* `payment`
* `ui`
* `api`
* `docker`

```
fix(user): handle null pointer in profile API
```

---

## Subject (bắt buộc)

Quy tắc:

* Viết **tiếng Anh**
* Thì hiện tại (imperative)
* Không viết hoa chữ cái đầu
* Không có dấu chấm cuối câu
* Tối đa **50 ký tự**

Đúng:

```
feat(blog): add comment feature
```

Sai:

```
Added new comment feature.
```

---

## Body (tuỳ chọn)

Dùng khi commit **phức tạp**.

* Giải thích **WHY** hơn là HOW
* Mỗi dòng tối đa 72 ký tự

Ví dụ:

```
refactor(auth): simplify jwt validation

Remove duplicated logic and centralize token validation
in JwtAuthenticationFilter.
```

---

## Footer (tuỳ chọn)

Dùng để:

* Link issue / ticket
* Breaking change

### Link issue

```
Closes #123
Refs JIRA-456
```

### Breaking change

```
BREAKING CHANGE: change login API response format
```

---

## Breaking Change

Nếu commit làm **vỡ backward compatibility**:

* Thêm `!` sau type
* Hoặc dùng footer `BREAKING CHANGE`

Ví dụ:

```
feat(auth)!: change token response structure
```

---

## Revert commit

```
revert: feat(auth): add refresh token
```

---

## Một số ví dụ chuẩn

```
feat(user): add user profile endpoint
fix(order): prevent duplicate order creation
refactor(payment): split payment service
chore(deps): update spring boot to 3.2.1
docs(readme): update commit convention
```

---

## Khuyến nghị công cụ

* **commitlint**: kiểm tra commit message
* **husky**: chạy hook trước khi commit
* **semantic-release**: tự động release

---

## Quy ước chung cho team

* 1 commit = 1 mục đích
* Không commit code lỗi
* Không commit file không liên quan
* Luôn review commit message trước khi push

---

## Tham khảo

* [https://www.conventionalcommits.org](https://www.conventionalcommits.org)
* [https://semantic-release.gitbook.io](https://semantic-release.gitbook.io)

---

## Branch Name Convention

Quy ước đặt tên branch giúp team dễ hiểu mục đích làm việc, hỗ trợ review, CI/CD và quản lý release hiệu quả.

---

## Cấu trúc branch name

```
<Group No.> - <First Name + LastName (in short)>
<Group No.> - <develop>
```

---

## Quy tắc đặt tên

* Viết **chữ thường**
* Dùng **kebab-case** (`-`) để phân tách từ
* Không dùng tiếng Việt có dấu
* Không dùng ký tự đặc biệt (`@`, `#`, `%`, ...)
* Tên ngắn gọn nhưng **mô tả đúng mục đích**

---

## Ví dụ chuẩn

```
G1-ThienTN
G3-HuongDS
```

```
```
