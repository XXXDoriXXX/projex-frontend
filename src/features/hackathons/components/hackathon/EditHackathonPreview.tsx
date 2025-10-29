
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Calendar, Trophy} from 'lucide-react';
import {Badge} from "../../../../components/badge.tsx";

interface PreviewData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    themes: { id: string; name: string }[];
}

interface EditHackathonPreviewProps {
    data: PreviewData;
    renderMarkdown: (text: string) => string;
}

export function EditHackathonPreview({ data, renderMarkdown }: EditHackathonPreviewProps) {

    const getStatus = () => {
        try {
            const now = new Date();
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (!data.startDate || !data.endDate) {
                return { text: 'Вкажіть дати', color: 'text-muted-foreground' };
            }
            if (now < start) return { text: 'Незабаром', color: 'text-blue-400' };
            if (now > end) return { text: 'Завершено', color: 'text-yellow-400' };
            return { text: 'Триває', color: 'text-green-400' };
        } catch (e) {
            return { text: 'Невідома дата', color: 'text-muted-foreground' };
        }
    };

    const status = getStatus();

    const formatDate = (dateString: string) => {
        if (!dateString) return '...';
        try {
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: uk });
        } catch (e) {
            return 'Невірна дата';
        }
    };
    console.log("prev:",data.themes)
    return (
        <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Прев'ю Хакатону</h3>
            <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-3xl font-bold mb-3 break-words">
                    {data.title || 'Назва Хакатону'}
                </h2>

                <div className="flex items-center gap-2 mb-4">
                    <Trophy className={`size-4 ${status.color}`} />
                    <span className={`font-semibold ${status.color}`}>{status.text}</span>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(data.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(data.endDate)}</span>
                    </div>
                </div>

                <h4 className="font-semibold mb-2">Опис</h4>
                <div
                    className="prose prose-invert text-muted-foreground text-sm max-h-60 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                        __html: renderMarkdown(data.description) || '<p>Тут буде опис...</p>'
                    }}
                />

                {data.themes.length > 0 && (
                    <>
                        <h4 className="font-semibold mt-6 mb-2">Теми</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.themes.map((theme) => (
                                <Badge key={theme.id} className="bg-primary/10 text-primary border-primary/30">
                                    {theme.name}
                                </Badge>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}