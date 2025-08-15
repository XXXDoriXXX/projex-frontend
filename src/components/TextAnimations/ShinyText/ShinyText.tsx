/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import React from 'react';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number; // швидкість в секундах
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '' }) => {
    const animationStyle = disabled
        ? undefined
        : {
            animation: `shine ${speed}s linear infinite`,
        };

    return (
        <div
            className={`text-[#b5b5b5a4] bg-clip-text inline-block ${className}`}
            style={{
                backgroundImage:
                    'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                ...animationStyle,
            }}
        >
            {text}
        </div>
    );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };