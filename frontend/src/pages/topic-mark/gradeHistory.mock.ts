export interface GradeHistoryItem {
  id: string
  student: {
    id: string
    name: string
  }
  column: {
    id: string
    name: string
  }
  oldScore: number
  newScore: number
  changeType: "INCREASE" | "DECREASE"
  reason: string
  updatedBy: {
    id: string
    name: string
  }
  updatedAt: string
}

const students = [
  { id: "s1", name: "Nguyen Van A" },
  { id: "s2", name: "Tran Thi B" },
  { id: "s3", name: "Le Minh C" },
]

const columns = [
  { id: "c1", name: "Quiz 1" },
  { id: "c2", name: "Assignment 1" },
  { id: "c3", name: "Final Exam" },
]

function randomDate() {
  const start = new Date(2026, 0, 1).getTime()
  const end = new Date().getTime()
  return new Date(start + Math.random() * (end - start)).toISOString()
}

const ALL_DATA: GradeHistoryItem[] = Array.from(
  { length: 120 },
  (_, i) => {
    const oldScore = Math.floor(Math.random() * 10)
    const newScore = Math.floor(Math.random() * 10)

    return {
      id: `history-${i}`,
      student:
        students[Math.floor(Math.random() * students.length)],
      column:
        columns[Math.floor(Math.random() * columns.length)],
      oldScore,
      newScore,
      changeType:
        newScore > oldScore ? "INCREASE" : "DECREASE",
      reason: "Manual adjustment by trainer",
      updatedBy: {
        id: "t1",
        name: "Trainer Admin",
      },
      updatedAt: randomDate(),
    }
  }
)

export async function mockGetGradeHistory(params: {
  page: number
  size: number
  studentName?: string
  status?: "INCREASE" | "DECREASE"
  fromDate?: string
  toDate?: string
  sort?: string
}) {
  await new Promise((r) => setTimeout(r, 600)) // simulate network

  let result = [...ALL_DATA]

  if (params.studentName) {
    result = result.filter((r) =>
      r.student.name
        .toLowerCase()
        .includes(params.studentName!.toLowerCase())
    )
  }

  if (params.status) {
    result = result.filter(
      (r) => r.changeType === params.status
    )
  }

  if (params.fromDate) {
    result = result.filter(
      (r) =>
        new Date(r.updatedAt) >=
        new Date(params.fromDate!)
    )
  }

  if (params.toDate) {
    result = result.filter(
      (r) =>
        new Date(r.updatedAt) <=
        new Date(params.toDate!)
    )
  }

  if (params.sort?.includes("asc")) {
    result.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() -
        new Date(b.updatedAt).getTime()
    )
  } else {
    result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    )
  }

  const start = params.page * params.size
  const end = start + params.size
  const paged = result.slice(start, end)

  return {
    content: paged,
    page: params.page,
    size: params.size,
    totalElements: result.length,
    totalPages: Math.ceil(result.length / params.size),
    last: end >= result.length,
  }
}
