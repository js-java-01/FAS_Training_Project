# ProTable Architecture: Default + Override Pattern

## Philosophy

**Sensible Defaults + Optional Overrides**

> "Simple things should be simple. Complex things should be possible."

ProTable follows the **Default + Override Pattern**: it provides a fully functional modal CRUD system out of the box, but allows you to override any part when needed.

---

## Core Principles

### 1. Zero Config for Simple Cases
```tsx
// This just works:
<ProTable table={table} />
```
- ✅ Create button appears automatically
- ✅ Edit/Delete actions work out of the box
- ✅ Form modal handles create/edit
- ✅ Delete confirmation included
- ✅ Detail view modal included

### 2. Granular Overrides for Complex Cases
```tsx
<ProTable
  table={table}
  headerActions={<CustomButton />}      // Override create button
  renderRowActions={(row) => <Custom />} // Override row actions
  renderFormModal={(ctx) => <Custom />}  // Override form modal
/>
```

### 3. No Prop Explosion
Instead of:
```tsx
// ❌ Bad: Too many props
<ProTable
  onCreateClick={...}
  onEditClick={...}
  onDeleteClick={...}
  onViewClick={...}
  showCreateButton={true}
  showEditButton={true}
  createButtonText="..."
  editButtonText="..."
/>
```

We use:
```tsx
// ✅ Good: Render props
<ProTable
  headerActions={<Custom />}
  renderRowActions={(row) => <Custom />}
/>
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   ProTable                       │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Toolbar                                   │ │
│  │  ├─ Default: Create Button                │ │
│  │  └─ Override: props.headerActions         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Table Body                                │ │
│  │  ├─ Default: View/Edit/Delete Actions     │ │
│  │  └─ Override: props.renderRowActions      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Modals (Internal State)                  │ │
│  │  ├─ FormModal (create/edit)               │ │
│  │  │  └─ Override: props.renderFormModal    │ │
│  │  ├─ ConfirmDeleteModal                    │ │
│  │  └─ DetailModal                           │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## TypeScript Interface

```tsx
interface ProTableProps<TData = any> {
  /** Required: Table instance from useTable hook */
  table: any;
  
  /** Optional: Override default create button */
  headerActions?: React.ReactNode;
  
  /** Optional: Override default row actions */
  renderRowActions?: (row: TData) => React.ReactNode;
  
  /** Optional: Override default form modal */
  renderFormModal?: (props: {
    open: boolean;
    onClose: (open: boolean) => void;
    schema: any;
    initial: TData | null;
    onSubmit: (data: any) => void;
  }) => React.ReactNode;
  
  /** Optional: Handle row click */
  onRowClick?: (row: TData) => void;
  
  /** Optional: Hide actions completely */
  hideActions?: boolean;
  
  /** Optional: Auto page size */
  autoPageSize?: boolean;
  rowHeight?: number;
}
```

---

## Decision Tree

```
Need a table?
│
├─ Simple entity (Tags, Categories)?
│  └─ Use: <ProTable table={table} />
│     Result: Zero config, modal CRUD works
│
├─ Need custom create button?
│  └─ Use: <ProTable table={table} headerActions={...} />
│     Result: Custom header, default row actions still work
│
├─ Need page-based routing?
│  └─ Use: <ProTable 
│           table={table}
│           headerActions={...}
│           renderRowActions={...}
│         />
│     Result: Full control over navigation
│
├─ Need custom actions + modal CRUD?
│  └─ Use: <ProTable
│           table={table}
│           renderRowActions={(row) => (
│             <>
│               <EditButton onClick={() => table.openEdit(row)} />
│               <CustomButton onClick={() => custom(row)} />
│             </>
│           )}
│         />
│     Result: Mix default modal with custom logic
│
└─ Need custom form UI?
   └─ Use: <ProTable
             table={table}
             renderFormModal={...}
           />
      Result: Custom form, default actions still work
```

---

## Benefits Over Alternatives

### ❌ Alternative 1: Force All Props
```tsx
<ProTable
  table={table}
  onEdit={(row) => navigate(...)}
  onDelete={(row) => handleDelete(row)}
  onView={(row) => setDetail(row)}
  showCreateButton={true}
  onCreateClick={() => navigate(...)}
