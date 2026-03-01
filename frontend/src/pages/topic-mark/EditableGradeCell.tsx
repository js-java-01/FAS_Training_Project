import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useUpdateGrade } from "@/pages/topic-mark/services/mutations"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  value: number | null
  courseClassId: string
  userId: string
  columnId: string
}

export function EditableGradeCell({
  value,
  courseClassId,
  userId,
  columnId,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState<string>(
    value !== null ? value.toFixed(1) : ""
  )
  const [status, setStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)

  const { mutate } = useUpdateGrade()

  useEffect(() => {
    if (value !== null) {
      setLocalValue(value.toFixed(1))
    } else {
      setLocalValue("")
    }
  }, [value])

  // ==============================
  // VALIDATE
  // ==============================
  const validateScore = (val: number) => {
    if (isNaN(val)) return "Score must be a number"
    if (val < 0) return "Minimum score is 0"
    if (val > 10) return "Maximum score is 10"
    return null
  }

  // ==============================
  // HANDLE CHANGE (live validation)
  // ==============================
  const handleChange = (input: string) => {
    // Không cho nhập ký tự lạ (chỉ số và dấu chấm)
    if (!/^\d*\.?\d*$/.test(input)) return

    // Không cho quá 2 số thập phân
    if (input.includes(".")) {
      const decimal = input.split(".")[1]
      if (decimal.length > 2) return
    }

    setLocalValue(input)

    const num = Number(input)
    if (input === "") {
      setError(null)
      return
    }

    const validationError = validateScore(num)
    setError(validationError)
  }

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = () => {
    if (localValue === "") {
      setEditing(false)
      return
    }

    const numericValue = Number(localValue)
    const validationError = validateScore(numericValue)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setStatus("saving")

    mutate(
      {
        courseClassId,
        userId,
        columnId,
        score: numericValue,
        reason: "Manual update",
      },
      {
        onSuccess: () => {
          setStatus("success")
          setTimeout(() => setStatus("idle"), 800)
        },
        onError: () => {
          setStatus("error")
        },
      }
    )

    setEditing(false)
  }

  // ==============================
  // READ MODE
  // ==============================
  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={`
          cursor-pointer px-2 py-1 rounded text-center transition
          ${status === "saving" ? "opacity-50" : ""}
          ${status === "success" ? "bg-green-100" : ""}
          ${status === "error" ? "bg-red-100" : ""}
        `}
      >
        {value !== null ? value.toFixed(1) : "-"}
      </div>
    )
  }

  // ==============================
  // EDIT MODE
  // ==============================
  return (
    <Tooltip open={!!error}>
      <TooltipTrigger asChild>
        <Input
          type="text"
          autoFocus
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit()
            if (e.key === "Escape") {
              setError(null)
              setEditing(false)
            }
          }}
          className={`
            h-8 w-20 text-center
            ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
          `}
        />
      </TooltipTrigger>

      {error && (
        <TooltipContent side="top">
          <p className="text-xs">{error}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
