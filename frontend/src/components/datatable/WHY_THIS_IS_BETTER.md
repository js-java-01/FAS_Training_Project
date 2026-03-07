# Why Default + Override Pattern is Superior

## The Problem with Forced Props

### ❌ Approach 1: Force All Props

```tsx
interface ProTableProps {
  table: any;
  onEdit: (row: any) => void;      // REQUIRED
  onDelete: (row: any) => void;    // REQUIRED
  onView: (row: any) => void;      // REQUIRED
  onCreate: () => void;            // REQUIRED
}

// Usage: Must provide everything
<ProTable
  table={table}
  onCreate={() => setFormOpen(true)}
  onEdit={(row) => { setEditRow(row); setFormOpen(true); }}
  onDelete={(row) => { setDeleteRow(row); setConfirmOpen(true); }}
  onView={(row) => setDetailRow(row)}
/>
```

**Problems:**
1. ❌ **Boilerplate Hell**: Must write state management for every table
2. ❌ **Code Duplication**: Same modal logic repeated everywhere
3. ❌ **Steep Learning Curve**: Complex even for simple use cases
4. ❌ **Maintenance Nightmare**: Change affects all usages
5. ❌ **Not Beginner-Friendly**: Can't just "use it"

---

## The Problem with Multiple Components

### ❌ Approach 2: Separate Components

```tsx
// ProTableSimple.tsx - For modal CRUD
<ProTableSimple table={table} />

// ProTableComplex.tsx - For routing
<ProTableComplex
  table={table}
  onEdit={(row) => navigate(...)}
/>

// ProTableHybrid.tsx - For mixed
<ProTableHybrid
  table={table}
  customActions={(row) => ...}
/>
```

**Problems:**
1. ❌ **Choice Paralysis**: Which component to use?
2. ❌ **Code Duplication**: Similar code in multiple files
3. ❌ **Hard to Maintain**: Bug fixes need multiple updates
4. ❌ **Import Confusion**: `ProTableSimple` vs `ProTableComplex` vs `ProTableHybrid`
5. ❌ **Feature Drift**: Components diverge over time

---

## ✅ Our Solution: Default + Override Pattern

### The Magic Formula

```tsx
interface ProTableProps<TData> {
  table: any;                                          // REQUIRED
  headerActions?: React.ReactNode;                    // OPTIONAL
  renderRowActions?: (row: TData) => React.ReactNode; // OPTIONAL
  renderFormModal?: (...) => React.ReactNode;         // OPTIONAL
}
```

**Key Insight:**
- If prop is NOT provided → use sensible default
- If prop IS provided → use custom implementation
- No forced decisions, just progressive enhancement

---

## Comparison Table

| Feature | Forced Props | Multiple Components | Default + Override |
|---------|-------------|---------------------|-------------------|
| Zero-config usage | ❌ No | ⚠️ Only SimpleTable | ✅ Yes |
| Custom routing | ✅ Yes | ⚠️ Only ComplexTable | ✅ Yes |
| Mixed modal + custom | ❌ No | ⚠️ Only HybridTable | ✅ Yes |
| Single import | ✅ Yes | ❌ No | ✅ Yes |
| Beginner-friendly | ❌ No | ⚠️ Confusing | ✅ Yes |
| Code duplication | ⚠️ In usage code | ❌ In components | ✅ None |
| Maintenance | ❌ Hard | ❌ Hard | ✅ Easy |
| Type safety | ✅ Yes | ✅ Yes | ✅ Yes |
| Backward compatible | ❌ No | ⚠️ Partial | ✅ Yes |

---

## Real-World Scenarios

### Scenario 1: Junior Dev Building Simple CRUD

**Forced Props:**
```tsx
// Must understand modal state, handlers, submissions
const [formOpen, setFormOpen] = useState(false);
const [editRow, setEditRow] = useState(null);
const [deleteRow, setDeleteRow] = useState(null);
const [detailRow, setDetailRow] = useState(null);

<ProTable
  table={table}
  onCreate={() => setFormOpen(true)}
  onEdit={(row) => { setEditRow(row); setFormOpen(true); }}
  onDelete={(row) => setDeleteRow(row)}
  onView={(row) => setDetailRow(row)}
/>

<FormModal open={formOpen} initial={editRow} ... />
<ConfirmModal open={!!deleteRow} ... />
<DetailModal open={!!detailRow} ... />
```
📝 **Result:** 30+ lines, easy to make mistakes

**Default + Override:**
```tsx
<ProTable table={table} />
```
📝 **Result:** 1 line, just works

---

### Scenario 2: Senior Dev Building Complex System

**Multiple Components:**
```tsx
import { ProTableComplex } from "./ProTableComplex"

<ProTableComplex
  table={table}
  onNavigateCreate={() => navigate("/create")}
  onNavigateEdit={(row) => navigate(`/${row.id}/edit`)}
  onDelete={(row) => { /* still need modal logic */ }}
/>
```
📝 **Result:** Locked into specific component, limited customization

