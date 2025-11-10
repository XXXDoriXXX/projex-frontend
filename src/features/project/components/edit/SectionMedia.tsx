import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useEditProject, type MediaFile } from '../../hooks/useEditProjectContext';
import Button from '../../../../components/Button';
import { Progress } from '../../../../components/Progress';
import { Badge } from '../../../../components/badge';
import { ImageIcon, Star, Upload, Video, X, Check } from 'lucide-react'
import type { RootState } from '../../../../store';
import { uploadMediaToServer } from '../../services/mediaUploadService';
import Loading from '../../../../components/Loading';

export const SectionMedia = () => {
    const { mediaFiles, setMediaFiles } = useEditProject();
    const token = useSelector((state: RootState) => state.auth.token);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const updateProgress = (fileId: string, progress: number) => {
        setMediaFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploadProgress: progress, uploadError: false } : f));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files) return;

        let isFirstFile = !mediaFiles.some(f => f.isMain && f.uploadProgress === 100);

        for (const file of Array.from(files)) {
            const tempId = `temp-${Date.now()}-${file.name}`;
            const localUrl = URL.createObjectURL(file);

            const newFilePlaceholder: MediaFile = {
                id: tempId, url: localUrl, type, name: file.name,
                isMain: isFirstFile && type === 'image',
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

                URL.revokeObjectURL(localUrl);

                setMediaFiles(prev => prev.map(f =>
                    f.id === tempId ? {
                        ...f,
                        id: response.id,
                        serverId: response.id,
                        url: response.url,
                        isUploading: false,
                        uploadProgress: 100,
                        isMain: isFirstFile || (f.isMain && f.id === tempId)
                    } : f
                ));
            } catch (err) {
                console.error("Помилка завантаження файлу:", err);
                setMediaFiles(prev => prev.map(f => {
                    if (f.id === tempId) {
                        URL.revokeObjectURL(localUrl);
                        return { ...f, isUploading: false, uploadError: true, uploadProgress: 0 };
                    }
                    return f;
                }));
            }
        }
        e.target.value = '';
    };

    const handleSetMainImage = (id: string) => {
        setMediaFiles(mediaFiles.map(file => ({ ...file, isMain: file.id === id })));
    };

    const handleRemoveMedia = (id: string) => {
        const fileToRemove = mediaFiles.find(f => f.id === id);
        if (fileToRemove && fileToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(fileToRemove.url);
        }

        const updatedFiles = mediaFiles.filter(file => file.id !== id);

        if (fileToRemove?.isMain && updatedFiles.length > 0) {
            const nextMainImage = updatedFiles.find(f => f.type === 'image' && !f.uploadError);
            if (nextMainImage) {
                setMediaFiles(updatedFiles.map(f => f.id === nextMainImage.id ? { ...f, isMain: true } : f));
                return;
            } else if (updatedFiles.length > 0) {
                setMediaFiles(updatedFiles.map((f, i) => i === 0 ? { ...f, isMain: true } : f));
                return;
            }
        }
        setMediaFiles(updatedFiles);
    };

    return (
        <div className="pt-4 space-y-6">

            <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="secondary" onClick={() => imageInputRef.current?.click()} className="flex-1 rounded-xl gap-2 h-12 bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50">
                    <Upload className="size-4" /> Завантажити фото
                </Button>
                <input ref={imageInputRef} id="file-image" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'image')} />

                <Button type="button" variant="secondary" onClick={() => videoInputRef.current?.click()} className="flex-1 rounded-xl gap-2 h-12 bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50">
                    <Video className="size-4" /> Завантажити відео
                </Button>
                <input ref={videoInputRef} id="file-video" type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
            </div>

            {mediaFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mediaFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`relative group rounded-2xl overflow-hidden border-2 aspect-video transition-all ${
                                file.isMain && !file.uploadError ? 'border-primary shadow-lg shadow-primary/30' : 'border-border/50'
                            } ${
                                file.uploadError ? 'bg-destructive/10' : 'bg-secondary/50'
                            }`}
                        >

                            <div className="w-full h-full">
                                {file.type === 'image' ? (
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                ) : (
                                    <video src={file.url} title={file.name} className="w-full h-full object-cover bg-black" controls={!file.isUploading && !file.uploadError} muted playsInline />
                                )}
                            </div>

                            {file.uploadError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/80 p-2 text-white">
                                    <p className="text-sm text-center mb-2">Помилка завантаження</p>
                                    <Button type="button" onClick={() => handleRemoveMedia(file.id)} variant="danger" className="bg-white/20 hover:bg-white/30 text-white rounded-xl h-auto p-2">
                                        <X className="size-4 mr-1" /> Видалити
                                    </Button>
                                </div>
                            )}

                            {file.isUploading && !file.uploadError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                    {file.uploadProgress < 100 ? (
                                        <div className="p-4 w-4/5">
                                            <p className="text-xs text-white mb-1">Завантаження... {Math.round(file.uploadProgress)}%</p>
                                            <Progress value={file.uploadProgress} className="h-1 bg-white/20" />
                                        </div>
                                    ) : (
                                        <div className="p-4 w-4/5 text-center text-white">
                                            <Loading className="size-6 animate-spin mx-auto" />
                                            <p className="text-xs mt-2">Обробка...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {!file.isUploading && !file.uploadError && (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoveMedia(file.id)}
                                        className="absolute top-2 left-2 z-10 rounded-full p-2 h-auto bg-black/50 hover:bg-destructive/70 transition-all shadow-lg text-white"
                                    >
                                        <X className="size-3" />
                                    </Button>

                                    {file.isMain ? (
                                        <div className="absolute top-2 right-2 z-10">
                                            <Badge className="bg-primary/90 backdrop-blur-sm gap-1">
                                                <Star className="size-3" /> Головне
                                            </Badge>
                                        </div>
                                    ) : (
                                        file.type === 'image' && (
                                            <Button
                                                type="button"
                                                onClick={() => handleSetMainImage(file.id)}
                                                className="absolute top-2 right-2 z-10 rounded-full h-4 p-1.5 bg-black/50 hover:bg-primary transition-all shadow-lg"
                                                title="Зробити головним зображенням"
                                            >
                                                <Star className="size-3" />
                                            </Button>
                                        )
                                    )}
                                </>
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