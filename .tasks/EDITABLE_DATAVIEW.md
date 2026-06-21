# Editable DataView — JSON Schema builder mode

## Current state

ReqoreDataView (src/components/DataView/index.tsx) is a read-only, visually-rich tree renderer for structured payloads:

- **Render-only**: Wraps ReqorePanel + renders `data` (object, array, scalar) as a collapsible tree.
- **Type-aware display**: Chips colour-code values by kind (string / number / boolean / date / null / object / array) using ReqoreTag with intents.
- **Envelope detection**: Unwraps `{ type: string, value: unknown }` shapes and labels the value with the type (helpers.ts, line 13-127).
- **Nested nesting**: Records render as a grid table (key | value pairs), arrays as stacked indexed items; depth levels control collapse state.
- **Interaction**: `onItemClick` fires on a scalar value (no tree mutation). `onSectionToggle` fires when user expands/collapses a section (no data mutation).
- **Key primitives**: RecordTable (memo, ResizeObserver for responsive stacking), PreservedDetails (scroll-preserving collapsible), renderTree (pure function, depth-aware).
- **Props surface**: No data-mutation callbacks; size, intent, theme customization via ReqorePanel forwarding; envelope/parseEmbedded for structural hints.

## Target capability

Turn DataView into an editable JSON Schema builder:

