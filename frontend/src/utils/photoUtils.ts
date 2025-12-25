import type { Photo } from '../types';

export interface DateGroup {
    id: string; // e.g., "2023-12-20"
    label: string; // e.g., "Today", "Yesterday", "Sat, 20 Dec"
    date: Date;
    photos: Photo[];
}

export interface MonthGroup {
    month: string; // "Jan", "Feb", etc.
    monthNumber: number; // 0-11
    year: number;
    date: Date;
    sectionId: string; // ID to scroll to
    photoCount: number;
}

export interface YearGroup {
    year: number;
    months: MonthGroup[];
    totalPhotos: number;
}

export function groupPhotosByDate(photos: Photo[]): DateGroup[] {
    const groups: Record<string, DateGroup> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    photos.forEach(photo => {
        const date = new Date(photo.timestamp);
        // Normalize to start of day
        const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

        if (!groups[dayKey]) {
            let label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            // Check for Today/Yesterday
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (checkDate.getTime() === today.getTime()) {
                label = 'Today';
            } else if (checkDate.getTime() === yesterday.getTime()) {
                label = 'Yesterday';
            }

            groups[dayKey] = {
                id: `group-${dayKey}`,
                label,
                date: checkDate,
                photos: []
            };
        }

        groups[dayKey].photos.push(photo);
    });

    // Sort groups by date descending (newest first)
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function groupPhotosByYearMonth(photos: Photo[]): YearGroup[] {
    const dateGroups = groupPhotosByDate(photos);
    const yearMonthMap: Record<string, MonthGroup> = {};

    // Group by year-month
    dateGroups.forEach(group => {
        const year = group.date.getFullYear();
        const month = group.date.getMonth();
        const key = `${year}-${month}`;

        if (!yearMonthMap[key]) {
            const monthDate = new Date(year, month, 1);
            yearMonthMap[key] = {
                month: monthDate.toLocaleString('default', { month: 'short' }),
                monthNumber: month,
                year,
                date: monthDate,
                sectionId: group.id, // Use first day's section ID
                photoCount: 0
            };
        }

        yearMonthMap[key].photoCount += group.photos.length;
    });

    // Convert to year groups
    const yearMap: Record<number, YearGroup> = {};

    Object.values(yearMonthMap).forEach(monthGroup => {
        if (!yearMap[monthGroup.year]) {
            yearMap[monthGroup.year] = {
                year: monthGroup.year,
                months: [],
                totalPhotos: 0
            };
        }

        yearMap[monthGroup.year].months.push(monthGroup);
        yearMap[monthGroup.year].totalPhotos += monthGroup.photoCount;
    });

    // Sort years descending, months descending within each year
    const yearGroups = Object.values(yearMap).sort((a, b) => b.year - a.year);
    yearGroups.forEach(yearGroup => {
        yearGroup.months.sort((a, b) => b.monthNumber - a.monthNumber);
    });

    return yearGroups;
}
