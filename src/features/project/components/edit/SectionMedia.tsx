import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useEditProject, type MediaFile } from '../../hooks/useEditProjectContext';
import Button from '../../../../components/Button';
import { Progress } from '../../../../components/Progress';
import { Badge } from '../../../../components/badge';
import { ImageIcon, Star, Upload, Video, X } from 'lucide-react';
import type { RootState } from '../../../../store';
import { uploadMediaToServer } from '../../services/mediaUploadService';
import Loading from '../../../../components/Loading'; // <-- 1. ДОДАЙТЕ ЦЕЙ ІМПОРТ

export const SectionMedia = () => {
    const { mediaFiles, setMediaFiles } = useEditProject();
    const token = useSelector((state: RootState) => state.auth.token);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // ... (Функції updateProgress, handleFileChange, handleSetMainImage, handleRemoveMedia - БЕЗ ЗМІН) ...
    const updateProgress = (fileId: string, progress: number) => {
        setMediaFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploadProgress: progress, uploadError: false } : f));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files) return;

        let isFirstFile = mediaFiles.length === 0 && !mediaFiles.some(f => f.isMain);

        for (const file of Array.from(files)) {
            const tempId = `temp-${Date.now()}-${file.name}`;
            const localUrl = URL.createObjectURL(file);

            const newFilePlaceholder: MediaFile = {
                id: tempId, url: localUrl, type, name: file.name, isMain: isFirstFile,
                serverId: undefined, uploadProgress: 0, isUploading: true, uploadError: false,
            };
            setMediaFiles(prev => [...prev, newFilePlaceholder]);
            isFirstFile = false;

            try {
                if (!token) {
                    throw new Error("Користувач не автентифікований");
                }
                const response = await uploadMediaToServer(
                    file,
                    token,
                    (progress) => {
                        updateProgress(tempId, progress);
                    }
                );
                setMediaFiles(prev => prev.map(f =>
                    f.id === tempId ? {
                        ...f,
                        id: response.id,
                        serverId: response.id,
                        url: response.url,
                        isUploading: false,
                        uploadProgress: 100,
                    } : f
                ));
            } catch (err) {
                console.error("Помилка завантаження файлу:", err);
                setMediaFiles(prev => prev.map(f =>
                    f.id === tempId ? { ...f, isUploading: false, uploadError: true, uploadProgress: 0 } : f
                ));
            }
        }
    };

    const handleSetMainImage = (id: string) => {
        setMediaFiles(mediaFiles.map(file => ({ ...file, isMain: file.id === id })));
    };

    const handleRemoveMedia = (id: string) => {
        const fileToRemove = mediaFiles.find(f => f.id === id);
        const updatedFiles = mediaFiles.filter(file => file.id !== id);
        if (updatedFiles.length > 0 && fileToRemove?.isMain && !updatedFiles.some(f => f.isMain)) {
            updatedFiles[0].isMain = true;
        }
        setMediaFiles(updatedFiles);
    };

    return (
        <div className="pt-4 space-y-6">
            {/* ... (Кнопки завантаження - БЕЗ ЗМІН) ... */}
            <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => imageInputRef.current?.click()} className="flex-1 rounded-2xl bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50 gap-2 h-12">
                    <Upload className="size-4" /> Завантажити фото
                </Button>
                <input ref={imageInputRef} id="file-image" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                <Button type="button" variant="ghost" onClick={() => videoInputRef.current?.click()} className="flex-1 rounded-2xl bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50 gap-2 h-12">
                    <Video className="size-4" /> Завантажити відео
                </Button>
                <input ref={videoInputRef} id="file-video" type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
            </div>

            {/* --- 2. ОНОВІТЬ ЦЕЙ БЛОК ВЕРСТКИ --- */}
            {mediaFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaFiles.map((file) => (
                        <div key={file.id} className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${file.isMain ? 'border-primary shadow-lg shadow-primary/30' : 'border-border/50'} ${file.uploadError ? 'border-destructive' : 'bg-secondary/50'}`}>

                            {/* Медіа (img/video) */}
                            <div className="aspect-video">
                                {file.type === 'image' ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <video src={file.url} title={file.name} className="w-full h-full object-cover bg-black" controls muted playsInline />}
                            </div>

                            {/* --- ОНОВЛЕНА ЛОГІКА ОВЕРЛЕЇВ --- */}

                            {/* Помилка (має вищий пріоритет) */}
                            {file.uploadError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2">
                                    <p className="text-xs text-white text-center">Помилка завантаження.</p>
                                </div>
                            )}

                            {/* Завантаження (включає прогрес + обробку) */}
                            {file.isUploading && !file.uploadError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                    {file.uploadProgress < 100 ? (
                                        // 1. Показуємо прогрес-бар (0-99%)
                                        <div className="p-4 w-4/5">
                                            <p className="text-xs text-white mb-1">Завантаження... {Math.round(file.uploadProgress)}%</p>
                                            <Progress value={file.uploadProgress} className="h-1 bg-white/20" />
                                        </div>
                                    ) : (
                                        // 2. 100% завантажено, чекаємо на відповідь сервера
                                        <div className="p-4 w-4/5 text-center">
                                            <Loading />
                                            <p className="text-xs text-white mt-2">Обробка...</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Кнопки (тільки при успішному завершенні) */}
                            {!file.isUploading && !file.uploadError && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!file.isMain && file.type === 'image' && (
                                        <Button type="button" onClick={() => handleSetMainImage(file.id)} className="rounded-xl bg-primary/90 hover:bg-primary gap-1">
                                            <Star className="size-3" /> Головне
                                        </Button>
                                    )}
                                    <Button type="button" variant="ghost" onClick={() => handleRemoveMedia(file.id)} className="rounded-xl">
                                        <X className="size-3" />
                                    </Button>
                                </div>
                            )}
                            {/* ------------------------------------- */}

                            {/* Бедж "Головне" */}
                            {file.isMain && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="bg-primary/90 backdrop-blur-sm gap-1">
                                        <Star className="size-3" /> Головне
                                    </Badge>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center">
                    <ImageIcon className="size-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Медіа файли не додані</p>
                </div>
            )}
        </div>
    );
};