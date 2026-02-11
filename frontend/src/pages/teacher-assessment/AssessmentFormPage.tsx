import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessmentApi';
import { assessmentQuestionApi } from '@/api/assessmentQuestionApi';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import type { AssessmentCreateRequest, AssessmentUpdateRequest } from '@/types/assessment';
import { AssessmentBasicInfoTab } from './tabs/AssessmentBasicInfoTab';
import { AssessmentChallengesTab } from './tabs/AssessmentChallengesTab';
import { AssessmentQuestionsTab } from './tabs/AssessmentQuestionsTab';

type TabType = 'basic' | 'challenges' | 'questions';

export default function AssessmentFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('basic');

    // Form state - using union type to handle both create and update
    const [formData, setFormData] = useState<AssessmentCreateRequest | AssessmentUpdateRequest>({
        code: '',
        title: '',
        description: '',
        assessmentTypeId: '',
        totalScore: 100,
        passScore: 60,
        timeLimitMinutes: 60,
        attemptLimit: 1,
        isShuffleQuestion: false,
        isShuffleOption: false,
        status: 'DRAFT',
    } as AssessmentCreateRequest);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch assessment data (only in edit mode)
    const { data: assessment, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => assessmentApi.getById(Number(id)),
        enabled: isEditMode,
    });

    // Fetch assessment questions count (only in edit mode)
    const { data: assessmentQuestions = [] } = useQuery({
        queryKey: ['assessmentQuestions', id],
        queryFn: () => assessmentQuestionApi.getByAssessmentId(Number(id)),
        enabled: isEditMode && !!id,
    });

    // Update form when assessment data is loaded (edit mode)
    useEffect(() => {
        if (isEditMode && assessment) {
            setFormData({
                title: assessment.title,
                description: assessment.description,
                assessmentTypeId: assessment.assessmentTypeId,
                totalScore: assessment.totalScore,
                passScore: assessment.passScore,
                timeLimitMinutes: assessment.timeLimitMinutes,
                attemptLimit: assessment.attemptLimit,
                isShuffleQuestion: assessment.isShuffleQuestion,
                isShuffleOption: assessment.isShuffleOption,
                status: assessment.status,
            } as AssessmentUpdateRequest);
        }
    }, [assessment, isEditMode]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: AssessmentCreateRequest) => assessmentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            toast({ variant: "success", title: "Success", description: "Assessment created successfully" });
            navigate('/teacher-assessment');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create assessment" });
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: AssessmentUpdateRequest) => assessmentApi.update(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            queryClient.invalidateQueries({ queryKey: ['assessment', id] });
            toast({ variant: "success", title: "Success", description: "Assessment updated successfully" });
            navigate('/teacher-assessment');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update assessment" });
        }
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.assessmentTypeId) newErrors.assessmentTypeId = 'Assessment type is required';
        if (!isEditMode && !('code' in formData && formData.code?.trim())) newErrors.code = 'Code is required';
        if (formData.totalScore <= 0) newErrors.totalScore = 'Total score must be greater than 0';
        if (formData.passScore <= 0) newErrors.passScore = 'Pass score must be greater than 0';
        if (formData.passScore > formData.totalScore) newErrors.passScore = 'Pass score cannot exceed total score';
        if (formData.timeLimitMinutes <= 0) newErrors.timeLimitMinutes = 'Time limit must be greater than 0';
        if (formData.attemptLimit <= 0) newErrors.attemptLimit = 'Attempt limit must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            if (isEditMode) {
                updateMutation.mutate(formData as AssessmentUpdateRequest);
            } else {
                createMutation.mutate(formData as AssessmentCreateRequest);
            }
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleCancel = () => {
        navigate('/teacher-assessment');
    };

    if (isEditMode && isLoading) {
        return (
            <MainLayout pathName={{ assessments: "Teacher Assessment", form: isEditMode ? "Edit Assessment" : "Create Assessment" }}>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </MainLayout>
        );
    }

    if (isEditMode && !assessment) {
        return (
            <MainLayout pathName={{ assessments: "Teacher Assessment", form: "Edit Assessment" }}>
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-lg font-medium text-gray-900">Assessment not found</p>
                    <Button onClick={handleCancel} className="mt-4">
                        Back to Assessments
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pathName={{
            assessments: "Teacher Assessment",
            form: isEditMode ? (assessment?.title || "Edit Assessment") : "Create Assessment"
        }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title={isEditMode ? `Update Assessment ${assessment?.code ? `(${assessment.code})` : ''}` : "Create New Assessment"}
                    description={isEditMode
                        ? "Adjust assessment details within the teacher workspace. You are editing as Superadmin."
                        : "Create a new assessment for the teacher workspace."}
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditMode ? 'Save Changes' : 'Create Assessment'}
                            </>
                        )}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'basic'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Basic Information
                            </button>
                            <button
                                onClick={() => setActiveTab('challenges')}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'challenges'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Challenges (1)
                            </button>
                            <button
                                onClick={() => setActiveTab('questions')}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                                    activeTab === 'questions'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Questions {isEditMode && `(${assessmentQuestions.length})`}
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'basic' && (
                            <AssessmentBasicInfoTab
                                formData={formData}
                                onChange={setFormData}
                                errors={errors}
                                assessment={assessment}
                                isEditMode={isEditMode}
                            />
                        )}
                        {activeTab === 'challenges' && (
                            <AssessmentChallengesTab />
                        )}
                        {activeTab === 'questions' && (
                            <AssessmentQuestionsTab assessmentId={assessment?.id} />
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