**Default + Override:**
```tsx
<ProTable
  table={table}
  headerActions={<Button onClick={() => navigate("/create")}>Create</Button>}
  renderRowActions={(row) => (
    <>
      <Button onClick={() => navigate(`/${row.id}/edit`)}>Edit</Button>
      <Button onClick={() => navigate(`/${row.id}/clone`)}>Clone</Button>
      <CustomButton onClick={() => custom(row)}>Custom</CustomButton>
    </>
  )}
/>
```
📝 **Result:** Full control, unlimited customization, still simple

---

## Developer Experience

### Forced Props Approach
```tsx
// Step 1: Read docs to understand required props
// Step 2: Set up state management
// Step 3: Write handlers
// Step 4: Connect modals
// Step 5: Test everything
// Time: ~30 minutes for simple table
```

### Default + Override Approach
```tsx
// Step 1: <ProTable table={table} />
// Step 2: Done
// Time: ~30 seconds for simple table

// Later, if needed:
// Step 3: Add headerActions
// Step 4: Add renderRowActions
// Time: ~5 minutes for complex table
```

---

## Extensibility

### Forced Props: Hard to Extend
```tsx
// Want to add "export" action?
// Must modify ProTable interface:
interface ProTableProps {
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onView: (row: any) => void;
  onExport: (row: any) => void;  // ❌ Breaking change
}
```

### Default + Override: Easy to Extend
```tsx
// Want to add "export" action?
<ProTable
  table={table}
  renderRowActions={(row) => (
    <>
      {/* Keep defaults */}
      <EditButton onClick={() => table.openEdit(row)} />
      <DeleteButton onClick={() => table.remove(row.id)} />
      
      {/* Add new */}
      <ExportButton onClick={() => exportRow(row)} />  // ✅ Just add it
    </>
  )}
/>
```

---

## Code Examples Side-by-Side

### Simple CRUD Table

**Forced Props (30 lines):**
```tsx
function TagsPage() {
  const table = useTable({ resource: "tags" });
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  
  const handleCreate = () => setFormOpen(true);
  const handleEdit = (row) => { setEditRow(row); setFormOpen(true); };
  const handleDelete = async () => {
    await table.remove(deleteRow.id);
    setDeleteRow(null);
  };
  
  return (
    <>
      <ProTable
        table={table}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={setDeleteRow}
      />
      <FormModal open={formOpen} initial={editRow} onClose={setFormOpen} />
      <ConfirmModal open={!!deleteRow} onConfirm={handleDelete} />
    </>
  );
}
```

**Default + Override (3 lines):**
```tsx
function TagsPage() {
  const table = useTable({ resource: "tags" });
  
  return <ProTable table={table} />;
}
```

---

## Maintenance

### Adding a Feature

**Forced Props:**
1. Modify ProTable interface (breaking change)
2. Update ProTable implementation
3. Update all existing usages (100+ places)
4. Update documentation
5. Handle backward compatibility

**Default + Override:**
1. Add optional prop
2. Use it where needed
3. Existing code unaffected

---

## Testing

### Forced Props: Must Mock Everything
```tsx
it("renders table", () => {
  render(<ProTable
    table={mockTable}
    onCreate={mockCreate}
    onEdit={mockEdit}
    onDelete={mockDelete}
    onView={mockView}
  />);
});
```

### Default + Override: Minimal Mocking
```tsx
it("renders table", () => {
  render(<ProTable table={mockTable} />);
  // Modals tested separately
});
```

---

## Conclusion

### Why Default + Override Wins

1. **Simplicity First**
   - Simple use cases are simple
   - Complex use cases are possible
   - No forced complexity

2. **Progressive Enhancement**
   - Start with zero config
   - Add features as needed
   - Never refactor the entire component

3. **Single Responsibility**
   - ProTable displays data
   - CRUD logic is composable
   - Business logic stays in pages

4. **Maintainability**
   - One component to maintain
   - Optional features don't break defaults
   - Backward compatible by nature

5. **Developer Experience**
   - Intuitive API
   - No surprises
   - Scales with skill level

### The Bottom Line

```
Forced Props:      Complex → Complex
Multiple Components: Simple → Medium → Complex
Default + Override:  Simple → Simple/Medium/Complex
```

**Default + Override is the only pattern that keeps simple things simple while making complex things possible.**

---

## Testimonials (Hypothetical)

> "I went from 500 lines of table code to 50 lines. This is amazing."
> — Junior Developer

> "Finally, a table component that doesn't fight me when I need custom logic."
> — Senior Developer

> "We have 100+ tables in our app. This saved us months of refactoring."
> — Tech Lead

> "The best table component architecture I've ever seen."
> — Enterprise Architect
