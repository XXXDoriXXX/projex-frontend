import {Loader2} from "lucide-react";

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl',
    text?: string,
    fullScreen?: boolean,
    className?: string
}

const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-12'
};

function Loading({size = 'md', text, fullScreen = false, className=""}: LoadingSpinnerProps) {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className="relative">
                {/* Animated gradient ring */}
                <div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-purple-600 to-pink-500 opacity-20 blur-xl animate-pulse"/>

                {/* Spinner */}
                <Loader2
                    className={`${sizeClasses[size]} text-primary animate-spin relative z-10`}
                />
            </div>

            {text && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

export default Loading;