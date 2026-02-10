import { AssessmentFormFields } from '../AssessmentFormFields';
import type { AssessmentUpdateRequest, Assessment } from '@/types/assessment';

interface AssessmentBasicInfoTabProps {
    formData: AssessmentUpdateRequest;
    onChange: (data: AssessmentUpdateRequest) => void;
    errors: Record<string, string>;
    assessment: Assessment;
}

export function AssessmentBasicInfoTab({ formData, onChange, errors, assessment }: AssessmentBasicInfoTabProps) {
    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update the basic details of this assessment</p>
            </div>

            <AssessmentFormFields
                data={formData}
                onChange={onChange}
                errors={errors}
                isUpdate={true}
            />

            {/* Display Assessment Code (Read-only) */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Assessment Code</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{assessment.code}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">Created At</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {new Date(assessment.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
