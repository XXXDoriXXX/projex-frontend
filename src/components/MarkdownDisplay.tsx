import {renderMarkdown} from "../shared/utils/utils.ts";

interface MarkdownDisplayProps {
    text: string,
    className?: string,
    truncate?: number
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({text, truncate, className}) => {
    const truncateMarkdown = (text: string, limit = truncate) => {
        if (text.length <= limit || limit === 0) return text;
        return text.slice(0, limit).trim() + "…";
    };
    const cleanHtml = renderMarkdown(truncateMarkdown(text));
    console.log("RenderMarkdown:", text);
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{__html: cleanHtml}}
        />
    );
};

