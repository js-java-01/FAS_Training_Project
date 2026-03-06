# ProTable Quick Reference

## TL;DR

```tsx
// Simple entity → Zero config
<ProTable table={table} />

// Complex entity → Override what you need
<ProTable
  table={table}
  headerActions={<CustomButton />}
  renderRowActions={(row) => <CustomActions />}
/>
```

---

## Common Patterns

### 1. Zero Config (90% of cases)
```tsx
<ProTable table={table} />
```
✅ Create button ✅ Edit modal ✅ Delete modal ✅ Detail view

---

### 2. Custom Create Button
```tsx
<ProTable
  table={table}
  headerActions={
    <Button onClick={() => table.openEdit(null)}>
      Custom Create
    </Button>
  }
/>
```

---

### 3. Navigate to Create/Edit Pages
```tsx
<ProTable
  table={table}
  headerActions={
    <Button onClick={() => navigate("/items/create")}>
      Create
    </Button>
  }
  renderRowActions={(row) => (
    <>
      <Button onClick={() => navigate(`/items/${row.id}`)}>View</Button>
      <Button onClick={() => navigate(`/items/${row.id}/edit`)}>Edit</Button>
      <Button onClick={() => handleDelete(row)}>Delete</Button>
    </>
  )}
/>
```

---

### 4. Mix Default with Custom Actions
```tsx
<ProTable
  table={table}
  renderRowActions={(row) => (
    <>
      {/* Use default modal */}
      <EditButton onClick={() => table.openEdit(row)} />
      
      {/* Add custom action */}
      <ExportButton onClick={() => exportRow(row)} />
      
      {/* Use default modal */}
      <DeleteButton onClick={() => handleDelete(row)} />
    </>
  )}
/>
```

---

### 5. Custom Form Modal
```tsx
<ProTable
  table={table}
  renderFormModal={({ open, onClose, initial, onSubmit }) => (
    <MyCustomModal
      open={open}
      onClose={onClose}
      data={initial}
      onSubmit={onSubmit}
    />
  )}
/>
```

---

### 6. Read-Only Table
```tsx
<ProTable
  table={table}
  hideActions={true}
  headerActions={<ExportButton />}
/>
```

---

## Props Reference

```tsx
interface ProTableProps<TData> {
  // REQUIRED
  table: any;  // From useTable hook
  
  // OPTIONAL
  headerActions?: ReactNode;              // Override create button
  renderRowActions?: (row: TData) => JSX; // Override edit/delete
  renderFormModal?: (ctx) => JSX;         // Override form modal
  onRowClick?: (row: TData) => void;      // Handle row click
  hideActions?: boolean;                  // Hide actions column
  autoPageSize?: boolean;                 // Auto calculate page size
  rowHeight?: number;                     // For auto page size calc
}
```

---

## Decision Flow

```
┌─ Need table? ─────────────────────────────────────────┐
│                                                        │
│  Simple CRUD (Tags, Categories)?                      │
│  └─→ <ProTable table={table} />                       │
│                                                        │
│  Custom create button?                                │
│  └─→ <ProTable headerActions={...} />                 │
│                                                        │
│  Page-based editing?                                  │
│  └─→ <ProTable renderRowActions={...} />              │
│                                                        │
│  Mix modal + custom?                                  │
│  └─→ <ProTable renderRowActions={(row) => (           │
│        <>{modal}{custom}</>                           │
│      )} />                                            │
│                                                        │
│  No actions at all?                                   │
│  └─→ <ProTable hideActions={true} />                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## What You Get by Default

| Feature | Included? | How to Override |
|---------|-----------|----------------|
| Create button | ✅ Yes | `headerActions` prop |
| Edit action | ✅ Yes | `renderRowActions` prop |
| Delete action | ✅ Yes | `renderRowActions` prop |
| View detail | ✅ Yes | `renderRowActions` prop |
| Form modal | ✅ Yes | `renderFormModal` prop |
| Delete confirm | ✅ Yes | Use custom delete handler |
| Detail modal | ✅ Yes | Use custom view handler |
| Pagination | ✅ Yes | Configure via `table` |
| Sorting | ✅ Yes | Built-in |
| Filtering | ✅ Yes | Built-in |
| Search | ✅ Yes | Built-in |

---

## Common Mistakes

### ❌ Don't Do This
```tsx
// Unnecessary override
<ProTable
  table={table}
  renderRowActions={(row) => (
    <RowActions
      row={row}
      onEdit={table.openEdit}
      onDelete={handleDelete}
    />
  )}
/>
```

### ✅ Do This Instead
```tsx
// Use defaults
<ProTable table={table} />
```

---

### ❌ Don't Do This
```tsx
// Override everything unnecessarily
<ProTable
  table={table}
  headerActions={<Button>Create</Button>}
  renderRowActions={(row) => <StandardActions />}
  renderFormModal={(ctx) => <FormModal {...ctx} />}
/>
```

### ✅ Do This Instead
```tsx
// Use defaults when possible
<ProTable table={table} />
```

---

## FAQs

**Q: Do I need to provide handlers for edit/delete?**
A: No! ProTable handles it automatically.

**Q: Can I mix modal and routing?**
A: Yes! Override only what you need.

**Q: Will my existing code break?**
A: No, it's backward compatible if you use the old pattern.

**Q: How do I hide the actions column?**
A: Use `hideActions={true}` prop.

**Q: Can I customize just the create button?**
A: Yes! Use `headerActions` prop.

**Q: How do I add a custom action?**
A: Use `renderRowActions` and include both default and custom actions.

---

## Cheat Sheet

| Want to... | Code |
|------------|------|
| Just use it | `<ProTable table={table} />` |
| Custom create button | `headerActions={<Button />}` |
| Navigate to pages | `renderRowActions={(r) => <NavButtons />}` |
| Add custom action | `renderRowActions={(r) => <><Default /><Custom /></>}` |
| Hide all actions | `hideActions={true}` |
| Custom form | `renderFormModal={(ctx) => <MyForm />}` |
| Handle row click | `onRowClick={(row) => ...}` |

---

## Real-World Examples

See the `examples/` directory:
- `1-SimpleEntityExamples.tsx` - Zero config, custom header, read-only
- `2-ComplexEntityExamples.tsx` - Routing, fully custom
- `3-HybridApproachExamples.tsx` - Mix modal with custom actions

---

## Summary

✅ **Simple by default**
✅ **Override when needed**
✅ **No prop explosion**
✅ **Type-safe**
✅ **Enterprise-ready**

**Remember:** Use defaults until you can't. Then override.
