import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessmentApi';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import type { AssessmentUpdateRequest } from '@/types/assessment';
import { AssessmentBasicInfoTab } from './tabs/AssessmentBasicInfoTab';
import { AssessmentChallengesTab } from './tabs/AssessmentChallengesTab';
import { AssessmentQuestionsTab } from './tabs/AssessmentQuestionsTab';

type TabType = 'basic' | 'challenges' | 'questions';

export default function EditAssessmentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('basic');

    // Form state
    const [formData, setFormData] = useState<AssessmentUpdateRequest>({
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
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch assessment data
    const { data: assessment, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => assessmentApi.getById(Number(id)),
        enabled: !!id,
    });

    // Update form when assessment data is loaded
    useEffect(() => {
        if (assessment) {
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
            });
        }
    }, [assessment]);

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
            updateMutation.mutate(formData);
        }
    };

    const handleCancel = () => {
        navigate('/teacher-assessment');
    };

    if (isLoading) {
        return (
            <MainLayout pathName={{ assessments: "Teacher Assessment", edit: "Edit Assessment" }}>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </MainLayout>
        );
    }

    if (!assessment) {
        return (
            <MainLayout pathName={{ assessments: "Teacher Assessment", edit: "Edit Assessment" }}>
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
        <MainLayout pathName={{ assessments: "Teacher Assessment", edit: assessment.title }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title={`Update Assessment (${assessment.code})`}
                    description="Adjust assessment details within the teacher workspace. You are editing as Superadmin."
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save
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
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'questions'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Questions (20)
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
                            />
                        )}
                        {activeTab === 'challenges' && (
                            <AssessmentChallengesTab />
                        )}
                        {activeTab === 'questions' && (
                            <AssessmentQuestionsTab />
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
