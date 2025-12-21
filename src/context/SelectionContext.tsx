import React, { createContext, useContext, useState, useCallback } from 'react';

interface SelectionContextType {
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
    selectMultiple: (ids: string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectMultiple = useCallback((ids: string[]) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.add(id));
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isSelected = useCallback((id: string) => {
        return selectedIds.has(id);
    }, [selectedIds]);

    return (
        <SelectionContext.Provider value={{ selectedIds, toggleSelection, selectMultiple, clearSelection, isSelected }}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    const context = useContext(SelectionContext);
    if (context === undefined) {
        throw new Error('useSelection must be used within a SelectionProvider');
    }
    return context;
}
