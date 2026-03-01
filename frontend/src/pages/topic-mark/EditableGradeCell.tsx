import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useUpdateGrade } from "@/pages/topic-mark/services/mutations"

interface Props {
  value: number | string | null
  courseClassId: string
  userId: string
  columnId: string
  isTableEditing: boolean
}

export function EditableGradeCell({
  value,
  courseClassId,
  userId,
  columnId,
  isTableEditing
}: Props) {
  const normalize = (val: number | string | null) => {
    if (val === null || val === undefined) return ""
    const num = Number(val)
    if (isNaN(num)) return ""
    return num.toFixed(1)
  }

  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [localValue, setLocalValue] = useState(normalize(value))
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const reasonRef = useRef<HTMLTextAreaElement | null>(null)
  const { mutate } = useUpdateGrade()

  // Sync DB value khi không ở trạng thái edit/confirm
  useEffect(() => {
    if (!editing && !confirming) {
      setLocalValue(normalize(value))
    }
  }, [value])

  // Focus textarea khi mở confirm
  useEffect(() => {
    if (confirming) {
      setTimeout(() => reasonRef.current?.focus(), 50)
    }
  }, [confirming])

  const validateScore = (val: number) => {
    if (isNaN(val)) return "Score must be a number"
    if (val < 0) return "Minimum score is 0"
    if (val > 10) return "Maximum score is 10"
    return null
  }

  const handleChange = (input: string) => {
    if (!/^\d*\.?\d*$/.test(input)) return

    if (input.includes(".")) {
      const decimal = input.split(".")[1]
      if (decimal.length > 2) return
    }

    setLocalValue(input)

    if (input === "") {
      setError(null)
      return
    }

    setError(validateScore(Number(input)))
  }

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

    const oldValue = normalize(value)
    const newValue = numericValue.toFixed(1)

    // Không đổi → thoát luôn, không confirm, không gọi API
    if (oldValue === newValue) {
      setEditing(false)
      setLocalValue(oldValue)
      return
    }

    // Có đổi → mở confirm
    setEditing(false)
    setConfirming(true)
  }

  const handleConfirm = () => {
    if (!reason.trim()) return

    setStatus("saving")

    mutate(
      {
        courseClassId,
        userId,
        columnId,
        score: Number(localValue),
        reason,
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

    resetState()
  }

  const handleCancel = () => {
    resetState()
  }

  const resetState = () => {
    setConfirming(false)
    setReason("")
    setLocalValue(normalize(value))
  }

  // Khi đang confirm thì hiển thị pending value
  const displayValue =
    confirming ? localValue || "-" : normalize(value) || "-"

  return (
    <Popover open={confirming}>
      <PopoverTrigger asChild>
        {editing ? (
          <Tooltip open={!!error}>
            <TooltipTrigger asChild>
              <Input
                type="text"
                autoFocus
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                  if (e.key === "Escape") {
                    setEditing(false)
                    setError(null)
                    setLocalValue(normalize(value))
                  }
                }}
                className={`text-center ${
                  error ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
            </TooltipTrigger>

            {error && (
              <TooltipContent side="top">
                <p className="text-xs">{error}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ) : (
          <div
            onClick={() => {
              setLocalValue(normalize(value))
              setEditing(true)
            }}
            className={`
              cursor-pointer px-2 py-1 rounded text-center transition
              ${status === "saving" ? "opacity-50" : ""}
              ${status === "success" ? "bg-green-100" : ""}
              ${status === "error" ? "bg-red-100" : ""}
              ${
                 confirming
                   ? "bg-yellow-50 ring-1 ring-yellow-300 shadow-sm"
                   : ""
               }
               ${
               isTableEditing
                    ? "bg-gray-50 border border-gray-300 shadow-sm"
                    : ""
                }
            `}
          >
            {displayValue}
          </div>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-72 space-y-2"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-sm font-medium">
          Confirm score change
        </div>

        <div className="text-xs text-muted-foreground">
          Old:{" "}
          <span className="line-through">{normalize(value)}</span> →{" "}
           New:{" "}
          <span className="font-bold">{localValue}</span>
        </div>

        <Textarea
          ref={reasonRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="min-h-[80px]"
        />

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
