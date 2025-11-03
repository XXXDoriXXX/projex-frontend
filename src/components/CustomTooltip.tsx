
// Кастомний компонент для Tooltip, стилізований під вашу тему
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <p className="mb-2 text-base font-semibold text-foreground">
                    {label}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className="size-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">{entry.name}:</span>
                        </div>
                        <span className="font-bold text-foreground">
                            {parseFloat(entry.value).toFixed(1)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
export default CustomTooltip;