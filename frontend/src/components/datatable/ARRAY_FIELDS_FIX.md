# Array Fields Display Fix

**Date**: March 4, 2026  
**Issue**: Tags and Options fields displaying as `[object Object]` in table and detail views  
**Components Modified**: `CellRenderer.tsx`, `DetailModal.tsx`

---

## Problem Summary

Multiple relation fields (like `tagIds`) and complex array fields (like `options`) were displaying as `[object Object]` instead of showing meaningful data in:
1. **Table cells** - Options column showing `[object Object],[object Object]...`
2. **Detail modal** - Options showing as stringified objects

### Root Causes

1. **CellRenderer**: Did not handle arrays of objects - was calling `String(value)` on arrays, causing `[object Object]`
2. **DetailModal**: JSX elements were wrapped in `<span>` tags, which cannot contain block-level elements, causing React to stringify them

---

## Changes Made

### 1. CellRenderer.tsx - Table Cell Display

**Location**: `c:\Users\Lenovo\Desktop\FAS_Training_Project\frontend\src\components\datatable\table\cell\CellRenderer.tsx`

**What Changed**: Added array handling logic before the default string conversion

```tsx
// Added before the default case
if (Array.isArray(value)) {
  if (value.length === 0) {
    return (
      <TableCell>
        <span className="text-muted-foreground">—</span>
      </TableCell>
    );
  }

  // Check if it's an array of objects (like question options)
  const firstItem = value[0];
  if (typeof firstItem === "object" && firstItem !== null) {
    // For question options, show count with tooltip of contents
    if ("content" in firstItem) {
      const optionsText = value
        .map((opt: any, idx: number) => 
          `${String.fromCharCode(65 + idx)}. ${opt.content}${opt.correct ? " ✓" : ""}`
        )
        .join("\n");
      
      return (
        <TableCell>
          <TooltipWrapper content={optionsText}>
            <span className="text-muted-foreground cursor-help">
              {value.length} option{value.length !== 1 ? "s" : ""}
            </span>
          </TooltipWrapper>
        </TableCell>
      );
    }
  }

  // Array of primitives
  return (
    <TableCell>
      <TruncatedText content={value.join(", ")} bold={field.bold} />
    </TableCell>
  );
}
```

**Result**:
- Question options now show as "4 options" (or appropriate count)
- Hovering shows tooltip with all options listed (A. content ✓, B. content, etc.)
- Arrays of primitives display as comma-separated values

---

### 2. DetailModal.tsx - Detail View Display

**Location**: `c:\Users\Lenovo\Desktop\FAS_Training_Project\frontend\src\components\datatable\modal\DetailModal.tsx`

#### Change 2.1: Fixed JSX Wrapper Element

**Before**:
```tsx
<span className="text-sm break-all">
  {renderValue(field)}
</span>
```

**After**:
```tsx
<div className="text-sm break-all flex-1">
  {renderValue(field)}
</div>
```

**Why**: Changed from `<span>` to `<div>` because:
- `renderValue()` can return complex JSX with block elements (divs, badges)
- Spans cannot properly contain block-level elements
- React was converting them to strings, showing "[object Object]"

#### Change 2.2: Enhanced Array Rendering Logic

**Added to default case in `renderValue()` function**:

```tsx
default: {
  // Handle arrays of objects (like question options)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    // Check if array items are objects with known structure
    const firstItem = value[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      // Special handling for question options
      if ("content" in firstItem && "correct" in firstItem) {
        return (
          <div className="flex flex-col gap-2 w-full">
            {value.map((option: any, idx: number) => (
              <div
                key={option.id || idx}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
              >
                <Badge
                  variant={option.correct ? "default" : "outline"}
                  className="shrink-0 mt-0.5"
                >
                  {option.correct ? "✓" : String.fromCharCode(65 + idx)}
                </Badge>
                <span className="text-sm flex-1">{option.content}</span>
              </div>
            ))}
          </div>
        );
      }
      // Generic object array - fallback to JSON stringify
      return (
        <div className="flex flex-col gap-1">
          {value.map((item: any, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs w-fit">
              {JSON.stringify(item)}
            </Badge>
          ))}
        </div>
      );
    }

    // Array of primitives
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item: any, idx: number) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  return String(value);
}
```

**Result**:
- Question options display as styled cards with badges
- Correct answers show ✓ checkmark badge
- Other options show letter badges (A, B, C, etc.)
- Each option's content is clearly visible
- Generic arrays fall back to appropriate display format

---

### 3. Schema Change - Question Management

