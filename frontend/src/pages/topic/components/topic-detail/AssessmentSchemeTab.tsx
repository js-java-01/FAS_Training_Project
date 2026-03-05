import type { DragEvent } from "react";
import { FiArrowRight, FiBarChart2, FiSave, FiTrash2 } from "react-icons/fi";
import { Field } from "./shared";
import type { SchemeItem } from "./shared";

type AssessmentTypeOption = { id: string; name: string; description: string };

type AssessmentSchemeTabProps = {
  availableAssessmentTypes: AssessmentTypeOption[];
  schemeItems: SchemeItem[];
  totalWeight: number;
  remainingWeight: number;
  canAddMoreAssessmentType: boolean;
  isSchemeWeightValid: boolean;
  schemeLoading: boolean;
  schemeSaving: boolean;
  onTypeDragStart: (event: DragEvent<HTMLDivElement>, assessmentTypeId: string) => void;
  onSchemeDrop: (event: DragEvent<HTMLDivElement>) => void;
  addAssessmentTypeToScheme: (assessmentTypeId: string) => void;
  updateSchemeWeight: (localId: string, value: string) => void;
  removeSchemeItem: (localId: string) => void;
  saveAssessmentScheme: () => void;
};

export function AssessmentSchemeTab({
  availableAssessmentTypes,
  schemeItems,
  totalWeight,
  remainingWeight,
  canAddMoreAssessmentType,
  isSchemeWeightValid,
  schemeLoading,
  schemeSaving,
  onTypeDragStart,
  onSchemeDrop,
  addAssessmentTypeToScheme,
  updateSchemeWeight,
  removeSchemeItem,
  saveAssessmentScheme,
}: AssessmentSchemeTabProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-white space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
          <div className="border rounded-lg p-3 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Available Assessment Types</h3>
              <span className="text-xs text-gray-500">{availableAssessmentTypes.length} items</span>
            </div>

            <div className="space-y-2 max-h-90 overflow-auto pr-1">
              {availableAssessmentTypes.length === 0 ? (
                <p className="text-sm text-gray-500">No more assessment type to add.</p>
              ) : (
                availableAssessmentTypes.map((type) => (
                  <div
                    key={type.id}
                    draggable={canAddMoreAssessmentType}
                    onDragStart={(event) => onTypeDragStart(event, type.id)}
                    className="rounded-md border bg-white px-3 py-2.5 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{type.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{type.description || "No description"}</p>
                    </div>
                    {canAddMoreAssessmentType && (
                      <button
                        type="button"
                        onClick={() => addAssessmentTypeToScheme(type.id)}
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <FiArrowRight /> Add
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onSchemeDrop}
            className="border rounded-lg p-3 bg-white space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Selected Assessment Scheme</h3>
              <span
                className={
                  totalWeight > 100
                    ? "text-red-600 font-semibold text-sm"
                    : totalWeight === 100
                      ? "text-green-600 font-semibold text-sm"
                      : "text-amber-600 font-semibold text-sm"
                }
              >
                Total: {totalWeight}%
              </span>
            </div>

            <div className="space-y-2 max-h-90 overflow-auto pr-1">
              {schemeItems.length === 0 ? (
                <div className="text-sm text-gray-500 border border-dashed rounded-md p-4 text-center">
                  Drop assessment type here or click Add from the left panel.
                </div>
              ) : (
                schemeItems.map((item) => (
                  <div key={item.localId} className="rounded-md border bg-slate-50 px-3 py-2.5 grid grid-cols-1 md:grid-cols-[1fr_140px_42px] gap-3 items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.assessmentTypeName}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.assessmentTypeDescription || "No description"}</p>
                    </div>

                    <Field icon={<FiBarChart2 />} label="Weight (%)">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        value={item.weight}
                        onChange={(event) => updateSchemeWeight(item.localId, event.target.value)}
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={() => removeSchemeItem(item.localId)}
                      className="self-end md:self-center inline-flex items-center justify-center text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {schemeLoading && <div className="text-sm text-gray-500">Loading assessment scheme...</div>}

        {!isSchemeWeightValid && (
          <div className={totalWeight > 100 ? "text-sm text-red-600" : "text-sm text-amber-600"}>
            Total weight must be exactly 100%. {totalWeight < 100 ? `Remaining ${remainingWeight}%.` : ""}
          </div>
        )}

        <div className="flex items-center justify-between">
          {isSchemeWeightValid ? (
            <div className="text-sm text-green-600">Assessment scheme is valid at 100%.</div>
          ) : (
            <div className="text-sm text-gray-500">Adjust weights to reach exactly 100% before saving.</div>
          )}

          <button
            type="button"
            onClick={saveAssessmentScheme}
            disabled={schemeSaving || schemeLoading || !isSchemeWeightValid}
            className="inline-flex items-center gap-2 text-sm bg-blue-700 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            <FiSave /> {schemeSaving ? "Saving..." : "Save Assessment Scheme"}
          </button>
        </div>
      </div>
    </div>
  );
}
