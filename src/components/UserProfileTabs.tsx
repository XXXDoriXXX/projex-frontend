
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Типізація для нашої властивості position
interface HighlightProps {
    left: number;
    width: number;
}

// Новий інтерфейс, який дозволяє передавати вкладки
interface UserProfileTabsProps {
    tabs: string[];
}

const UserProfileTabs: React.FC<UserProfileTabsProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0] || ''); // Встановлюємо перший елемент як активний за замовчуванням
    const [highlightProps, setHighlightProps] = useState<HighlightProps>({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const updateHighlight = (label: string) => {
        const container = containerRef.current;
        if (!container) return;
        const el = container.querySelector<HTMLButtonElement>(`[data-label="${label}"]`);
        if (el) {
            setHighlightProps({ left: el.offsetLeft, width: el.offsetWidth });
        }
    };

    // Оновлюємо позицію при зміні активної вкладки
    useEffect(() => {
        updateHighlight(activeTab);
    }, [activeTab]);

    // Оновлюємо позицію при першому рендері або зміні розміру вікна
    useEffect(() => {
        const handleResize = () => updateHighlight(activeTab);
        window.addEventListener('resize', handleResize);
        updateHighlight(activeTab); // Викликаємо один раз для початкового стану
        return () => window.removeEventListener('resize', handleResize);
    }, [tabs]);


    return (
        <div
            ref={containerRef}
            className="
                relative flex items-center gap-2 p-1 rounded-full
                bg-gray-800/50 border border-white/10
                shadow-lg
                w-min
            "
        >
            {/* Анімований об'єкт, який переміщається за активною вкладкою */}
            <motion.div
                className="
                    absolute top-1/2 -translate-y-1/2 h-8 rounded-full
                    bg-purple-600 shadow-lg z-0 transition-transform duration-500
                    opacity-90
                "
                animate={{
                    left: highlightProps.left,
                    width: highlightProps.width,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 45 }}
            />
            {tabs.map((tab) => (
                <button
                    key={tab}
                    data-label={tab} // Додаємо data-атрибут для пошуку елемента
                    onClick={() => setActiveTab(tab)}
                    className={`
                        relative px-6 py-2 rounded-full font-semibold z-10
                        transition-colors duration-300
                        ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}
                    `}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default UserProfileTabs;