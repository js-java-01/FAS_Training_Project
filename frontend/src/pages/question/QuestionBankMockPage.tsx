import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, SquarePen, Trash2, Search, LayoutGrid, List, X, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PermissionGate } from '@/components/PermissionGate';

import { questionApi } from '@/api/questionApi';
import type { Question } from '@/types/question';
import { Badge } from '@/components/ui/badge';
import ActionBtn from '@/components/data_table/ActionBtn';
import { useToast } from '@/hooks/useToast';
import type { QuestionCategory } from '@/types';

// Mock data: Add tags to questions
interface QuestionWithTags extends Question {
    tags?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
}

// Mock tag generator based on question content and category
const generateMockTags = (question: Question): string[] => {
    const categoryName = question.category?.name?.toLowerCase() || '';
    const content = question.content.toLowerCase();
    const tags: string[] = [];

    // Category-based tags
    if (categoryName.includes('java')) {
        if (content.includes('stream') || content.includes('lambda')) tags.push('Streams', 'Functional');
        if (content.includes('collection') || content.includes('map') || content.includes('list')) tags.push('Collections');
        if (content.includes('class') || content.includes('interface') || content.includes('inherit')) tags.push('OOP');
        if (content.includes('thread') || content.includes('concurrent')) tags.push('Concurrency');
        if (content.includes('jvm') || content.includes('memory')) tags.push('JVM');
        if (content.includes('exception') || content.includes('error')) tags.push('Exception Handling');
    } else if (categoryName.includes('c++')) {
        if (content.includes('pointer') || content.includes('reference')) tags.push('Memory');
        if (content.includes('class') || content.includes('polymorphism') || content.includes('inherit')) tags.push('OOP');
        if (content.includes('template')) tags.push('Templates');
        if (content.includes('stl')) tags.push('STL');
        if (content.includes('smart pointer')) tags.push('Modern C++');
    } else if (categoryName.includes('python')) {
        if (content.includes('decorator') || content.includes('generator')) tags.push('Advanced');
        if (content.includes('list') || content.includes('dict') || content.includes('tuple')) tags.push('Data Structures');
        if (content.includes('class') || content.includes('inherit')) tags.push('OOP');
        if (content.includes('async') || content.includes('await')) tags.push('Async');
        if (content.includes('pandas') || content.includes('numpy')) tags.push('Data Science');
    } else if (categoryName.includes('soft') || categoryName.includes('skill')) {
        if (content.includes('team') || content.includes('collaborate')) tags.push('Teamwork');
        if (content.includes('communicate') || content.includes('present')) tags.push('Communication');
        if (content.includes('problem') || content.includes('solve')) tags.push('Problem Solving');
        if (content.includes('lead') || content.includes('manage')) tags.push('Leadership');
        if (content.includes('time') || content.includes('priority')) tags.push('Time Management');
    } else if (categoryName.includes('database') || categoryName.includes('sql')) {
        if (content.includes('join') || content.includes('query')) tags.push('SQL');
        if (content.includes('index') || content.includes('optimize')) tags.push('Performance');
        if (content.includes('transaction') || content.includes('acid')) tags.push('Transactions');
        if (content.includes('nosql') || content.includes('mongodb')) tags.push('NoSQL');
    } else if (categoryName.includes('javascript') || categoryName.includes('frontend')) {
        if (content.includes('promise') || content.includes('async')) tags.push('Async');
        if (content.includes('react') || content.includes('component')) tags.push('React');
        if (content.includes('closure') || content.includes('scope')) tags.push('Core JS');
        if (content.includes('dom')) tags.push('DOM');
        if (content.includes('event')) tags.push('Events');
    }

    // General programming concepts
    if (content.includes('algorithm') || content.includes('complexity')) tags.push('Algorithms');
    if (content.includes('design pattern')) tags.push('Design Patterns');
    if (content.includes('test') || content.includes('unit')) tags.push('Testing');
    if (content.includes('api') || content.includes('rest')) tags.push('API');
    if (content.includes('security') || content.includes('encrypt')) tags.push('Security');

    // If no tags matched, add generic ones
    if (tags.length === 0) {
        if (question.questionType === 'ESSAY') tags.push('Conceptual');
        else tags.push('Fundamentals');
    }

    return [...new Set(tags)]; // Remove duplicates
};