- **Editable inline values**: Property type, description, default value, enum members editable as inline controls (ReqoreInput, ReqoreSelect, ReqoreTa textarea).
- **Structural edits**: Add/remove properties from objects; add/remove items from arrays; rename keys; reorder (optional).
- **Schema-aware**: Render JSON Schema constructs (type, properties, required, items, enum, format, minLength, pattern, examples) as visual controls instead of raw JSON.
- **Nested objects + arrays**: Support building complex schemas (`properties: { name: { type: "string" }, address: { type: "object", properties: {...} } }`).
- **Validation**: Show errors inline (e.g. "required property 'name' not set"), prevent invalid states (e.g. can't set type="object" without properties).
- **Callbacks**: `onSchemaChange(newSchema)` after any edit; `onAddProperty(path)`, `onRemoveProperty(path)`, `onChangePropertyType(path, type)`, etc. to wire parent logic.

## Gaps

### 1. Render-as-input gap (index.tsx renderScalar, line 520)
Currently `renderScalar` returns a static ReqoreTag chip. For editable mode:
- No dispatch to per-type input component (e.g. ReqoreInput for string values, ReqoreSelect for enum).
- renderValue does not know about edit intent — renders display-only.
- **Gap**: Need a "value renderer" pattern similar to ReqoreTree (line 60 `KeyRenderer` / `ValueRenderer` props) or an `editable` flag + callbacks to swap scalar rendering.

### 2. Row add/remove missing (RecordTable, index.tsx line 606)
RecordTable only renders existing entries; no "add property" or "remove property" UI.
- **Gap**: Need action buttons (+, ✕) on each row to insert/delete; need an "add row" button after the last entry.
- Likely a new sub-component or `RecordTable` enhancement to render trailing buttons per row.

### 3. Type picker not built (helpers.ts)
JSON Schema `type` can be `"string" | "number" | "boolean" | "integer" | "object" | "array" | "null"` — no generic "type picker" exists in Reqore.
- **Gap**: Need a ReqoreSelect (or custom multi-select for `type: ["string", "null"]`) that renders the JSON Schema type list.
- No schema-to-option mapping (e.g. type="object" → show +Add Property button, type="array" → show items schema editor).

### 4. Enum editor missing
JSON Schema `enum: [...]` requires rendering an array of allowed values as editable tags/chips.
- **Gap**: ReqoreMultiSelect exists (src/components/MultiSelect, line 85) but is not integrated; need wrapper to bind it to the `enum` field.

### 5. Nested object/array editing
When `type: "object"`, the `properties` field itself is a map of nested schemas. Same for `items` in arrays.
- **Gap**: Recursive schema rendering — each nested schema is another DataView-like tree that must also be editable.
- renderTree (index.tsx line 685) handles nesting visually but doesn't know about JSON Schema semantics (when to render a type picker vs. a string input).

### 6. No "required" field editor
JSON Schema `required: ["name", "age"]` marks which object properties are mandatory.
- **Gap**: No UI to toggle membership in the required array; no visual indicator (checkbox, badge) next to a property name to mark it required.

### 7. Edit state + callbacks not wired
Editable mode needs:
- Edit state per row (isEditing?, focus management).
- Callback handlers: `onChangeValue(path, value)`, `onChangeType(path, type)`, `onAddProperty(path)`, `onRemoveProperty(path)`.
- **Gap**: No callbacks defined in IReqoreDataViewProps (index.tsx line 74); ReqorePanel wrapping doesn't expose them.

### 8. Validation + error display
Schema builder must validate on change (e.g. can't set type="object" without properties; can't have duplicate required entries).
- **Gap**: No error state model; no inline error rendering (e.g. red intent badge, tooltip, or callout).

### 9. Key rename affordance
Users must be able to change property names (keys).
- **Gap**: Key is rendered as a static ReqoreTag (index.tsx line 657); no edit mode swaps it to a ReqoreInput.

### 10. Scroll preservation during edit
When a row switches from display → edit (inline input appears), ResizeObserver may fire, scroll position shifts.
- **Gap**: Need to preserve scroll + focus position during mode switch (similar to PreservedDetails, line 429).

## Proposed shape (high-level)

```typescript
export interface IReqoreDataViewProps {
  // ... existing props ...

  // Enable editable mode
  editable?: boolean;

  // Callbacks for edit operations
  onDataChange?: (data: unknown) => void;  // Called after any edit
  onAddProperty?: (path: string[]) => void;
  onRemoveProperty?: (path: string[]) => void;
  onChangePropertyType?: (path: string[], type: string) => void;
  onChangePropertyValue?: (path: string[], value: unknown) => void;
  onRenameProperty?: (path: string[], oldKey: string, newKey: string) => void;
  onChangeRequired?: (path: string[], required: string[]) => void;

  // Schema mode hint — tells DataView this is a JSON Schema, enable type picker + required indicator
  schemaMode?: boolean;  // or 'json-schema' | 'openapi' for hints

  // Validation errors
  errors?: Record<string, string>;  // path.join('.') → error message

  // Custom renderers for special fields
  PropertyTypeRenderer?: React.ComponentType<{
    value: unknown;
    path: string[];
    onChangeType?: (type: string) => void;
  }>;
  EnumValueRenderer?: React.ComponentType<{
    value: string[];
    path: string[];
    onChangeValues?: (values: string[]) => void;
  }>;
}
```

## Implementation phases

### Phase 1: Edit-mode toggle + inline scalar input
- Add `editable?: boolean` prop to IReqoreDataViewProps.
- Create a new `EditableScalarCell` component that dispatches to ReqoreInput (text), ReqoreSelect (boolean), etc. based on value type.
- Modify renderScalar to accept an `onValueChange` callback and swap to EditableScalarCell when editable=true.
- Test: edit a string scalar, confirm onChange fires and value updates.

### Phase 2: Row add/remove buttons
- Enhance RecordTable to render action buttons (+, ✕) on each row.
- Add `onAddProperty(path)` and `onRemoveProperty(path, key)` callbacks.
- For arrays, add "add item" button after the last item.
- Test: add a property, remove a property, confirm callbacks fire.

### Phase 3: Key renaming
- Swap the static key ReqoreTag to an inline-edit component (pattern: Panel.LabelEditor).
- Add `onRenameProperty(path, oldKey, newKey)` callback.
- Test: rename a key, confirm validation (duplicate keys not allowed).

### Phase 4: Type picker + schema-aware rendering
- Build a "JSON Schema type picker" ReqoreSelect (type: "string" | "number" | "object" | "array" | ...).
- Add `schemaMode?: boolean` prop; when true, detect JSON Schema constructs (type, properties, required, items, enum).
- Render `type` field as a dropdown; when type changes, conditionally show/hide related fields (e.g. hide "properties" if type != "object").
- Test: toggle type from "string" to "object", confirm "properties" field appears/disappears.

### Phase 5: Required field editor + enum editor
- Add checkbox / toggle indicator next to property names when schemaMode=true and parent type="object".
- Clicking toggles the property's membership in the `required: [...]` array.
- For `enum: [...]`, integrate ReqoreMultiSelect to add/remove allowed values.
- Test: mark a property required, toggle it off; add/remove enum values.

### Phase 6: Nested schema editing + validation
- Recursively render nested `properties` and `items` schemas as editable DataViews.
- Add error state: display inline badges/callouts for validation failures (e.g. "type='object' requires properties").
- Test: build a nested schema (object with nested object property), edit at all levels, confirm validation.

### Phase 7: Polish + accessibility
- Scroll preservation on mode switches (inline input appears).
- Keyboard navigation (Tab through edits, Escape to cancel, Enter to confirm).
- Undo/redo (optional; may defer to parent).

## Open questions

1. **Reordering**: Do properties need to reorder? JSON objects are unordered, but UI UX often benefits from drag-to-reorder. Should array items support reordering?

2. **Schema subset**: Must the editor support `oneOf` / `anyOf` / `allOf` (polymorphic schemas)? Or only the core subset (type, properties, required, items, enum, format)?

3. **Validation gate**: Should edits be rejected immediately if invalid (e.g. can't save until all required properties set), or show warnings but allow saves?

4. **Colocated vs. modal**: Is this an inline-editable tree inside a panel, or does editing large schemas open a modal?

5. **Root-level type change**: When schemaMode=true and data is an object, can the user change the root type from "object" to "array" or "string"? (Likely yes; affects row layout.)

6. **Default value editor**: Should the editor support editing `default: ...` field for each property? This needs context-aware input (type matching).

7. **Examples field**: Does the builder need to support the `examples: [...]` field from JSON Schema? (Lower priority; can defer.)

8. **Integration point**: Does this live as props on ReqoreDataView, or as a new ReqoreSchemaBuilder component that wraps DataView + adds edit logic?

