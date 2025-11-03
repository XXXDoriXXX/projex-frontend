
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface SectionHeaderProps {
    title: string;
    icon: React.ElementType;
    isOpen: boolean;
    onClick: () => void;
}

export function EditSectionHeader({ title, icon: Icon, isOpen, onClick }: SectionHeaderProps) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between py-4 border-b border-border/50 hover:bg-secondary/20 -mx-4 px-4 transition-colors"
            aria-expanded={isOpen}
        >
            <div className="flex items-center gap-3">
                <Icon className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <ChevronRight
                className={`size-5 text-muted-foreground transition-transform ${
                    isOpen ? 'rotate-90' : 'rotate-0'
                }`}
            />
        </button>
    );
}