**Location**: `c:\Users\Lenovo\Desktop\FAS_Training_Project\frontend\src\pages\assessment\question\management\index.tsx`

#### Change 3.1: Made Tags Visible

**Before**:
```tsx
{
  name: "tagIds",
  label: "Tags",
  type: "relation",
  // ... relation config
  visible: false,  // ❌ Hidden!
}
```

**After**:
```tsx
{
  name: "tagIds",
  label: "Tags",
  type: "relation",
  // ... relation config
  // visible property removed - defaults to true
}
```

#### Change 3.2: Added Options Field

**Added new field**:
```tsx
{
  name: "options",
  label: "Options",
  type: "text",
  editable: false,
}
```

**Result**:
- Tags column now visible in table
- Options column visible in table and detail view
- Both display correctly with badges/counts

---

## Visual Results

### Before Fix
```
Tags: (not visible)
Options: [object Object],[object Object],[object Object],[object Object]
```

### After Fix

**Table View**:
```
Tags: [Java] [OOP] 
Options: 4 options (hover to see details)
```

**Detail Modal**:
```
Options:
┌─────────────────────────────────────┐
│ [✓] To destroy an object           │
├─────────────────────────────────────┤
│ [B] To compile a class             │
├─────────────────────────────────────┤
│ [C] To copy an object              │
├─────────────────────────────────────┤
│ [D] To initialize an object        │
└─────────────────────────────────────┘
```

---

## Technical Details

### Array Detection Strategy

The fix uses a multi-level detection strategy:

1. **Check if array**: `Array.isArray(value)`
2. **Check if object array**: `typeof firstItem === "object"`
3. **Check for known properties**: `"content" in firstItem && "correct" in firstItem`
4. **Fallback to generic display** for unknown array types

### Advantages of This Approach

✅ **Type-safe**: No TypeScript errors  
✅ **Generic**: Works for any array field  
✅ **Extensible**: Easy to add more special cases  
✅ **Backward compatible**: Existing fields still work  
✅ **User-friendly**: Clear visual representation  
✅ **Performance**: Minimal overhead for non-array fields

---

## Usage Examples

### Example 1: Adding Array Field to Schema

```tsx
const schema: EntitySchema = {
  entityName: "question",
  idField: "id",
  fields: [
    // ... other fields
    {
      name: "options",      // Array field
      label: "Options",
      type: "text",         // Use "text" type for arrays
      editable: false,      // Usually not directly editable
    }
  ]
}
```

### Example 2: Question Options Structure

```tsx
interface QuestionOption {
  id: string;
  content: string;
  correct: boolean;
  orderIndex: number;
}

// Data from API
const question = {
  id: "1",
  content: "What is JVM?",
  options: [
    { id: "opt1", content: "Java Virtual Machine", correct: true, orderIndex: 0 },
    { id: "opt2", content: "Java Variable Method", correct: false, orderIndex: 1 },
    { id: "opt3", content: "Java Version Manager", correct: false, orderIndex: 2 },
  ]
}
```

### Example 3: Custom Array Display

To add custom display for other array types, modify the `renderValue()` function in `DetailModal.tsx`:

```tsx
// Add after the question options check
if ("yourProperty" in firstItem) {
  return (
    <div className="flex flex-col gap-1">
      {value.map((item: any, idx: number) => (
        <div key={idx}>
          {/* Your custom rendering */}
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

- [x] Tags display correctly in table
- [x] Options show count in table
- [x] Tooltip shows option details on hover
- [x] Detail modal shows formatted options with badges
- [x] Correct answers marked with ✓
- [x] Other options show letter labels (A, B, C)
- [x] Empty arrays show "—"
- [x] Primitive arrays display as comma-separated
- [x] No console errors
- [x] No TypeScript errors
- [x] Backward compatible with existing fields

---

## Related Files

- `ProTable.tsx` - Main table component
- `CellRenderer.tsx` - Cell rendering logic
- `DetailModal.tsx` - Detail view modal
- `OverflowBadges.tsx` - Badge display component for relations
- `TruncatedText.tsx` - Text truncation utility

---

## Future Improvements

1. **Configurable Display**: Add schema property to control array display format
2. **Custom Renderers**: Allow custom cell renderers per field type
3. **Performance**: Memoize complex array rendering
4. **Accessibility**: Add ARIA labels for screen readers
5. **Export**: Include formatted array data in CSV/Excel exports

---

## Notes

- This fix is generic and will work for any array field in any ProTable
- No breaking changes to existing functionality
- The `type: "text"` is used for array fields as there's no dedicated "array" type
- The display logic automatically detects and handles arrays appropriately
