
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {marked} from "marked";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs));
}
export const renderMarkdown = (text: string) => marked.parse(text);