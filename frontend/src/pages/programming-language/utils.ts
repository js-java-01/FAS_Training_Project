/**
 * Shared utilities for Programming Language components
 */

/**
 * Returns Tailwind CSS classes for language name badge based on the language
 */
export const getLanguageBadgeStyle = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('java')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (lowerName.includes('python')) return 'bg-green-50 text-green-600 border-green-100';
    if (lowerName.includes('javascript')) return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    if (lowerName.includes('typescript')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (lowerName.includes('c++') || lowerName.includes('cpp')) return 'bg-red-50 text-red-600 border-red-100';
    if (lowerName.includes('c#') || lowerName.includes('csharp')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
};

/**
 * Returns Tailwind CSS classes for supported status badge
 */
export const getSupportedBadgeStyle = (isSupported: boolean): string => {
    return isSupported
        ? 'bg-green-50 text-green-600 border-green-100'
        : 'bg-gray-50 text-gray-600 border-gray-100';
};

/**
 * Formats a date string to a human-readable format
 */
export const formatDate = (date?: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * BR-PL-09: Display "N/A" if value is missing or empty
 */
export const displayValue = (value?: string): string => {
    return value && value.trim() ? value : 'N/A';
};