/>
```

**Problems:**
- Must provide ALL handlers even for simple cases
- No default behavior
- Prop explosion
- Complex for beginners

### ❌ Alternative 2: Multiple Components
```tsx
<ProTable table={table} />           // Simple
<ProTableWithRouting table={table} /> // Complex
<ProTableCustom table={table} />      // Hybrid
```

**Problems:**
- Which one to use?
- Code duplication
- Hard to maintain
- Confusing API

### ✅ Our Solution: Default + Override
```tsx
// Simple
<ProTable table={table} />

// Complex
<ProTable table={table} renderRowActions={...} />

// Hybrid
<ProTable table={table} renderRowActions={(row) => (
  <>
    <DefaultButton onClick={() => table.openEdit(row)} />
    <CustomButton onClick={() => custom(row)} />
  </>
)} />
```

**Benefits:**
- ✅ One component
- ✅ Progressive complexity
- ✅ Backward compatible
- ✅ Intuitive API
- ✅ No duplication

---

## Implementation Details

### Internal Modal State
```tsx
// ProTable maintains its own state
const [deleteItem, setDeleteItem] = useState<TData | null>(null);
const [detailRow, setDetailRow] = useState<TData | null>(null);
```

This state is used by default actions. When you override `renderRowActions`, you can choose to:
1. **Use internal state** (hybrid approach)
2. **Use your own state** (full control)
3. **Ignore modals entirely** (routing-based)

### Default Behavior
```tsx
// If renderRowActions is NOT provided:
const defaultRenderRowActions = (row: TData) => (
  <RowActions
    row={row}
    onView={setDetailRow}
    onEdit={table.openEdit}
    onDelete={setDeleteItem}
  />
);

// Use provided or default
const finalRenderRowActions = renderRowActions || defaultRenderRowActions;
```

### Conditional Rendering
```tsx
// Actions column only shown if not hidden
{showActionsColumn && (
  <TableCell>
    {finalRenderRowActions(row)}
  </TableCell>
)}
```

---

## Migration Guide

### From Old ProTable (Forced Props)
```tsx
// Before
<ProTable
  table={table}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

```tsx
// After (if you want modals)
<ProTable table={table} />

// After (if you want custom)
<ProTable
  table={table}
  renderRowActions={(row) => (
    <>
      <EditButton onClick={() => handleEdit(row)} />
      <DeleteButton onClick={() => handleDelete(row)} />
    </>
  )}
/>
```

### From Separate Components
```tsx
// Before
import { ProTableSimple } from "./ProTableSimple"
import { ProTableComplex } from "./ProTableComplex"

<ProTableSimple table={table} />  // For tags
<ProTableComplex table={table} /> // For questions
```

```tsx
// After
import { ProTable } from "./ProTable"

<ProTable table={table} />  // For tags (uses defaults)

<ProTable                   // For questions (overrides)
  table={table}
  headerActions={...}
  renderRowActions={...}
/>
```

---

## Best Practices

### 1. Start Simple
```tsx
// Always start with zero config
<ProTable table={table} />
```

### 2. Add Overrides as Needed
```tsx
// Add custom header when needed
<ProTable
  table={table}
  headerActions={<CustomButton />}
/>
```

### 3. Keep Defaults When Possible
```tsx
// Mix defaults with custom
renderRowActions={(row) => (
  <>
    {/* Use table.openEdit for modal */}
    <EditButton onClick={() => table.openEdit(row)} />
    
    {/* Add custom action */}
    <ExportButton onClick={() => exportRow(row)} />
  </>
)}
```

### 4. Don't Over-Override
```tsx
// ❌ Bad: Override everything unnecessarily
<ProTable
  table={table}
  headerActions={<Button>Create</Button>}
  renderRowActions={(row) => <StandardActions />}
  renderFormModal={(ctx) => <FormModal {...ctx} />}
/>

// ✅ Good: Use defaults
<ProTable table={table} />
```

---

## Summary

| Scenario | Solution | Code |
|----------|----------|------|
| Simple entity | Use defaults | `<ProTable table={table} />` |
| Custom header | Override headerActions | `<ProTable headerActions={...} />` |
| Routing-based | Override both | `<ProTable headerActions={...} renderRowActions={...} />` |
| Hybrid | Mix defaults with custom | `renderRowActions={(r) => <>{default}{custom}</>}` |
| Display-only | Hide actions | `<ProTable hideActions={true} />` |

**Remember:**
- 🎯 Defaults handle 80% of cases
- 🔧 Overrides handle the other 20%
- 🚀 No complexity until you need it
- 📈 Scales from simple to enterprise
