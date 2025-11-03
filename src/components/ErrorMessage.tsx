
import {AlertCircle, AlertTriangle, Info, RefreshCw, X} from "lucide-react";
import Button from "./Button.tsx";


interface ErrorMessageProps {
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
    onRetry?: () => void;
    onDismiss?: () => void;
    fullScreen?: boolean;
}

export function ErrorMessage({
                                 title,
                                 message,
                                 type = 'error',
                                 onRetry,
                                 onDismiss,
                                 fullScreen = false
                             }: ErrorMessageProps) {
    const config = {
        error: {
            icon: AlertCircle,
            title: title || 'Помилка',
            iconColor: 'text-destructive',
            bgGradient: 'from-destructive/20 via-destructive/10 to-transparent',
            borderColor: 'border-destructive/50'
        },
        warning: {
            icon: AlertTriangle,
            title: title || 'Увага',
            iconColor: 'text-yellow-500',
            bgGradient: 'from-yellow-500/20 via-yellow-500/10 to-transparent',
            borderColor: 'border-yellow-500/50'
        },
        info: {
            icon: Info,
            title: title || 'Інформація',
            iconColor: 'text-cyan-500',
            bgGradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
            borderColor: 'border-cyan-500/50'
        }
    };

    const { icon: Icon, title: defaultTitle, iconColor, bgGradient, borderColor } = config[type];

    const content = (
        <div className={`relative bg-card/50 backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-2xl max-w-md w-full`}>
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} rounded-3xl`} />

            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 size-8 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors z-10"
                >
                    <X className="size-4" />
                </button>
            )}

            <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`size-16 bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center border ${borderColor}`}>
                        <Icon className={`size-8 ${iconColor}`} />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-center mb-2">{defaultTitle}</h3>

                {/* Message */}
                <p className="text-center text-muted-foreground mb-6">
                    {message}
                </p>

                {/* Actions */}
                {onRetry && (
                    <div className="flex gap-3">
                        <Button
                            onClick={onRetry}
                            className="flex rounded-xl gap-2"
                            variant={'ghost'}
                        >
                            <RefreshCw className="size-6" />
                            Спробувати знову
                        </Button>
                        {onDismiss && (
                            <Button
                                onClick={onDismiss}
                                className="flex-1 rounded-xl"
                                variant="ghost"
                            >
                                Закрити
                            </Button>
                        )}
                    </div>
                )}

                {!onRetry && onDismiss && (
                    <Button
                        onClick={onDismiss}
                        className="w-full rounded-xl"
                        variant="ghost"
                    >
                        Зрозуміло
                    </Button>
                )}
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                {content}
            </div>
        );
    }

    return content;
}


export default ErrorMessage;
