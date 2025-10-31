import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    icon: React.ElementType; // 'any' замінено на 'React.ElementType'
    isOpen: boolean;
    onClick: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, isOpen, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left flex items-center justify-between py-4 border-b border-border/50 hover:bg-secondary/20 -mx-4 px-4 transition-colors"
    >
        <div className="flex items-center gap-3">
            <Icon className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ChevronRight className={`size-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
    </button>
);