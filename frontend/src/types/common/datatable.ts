/**
 * Kiểu dữ liệu của field, quyết định cách hiển thị và nhập liệu:
 * - `"text"`     — chuỗi văn bản thông thường
 * - `"password"` — chuỗi mật khẩu (hiển thị dạng ẩn)
 * - `"number"`   — số nguyên hoặc số thực
 * - `"date"`     — ngày giờ (ISO string), hiển thị theo định dạng VN
 * - `"select"`   — chọn một giá trị từ danh sách `options`
 * - `"boolean"`  — giá trị đúng/sai, hiển thị dạng Toggle Switch
 * - `"relation"` — liên kết đến entity khác, cần cấu hình `relation`
 */
export type FieldType =
  | "text"
  | "password"
  | "number"
  | "date"
  | "select"
  | "boolean"
  | "relation";

/**
 * Kiểu bộ lọc hiển thị trên thanh filter của bảng:
 * - `"text"`        — ô tìm kiếm văn bản tự do
 * - `"select"`      — dropdown chọn một giá trị
 * - `"boolean"`     — toggle Có / Không
 * - `"dateRange"`   — chọn khoảng thời gian (từ ngày – đến ngày)
 * - `"numberRange"` — chọn khoảng số (từ – đến)
 */
export type FilterType = "text" | "select" | "boolean" | "dateRange" | "numberRange";

/**
 * Cấu hình cho một cột (field) trong bảng dữ liệu.
 *
 * @example
 * ```ts
 * {
 *   name: "username",
 *   label: "Tên đăng nhập",
 *   type: "text",
 *   bold: true,
 *   sortable: true,
 * }
 * ```
 */
export interface FieldSchema {
  /** Tên field khớp với key trong object dữ liệu trả về từ API (ví dụ: `"username"`, `"createdAt"`). */
  name: string;

  /** Tiêu đề hiển thị trên header cột của bảng. */
  label: string;

  /** Kiểu dữ liệu của field. Xem {@link FieldType} để biết các giá trị hợp lệ. */
  type: FieldType;

  /** Cho phép sắp xếp theo cột này khi click vào header. Mặc định: `false`. */
  sortable?: boolean;

  /** Cho phép lọc dữ liệu theo cột này. Cần kết hợp với `filterType`. Mặc định: `false`. */
  filterable?: boolean;

  /**
   * Kiểu giao diện bộ lọc cho cột này.
   * Bắt buộc khi `filterable: true`. Xem {@link FilterType}.
   */
  filterType?: FilterType;

  /**
   * Danh sách lựa chọn **tĩnh** cho bộ lọc kiểu `"select"`.
   *
   * **Khi nào cần dùng:**
   * - Field có `type: "text"` hoặc `"number"` lưu giá trị enum từ backend,
   *   nhưng không dùng `type: "select"` vì form đã có custom component riêng.
   *   Đây là cách duy nhất để bộ lọc hiển thị dạng dropdown với nhãn tùy chỉnh.
   * - Muốn override tập options của một `relation` field, ví dụ chỉ filter theo
   *   một tập con thay vì load toàn bộ dữ liệu từ API.
   *
   * **Khi không cần:**
   * - Field `"select"`: dùng `options` — bộ lọc sẽ tự fallback về `options`.
   * - Field `"relation"`: bộ lọc tự build từ `table.relationOptions` (API).
   * - Field `"boolean"`: dùng `booleanLabels`.
   *
   * @example
   * // Field text lưu enum, muốn filter bằng dropdown tĩnh
   * filterType: "select",
   * filterOptions: [{ label: "Hoạt động", value: "ACTIVE" }, { label: "Khóa", value: "INACTIVE" }]
   */
  filterOptions?: { label: string; value: any }[];

  /** Cho phép chỉnh sửa giá trị của cell ngay trong bảng (inline edit hoặc modal). Mặc định: `false`. */
  editable?: boolean;

  /** Hiển thị cột này trong bảng hay không. Mặc định: `true`. */
  visible?: boolean;

  /** Cho phép người dùng ẩn/hiện cột này qua menu Column Toggle. Mặc định: `true`. */
  hideable?: boolean;

  /** Độ rộng cố định của cột (đơn vị: pixel). */
  width?: number;

  /** Độ rộng tối thiểu của cột (đơn vị: pixel), dùng khi cột có thể co giãn. */
  minWidth?: number;

  /**
   * Danh sách lựa chọn dùng cho field kiểu `"select"`.
   * Mỗi phần tử gồm `label` (hiển thị) và `value` (giá trị lưu vào DB).
   *
   * @example
   * options: [{ label: "Nam", value: "MALE" }, { label: "Nữ", value: "FEMALE" }]
   */
  options?: { label: string; value: any }[];

  /**
   * Cấu hình nhãn và màu sắc cho field kiểu `"boolean"`.
   * - `true` / `false`: văn bản tooltip khi Switch bật/tắt.
   * - `trueColor` / `falseColor`: màu CSS tùy chỉnh (hiện chưa áp dụng trực tiếp).
   *
   * @example
   * booleanLabels: { true: "Đang hoạt động", false: "Đã khóa" }
   */
  booleanLabels?: {
    true: string;
    false: string;
    trueColor?: string;
    falseColor?: string;
  };

  /**
   * Cấu hình liên kết đến entity khác cho field kiểu `"relation"`.
   * Xem {@link RelationConfig}.
   */
  relation?: RelationConfig;

  /**
   * Hiển thị giá trị của cell với font **đậm** (`font-bold`).
   * Hữu ích để làm nổi bật các field quan trọng như tên, mã số, v.v.
   * Mặc định: `false`.
   *
   * @example
   * bold: true
   */
  bold?: boolean;
}

export interface EntitySchema {
  entityName: string;
  idField: string;
  fields: FieldSchema[];
}

/**
 * Cấu hình liên kết (relation) đến một entity khác.
 * Dùng cho field có `type: "relation"` để load danh sách lựa chọn từ API.
 *
 * @example
 * ```ts
 * relation: {
 *   api: roleApi,
 *   valueField: "id",
 *   labelField: "name",
 *   multiple: true,
 * }
 * ```
 */
export interface RelationConfig {
  /** API service dùng để fetch danh sách dữ liệu liên kết (ví dụ: `roleApi`, `courseApi`). */
  api: any;

  /** Tên field trong object liên kết dùng làm **giá trị** lưu vào DB (thường là `"id"`). */
  valueField: string;

  /** Tên field trong object liên kết dùng để **hiển thị** ra giao diện (thường là `"name"`). */
  labelField: string;

  /**
   * Cho phép chọn nhiều giá trị (multi-select).
   * - `true`  — hiển thị dạng badge list, lưu mảng id.
   * - `false` — chọn một giá trị, lưu id đơn.
   * Mặc định: `false`.
   */
  multiple?: boolean;
}