// Mock difficulty generator
const generateMockDifficulty = (question: Question): 'Easy' | 'Medium' | 'Hard' => {
    const content = question.content.toLowerCase();
    const optionsCount = question.options.length;

    // More complex questions tend to have more options or specific keywords
    if (
        content.includes('advanced') ||
        content.includes('optimize') ||
        content.includes('implement') ||
        content.includes('design') ||
        optionsCount >= 5
    ) {
        return 'Hard';
    } else if (
        content.includes('explain') ||
        content.includes('difference') ||
        content.includes('compare') ||
        optionsCount >= 3
    ) {
        return 'Medium';
    } else {
        return 'Easy';
    }
};

// Mock questions data for testing
const createMockQuestions = (): QuestionWithTags[] => {
    const timestamp = new Date().toISOString();
    const categories: QuestionCategory[] = [
        { id: 'cat-java', name: 'Java', description: 'Java programming questions', createdAt: timestamp, updatedAt: timestamp },
        { id: 'cat-python', name: 'Python', description: 'Python programming questions', createdAt: timestamp, updatedAt: timestamp },
        { id: 'cat-cpp', name: 'C++', description: 'C++ programming questions', createdAt: timestamp, updatedAt: timestamp },
        { id: 'cat-js', name: 'JavaScript', description: 'JavaScript programming questions', createdAt: timestamp, updatedAt: timestamp },
        { id: 'cat-sql', name: 'Database & SQL', description: 'Database and SQL questions', createdAt: timestamp, updatedAt: timestamp },
        { id: 'cat-soft', name: 'Soft Skills', description: 'Soft skills and behavioral questions', createdAt: timestamp, updatedAt: timestamp }
    ];

    const mockQuestions: Array<Omit<QuestionWithTags, 'createdAt' | 'updatedAt'>> = [
        // Java Questions
        {
            id: 'mock-1',
            content: 'What is the difference between HashMap and Hashtable in Java?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[0],
            options: [
                { id: 'opt-1', content: 'HashMap is synchronized, Hashtable is not', correct: false, orderIndex: 0 },
                { id: 'opt-2', content: 'Hashtable is synchronized, HashMap is not', correct: true, orderIndex: 1 },
                { id: 'opt-3', content: 'Both are synchronized', correct: false, orderIndex: 2 },
                { id: 'opt-4', content: 'Neither is synchronized', correct: false, orderIndex: 3 }
            ],
            tags: ['Collections', 'OOP', 'Concurrency'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-2',
            content: 'Explain the Java Stream API and its benefits',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[0],
            options: [],
            tags: ['Streams', 'Functional'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-3',
            content: 'What is the purpose of the volatile keyword in Java?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[0],
            options: [
                { id: 'opt-5', content: 'Makes variable immutable', correct: false, orderIndex: 0 },
                { id: 'opt-6', content: 'Ensures visibility of changes across threads', correct: true, orderIndex: 1 },
                { id: 'opt-7', content: 'Makes variable static', correct: false, orderIndex: 2 }
            ],
            tags: ['Concurrency', 'JVM'],
            difficulty: 'Hard'
        },
        {
            id: 'mock-4',
            content: 'Which of the following are valid ways to create a thread in Java?',
            questionType: 'MULTIPLE_CHOICE',
            isActive: true,
            category: categories[0],
            options: [
                { id: 'opt-8', content: 'Extend Thread class', correct: true, orderIndex: 0 },
                { id: 'opt-9', content: 'Implement Runnable interface', correct: true, orderIndex: 1 },
                { id: 'opt-10', content: 'Implement Callable interface', correct: true, orderIndex: 2 },
                { id: 'opt-11', content: 'Extend Object class', correct: false, orderIndex: 3 }
            ],
            tags: ['Concurrency', 'OOP'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-5',
            content: 'What is the time complexity of ArrayList.get(index)?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[0],
            options: [
                { id: 'opt-12', content: 'O(1)', correct: true, orderIndex: 0 },
                { id: 'opt-13', content: 'O(n)', correct: false, orderIndex: 1 },
                { id: 'opt-14', content: 'O(log n)', correct: false, orderIndex: 2 }
            ],
            tags: ['Collections', 'Algorithms'],
            difficulty: 'Easy'
        },
        {
            id: 'mock-6',
            content: 'Explain exception handling in Java with try-catch-finally',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[0],
            options: [],
            tags: ['Exception Handling', 'Fundamentals'],
            difficulty: 'Easy'
        },

        // Python Questions
        {
            id: 'mock-7',
            content: 'What are Python decorators and how do they work?',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[1],
            options: [],
            tags: ['Advanced', 'Functional'],
            difficulty: 'Hard'
        },
        {
            id: 'mock-8',
            content: 'Which data structure would you use for fast lookups in Python?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[1],
            options: [
                { id: 'opt-15', content: 'List', correct: false, orderIndex: 0 },
                { id: 'opt-16', content: 'Dictionary', correct: true, orderIndex: 1 },
                { id: 'opt-17', content: 'Tuple', correct: false, orderIndex: 2 },
                { id: 'opt-18', content: 'Set', correct: false, orderIndex: 3 }
            ],
            tags: ['Data Structures', 'Algorithms'],
            difficulty: 'Easy'
        },
        {
            id: 'mock-9',
            content: 'Explain the difference between list and tuple in Python',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[1],
            options: [
                { id: 'opt-19', content: 'Lists are mutable, tuples are immutable', correct: true, orderIndex: 0 },
                { id: 'opt-20', content: 'Lists are immutable, tuples are mutable', correct: false, orderIndex: 1 },
                { id: 'opt-21', content: 'No difference', correct: false, orderIndex: 2 }
            ],
            tags: ['Data Structures', 'Fundamentals'],
            difficulty: 'Easy'
        },
        {
            id: 'mock-10',
            content: 'How do you implement async/await in Python?',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[1],
            options: [],
            tags: ['Async', 'Advanced'],
            difficulty: 'Hard'
        },
        {
            id: 'mock-11',
            content: 'What is pandas used for in Python?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[1],
            options: [
                { id: 'opt-22', content: 'Web development', correct: false, orderIndex: 0 },
                { id: 'opt-23', content: 'Data analysis and manipulation', correct: true, orderIndex: 1 },
                { id: 'opt-24', content: 'GUI development', correct: false, orderIndex: 2 },
                { id: 'opt-25', content: 'Game development', correct: false, orderIndex: 3 }
            ],
            tags: ['Data Science', 'Libraries'],
            difficulty: 'Easy'
        },

        // C++ Questions
        {
            id: 'mock-12',
            content: 'Explain polymorphism in C++ with examples',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[2],
            options: [],
            tags: ['OOP', 'Fundamentals'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-13',
            content: 'What is the difference between pointers and references in C++?',
            questionType: 'MULTIPLE_CHOICE',
            isActive: true,
            category: categories[2],
            options: [
                { id: 'opt-26', content: 'Pointers can be null, references cannot', correct: true, orderIndex: 0 },
                { id: 'opt-27', content: 'Pointers can be reassigned, references cannot', correct: true, orderIndex: 1 },
                { id: 'opt-28', content: 'Pointers use & operator', correct: false, orderIndex: 2 },
                { id: 'opt-29', content: 'References use * operator', correct: false, orderIndex: 3 }
            ],
            tags: ['Memory', 'Fundamentals'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-14',
            content: 'What are smart pointers in modern C++?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[2],
            options: [
                { id: 'opt-30', content: 'Pointers with automatic memory management', correct: true, orderIndex: 0 },
                { id: 'opt-31', content: 'Faster regular pointers', correct: false, orderIndex: 1 },
                { id: 'opt-32', content: 'AI-powered pointers', correct: false, orderIndex: 2 }
            ],
            tags: ['Modern C++', 'Memory'],
            difficulty: 'Hard'
        },
        {
            id: 'mock-15',
            content: 'Explain template metaprogramming in C++',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[2],
            options: [],
            tags: ['Templates', 'Advanced'],
            difficulty: 'Hard'
        },

        // JavaScript Questions
        {
            id: 'mock-16',
            content: 'What is a closure in JavaScript?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[3],
            options: [
                { id: 'opt-33', content: 'A function with access to outer scope', correct: true, orderIndex: 0 },
                { id: 'opt-34', content: 'A closed loop', correct: false, orderIndex: 1 },
                { id: 'opt-35', content: 'A private class', correct: false, orderIndex: 2 }
            ],
            tags: ['Core JS', 'Fundamentals'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-17',
            content: 'How do Promises work in JavaScript?',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[3],
            options: [],
            tags: ['Async', 'Core JS'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-18',
            content: 'What is the Virtual DOM in React?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[3],
            options: [
                { id: 'opt-36', content: 'A lightweight copy of the actual DOM', correct: true, orderIndex: 0 },
                { id: 'opt-37', content: 'A virtual reality interface', correct: false, orderIndex: 1 },
                { id: 'opt-38', content: 'A DOM for virtual machines', correct: false, orderIndex: 2 }
            ],
            tags: ['React', 'DOM'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-19',
            content: 'Explain event bubbling and event capturing',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[3],
            options: [],
            tags: ['Events', 'DOM'],
            difficulty: 'Hard'
        },

        // Database & SQL Questions
        {
            id: 'mock-20',
            content: 'What is the difference between INNER JOIN and LEFT JOIN?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[4],
            options: [
                { id: 'opt-39', content: 'LEFT JOIN returns all rows from left table', correct: true, orderIndex: 0 },
                { id: 'opt-40', content: 'INNER JOIN returns all rows from left table', correct: false, orderIndex: 1 },
                { id: 'opt-41', content: 'No difference', correct: false, orderIndex: 2 }
            ],
            tags: ['SQL', 'Fundamentals'],
            difficulty: 'Easy'
        },
        {
            id: 'mock-21',
            content: 'Explain database indexing and its impact on performance',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[4],
            options: [],
            tags: ['Performance', 'SQL'],
            difficulty: 'Hard'
        },
        {
            id: 'mock-22',
            content: 'What does ACID stand for in database transactions?',
            questionType: 'MULTIPLE_CHOICE',
            isActive: true,
            category: categories[4],
            options: [
                { id: 'opt-42', content: 'Atomicity', correct: true, orderIndex: 0 },
                { id: 'opt-43', content: 'Consistency', correct: true, orderIndex: 1 },
                { id: 'opt-44', content: 'Isolation', correct: true, orderIndex: 2 },
                { id: 'opt-45', content: 'Durability', correct: true, orderIndex: 3 },
                { id: 'opt-46', content: 'Availability', correct: false, orderIndex: 4 }
            ],
            tags: ['Transactions', 'Fundamentals'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-23',
            content: 'Compare SQL and NoSQL databases',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[4],
            options: [],
            tags: ['NoSQL', 'SQL'],
            difficulty: 'Medium'
        },

        // Soft Skills Questions
        {
            id: 'mock-24',
            content: 'How do you handle conflicts within a team?',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[5],
            options: [],
            tags: ['Teamwork', 'Communication'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-25',
            content: 'What makes effective communication in a software project?',
            questionType: 'MULTIPLE_CHOICE',
            isActive: true,
            category: categories[5],
            options: [
                { id: 'opt-47', content: 'Clear and concise messages', correct: true, orderIndex: 0 },
                { id: 'opt-48', content: 'Active listening', correct: true, orderIndex: 1 },
                { id: 'opt-49', content: 'Regular updates', correct: true, orderIndex: 2 },
                { id: 'opt-50', content: 'Using technical jargon always', correct: false, orderIndex: 3 }
            ],
            tags: ['Communication', 'Teamwork'],
            difficulty: 'Easy'
        },
        {
            id: 'mock-26',
            content: 'Describe your problem-solving approach for complex technical issues',
            questionType: 'ESSAY',
            isActive: true,
            category: categories[5],
            options: [],
            tags: ['Problem Solving', 'Technical'],
            difficulty: 'Medium'
        },
        {
            id: 'mock-27',
            content: 'How do you prioritize tasks when managing multiple deadlines?',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            category: categories[5],
            options: [
                { id: 'opt-51', content: 'By urgency and importance matrix', correct: true, orderIndex: 0 },
                { id: 'opt-52', content: 'First come, first served', correct: false, orderIndex: 1 },
                { id: 'opt-53', content: 'Easiest tasks first', correct: false, orderIndex: 2 }
            ],
            tags: ['Time Management', 'Leadership'],
            difficulty: 'Medium'
        }
    ];

    // Add timestamp fields to all mock questions
    return mockQuestions.map(q => ({
        ...q,
        createdAt: timestamp,
        updatedAt: timestamp
    }));
};

export default function QuestionBankMockPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categorySearch, setCategorySearch] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryPage, setCategoryPage] = useState(1);
    const [pageSize] = useState(10);
    const [categoryPageSize] = useState(8);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // NEW: Tag filtering state
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch categories
    const { data: apiCategories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getAll()
    });

    // Merge API categories with mock categories
    const categories = useMemo(() => {
        const mockCategories: QuestionCategory[] = [
            { id: 'cat-java', name: 'Java', description: 'Java programming questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'cat-python', name: 'Python', description: 'Python programming questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'cat-cpp', name: 'C++', description: 'C++ programming questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'cat-js', name: 'JavaScript', description: 'JavaScript programming questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'cat-sql', name: 'Database & SQL', description: 'Database and SQL questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'cat-soft', name: 'Soft Skills', description: 'Soft skills and behavioral questions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ];

        // Combine mock categories with API categories (mock first for testing visibility)
        return [...mockCategories, ...apiCategories];
    }, [apiCategories]);

    // Fetch questions and add mock tags
    const { data: rawQuestions = [], isLoading: questionsLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: () => questionApi.getAll()
    });

    // Enhance questions with mock tags and difficulty + Add mock questions
    const allQuestions: QuestionWithTags[] = useMemo(() => {
        // Enhance real API questions with tags and difficulty
        const enhancedRealQuestions = rawQuestions.map((q: Question) => ({
            ...q,
            tags: generateMockTags(q),
            difficulty: generateMockDifficulty(q)
        }));

        // Get mock questions
        const mockQuestions = createMockQuestions();

        // Combine both (mock questions first for easy testing)
        return [...mockQuestions, ...enhancedRealQuestions];
    }, [rawQuestions]);

    // Filter categories by search
    const filteredCategories = useMemo(() => {
        if (!categorySearch) return categories;
        return categories.filter((c) =>
            c.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    // Get available tags for the selected category
    const availableTags = useMemo(() => {
        let questionsInCategory = allQuestions;

        if (selectedCategoryId) {
            questionsInCategory = allQuestions.filter(q => q.category?.id === selectedCategoryId);
        }

        const tagCounts = new Map<string, number>();
        questionsInCategory.forEach(q => {
            q.tags?.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        return Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }, [allQuestions, selectedCategoryId]);

    // Pagination for categories
    const totalCategoryPages = Math.ceil(filteredCategories.length / categoryPageSize);
    const safeCategoryPage = Math.min(categoryPage, Math.max(1, totalCategoryPages));

    const paginatedCategories = useMemo(() => {
        const startIndex = (safeCategoryPage - 1) * categoryPageSize;
        const endIndex = startIndex + categoryPageSize;
        return filteredCategories.slice(startIndex, endIndex);
    }, [filteredCategories, safeCategoryPage, categoryPageSize]);

    // Filter questions by category, tags, difficulty, and search
    const filteredQuestions = useMemo(() => {
        let filtered = allQuestions;

        // Filter by category
        if (selectedCategoryId) {
            filtered = filtered.filter(q => q.category?.id === selectedCategoryId);
        }

        // Filter by tags (OR logic: question must have at least one selected tag)
        if (selectedTags.length > 0) {
            filtered = filtered.filter(q =>
                q.tags?.some(tag => selectedTags.includes(tag))
            );
        }

        // Filter by difficulty
        if (selectedDifficulties.length > 0) {
            filtered = filtered.filter(q =>
                q.difficulty && selectedDifficulties.includes(q.difficulty)
            );
        }

        // Filter by search
        if (questionSearch) {
            filtered = filtered.filter(q =>
                q.content.toLowerCase().includes(questionSearch.toLowerCase()) ||
                q.category?.name.toLowerCase().includes(questionSearch.toLowerCase()) ||
                q.tags?.some(tag => tag.toLowerCase().includes(questionSearch.toLowerCase()))
            );
        }

        return filtered;
    }, [allQuestions, selectedCategoryId, selectedTags, selectedDifficulties, questionSearch]);

    // Pagination
    const totalPages = Math.ceil(filteredQuestions.length / pageSize);
    const safePage = Math.min(currentPage, Math.max(1, totalPages));

    const paginatedQuestions = useMemo(() => {
        const startIndex = (safePage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredQuestions.slice(startIndex, endIndex);
    }, [filteredQuestions, safePage, pageSize]);

    // Reset pagination when filters change
    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedTags([]);
        setSelectedDifficulties([]);
        setCurrentPage(1);
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
        setCurrentPage(1);
    };

    const handleDifficultyToggle = (difficulty: string) => {
        setSelectedDifficulties(prev =>
            prev.includes(difficulty)
                ? prev.filter(d => d !== difficulty)
                : [...prev, difficulty]
        );
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSelectedTags([]);
        setSelectedDifficulties([]);
        setQuestionSearch('');
        setCurrentPage(1);
    };

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: questionApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
            toast({ variant: "success", title: "Success", description: "Question deleted successfully" });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete question" });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteMutation.mutate(id);
        }
    };

    const getQuestionTypeBadge = (type: string) => {
        const badgeClasses: Record<string, string> = {
            SINGLE_CHOICE: 'bg-blue-50 text-blue-600 border-blue-200',
            MULTIPLE_CHOICE: 'bg-purple-50 text-purple-600 border-purple-200',
            TRUE_FALSE: 'bg-green-50 text-green-600 border-green-200',
            ESSAY: 'bg-orange-50 text-orange-600 border-orange-200'
        };

        const labels: Record<string, string> = {
            SINGLE_CHOICE: 'Single Choice',
            MULTIPLE_CHOICE: 'Multiple Choice',
            TRUE_FALSE: 'True/False',
            ESSAY: 'Essay'
        };

        return (
            <Badge variant="outline" className={badgeClasses[type] || ''}>
                {labels[type] || type}
            </Badge>
        );
    };

    const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
        const badgeClasses = {
            Easy: 'bg-green-50 text-green-700 border-green-200',
            Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            Hard: 'bg-red-50 text-red-700 border-red-200'
        };

        return (
            <Badge variant="outline" className={badgeClasses[difficulty]}>
                {difficulty}
            </Badge>
        );
    };

    const hasActiveFilters = selectedTags.length > 0 || selectedDifficulties.length > 0 || questionSearch !== '';

    return (
        <MainLayout pathName={{ questions: "Question Bank (Mock)" }}>
            <div className="h-full flex flex-col overflow-hidden gap-6 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                        <p className="text-sm text-gray-600 mt-1">Browse and filter questions by category and tags</p>
                    </div>
                    <PermissionGate permission="QUESTION_CREATE">
                        <Button onClick={() => navigate('/questions/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                        </Button>
                    </PermissionGate>
                </div>

                {/* Stats Cards
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Total Questions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{allQuestions.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Categories</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Available Tags</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{availableTags.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Filtered Results</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredQuestions.length}</p>
                    </div>
                </div> */}

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-64 bg-white rounded-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                            </p>
                            <div className="pt-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {categoriesLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${!selectedCategoryId
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">All Questions</span>
                                            <span className={`text-xs ${!selectedCategoryId ? 'text-white' : 'text-gray-600'}`}>
                                                {allQuestions.length}
                                            </span>
                                        </div>
                                    </button>
                                    {paginatedCategories.map((category) => {
                                        const count = allQuestions.filter(q => q.category?.id === category.id).length;
                                        const isSelected = selectedCategoryId === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryChange(category.id)}
                                                className={`w-full text-left px-3 py-2 rounded-md transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-sm font-medium">{category.name}</span>
                                                    <span className={`text-xs ml-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                        {count}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Category Pagination */}
                        {filteredCategories.length > 0 && totalCategoryPages > 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        {((safeCategoryPage - 1) * categoryPageSize) + 1}-{Math.min(safeCategoryPage * categoryPageSize, filteredCategories.length)} of {filteredCategories.length}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                                            disabled={safeCategoryPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
                                            disabled={safeCategoryPage === totalCategoryPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Questions with Tags */}
                    <div className="flex-1 bg-white rounded-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {selectedCategoryId
                                            ? categories.find((c) => c.id === selectedCategoryId)?.name
                                            : 'All Questions'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="h-9"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-9"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Search and Filter Controls */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search questions, tags..."
                                        value={questionSearch}
                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <Button
                                    variant={hasActiveFilters || showFilters ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-10 gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                            {selectedTags.length + selectedDifficulties.length}
                                        </span>
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="h-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagToggle(tag)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                        >
                                            {tag}
                                            <X className="h-3 w-3" />
                                        </button>
                                    ))}
                                    {selectedDifficulties.map(difficulty => (
                                        <button
                                            key={difficulty}
                                            onClick={() => handleDifficultyToggle(difficulty)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white hover:opacity-90 transition-opacity ${difficulty === 'Easy' ? 'bg-green-600'
                                                    : difficulty === 'Medium' ? 'bg-yellow-600'
                                                        : 'bg-red-600'
                                                }`}
                                        >
                                            {difficulty}
                                            <X className="h-3 w-3" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Collapsible Filter Panel */}
                            {showFilters && (
                                <div className="border rounded-lg p-3 bg-white space-y-3">
                                    {/* Difficulty Filter */}
                                    <div>
                                        <span className="text-xs font-semibold text-gray-700 mb-2 block">Difficulty</span>
                                        <div className="flex flex-wrap gap-2">
                                            {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => {
                                                const count = (selectedCategoryId ? allQuestions.filter(q => q.category?.id === selectedCategoryId) : allQuestions)
                                                    .filter(q => q.difficulty === difficulty).length;
                                                return (
                                                    <button
                                                        key={difficulty}
                                                        onClick={() => handleDifficultyToggle(difficulty)}
                                                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${selectedDifficulties.includes(difficulty)
                                                                ? difficulty === 'Easy' ? 'bg-green-600 text-white'
                                                                    : difficulty === 'Medium' ? 'bg-yellow-600 text-white'
                                                                        : 'bg-red-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {difficulty} ({count})
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tags Filter */}
                                    {availableTags.length > 0 && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-700 mb-2 block">
                                                Tags ({availableTags.length})
                                            </span>
                                            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5">
                                                {availableTags.map(({ tag, count }) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleTagToggle(tag)}
                                                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${selectedTags.includes(tag)
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {tag} ({count})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {questionsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-500 mt-3 text-sm">Loading...</p>
                                    </div>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">No questions found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="mt-3"
                                            >
                                                Clear all filters
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                                    : "space-y-4"
                                }>
                                    {paginatedQuestions.map((question: QuestionWithTags) => (
                                        <div
                                            key={question.id}
                                            className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        {getQuestionTypeBadge(question.questionType)}
                                                        {question.difficulty && getDifficultyBadge(question.difficulty)}
                                                        <Badge
                                                            variant="outline"
                                                            className={question.isActive
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : 'bg-gray-50 text-gray-600 border-gray-200'}
                                                        >
                                                            {question.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-900 font-medium mb-2">
                                                        {question.content}
                                                    </p>

                                                    {/* NEW: Question Tags */}
                                                    {question.tags && question.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                                            {question.tags.map(tag => (
                                                                <button
                                                                    key={tag}
                                                                    onClick={() => handleTagToggle(tag)}
                                                                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${selectedTags.includes(tag)
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                                                        }`}
                                                                >
                                                                    #{tag}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="text-purple-600 font-medium">{question.category?.name || 'Uncategorized'}</span>
                                                        <span>·</span>
                                                        <span>{question.options.length} options</span>
                                                        <span>·</span>
                                                        <span className="text-green-600">
                                                            {question.options.filter(o => o.correct).length} correct
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <ActionBtn
                                                        icon={<Eye size={16} />}
                                                        onClick={() => {/* TODO: View modal */ }}
                                                        tooltipText="View Details"
                                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                                    />
                                                    <PermissionGate permission="QUESTION_UPDATE">
                                                        <ActionBtn
                                                            icon={<SquarePen size={16} />}
                                                            onClick={() => navigate(`/questions/${question.id}/edit`)}
                                                            tooltipText="Edit Question"
                                                            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                                                        />
                                                    </PermissionGate>
                                                    <PermissionGate permission="QUESTION_DELETE">
                                                        <ActionBtn
                                                            icon={<Trash2 size={16} />}
                                                            onClick={() => handleDelete(question.id)}
                                                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                                            tooltipText="Delete Question"
                                                        />
                                                    </PermissionGate>
                                                </div>
                                            </div>

                                            {/* Options Preview */}
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-xs font-semibold text-gray-600 mb-2">Options</p>
                                                <div className="space-y-1.5">
                                                    {question.options
                                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                                        .map((option, idx) => (
                                                            <div
                                                                key={option.id}
                                                                className={`text-sm px-3 py-2 rounded-md border ${option.correct
                                                                    ? 'bg-green-50 text-green-900 border-green-300 font-medium'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium ${option.correct
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-gray-300 text-gray-600'
                                                                        }`}>
                                                                        {String.fromCharCode(65 + idx)}
                                                                    </span>
                                                                    <span>{option.content}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredQuestions.length > 0 && totalPages > 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Showing {((safePage - 1) * pageSize) + 1}-{Math.min(safePage * pageSize, filteredQuestions.length)} of {filteredQuestions.length}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safePage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    return page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - safePage) <= 1;
                                                })
                                                .map((page, index, array) => {
                                                    const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                                                    return (
                                                        <div key={page} className="flex items-center">
                                                            {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                                            <Button
                                                                variant={safePage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(page)}
                                                                className="min-w-[2rem]"
                                                            >
                                                                {page}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safePage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
