
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs));
}
export const renderMarkdown = (text: string) => {
    const html = text
        .replace(/^### (.*$)/gim, '<h3 class="mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="mt-4 mb-2">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-secondary/70 px-2 py-1 rounded text-primary">$1</code>')
        .replace(/\n\n/g, '</p><p class="mb-2">')
        .replace(/\n/g, '<br>');

    return `<p class="mb-2">${html}</p>`;
};