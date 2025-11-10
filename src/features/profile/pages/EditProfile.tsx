import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useUpdateUserAvatarMutation,
    useAddSocialMediaLinkMutation,
    useDeleteSocialMediaLinkMutation, useResetPasswordMutation, useSendPasswordResetCodeMutation,
} from '../api/userApi';
import {
    useGetProfileQuery,
} from '../../auth/api/authApi';

import { Upload, Save, X, Plus, Loader2, User, Link as LinkIcon, Github, Twitter, Linkedin, Globe, Mail, Key, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/Button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { Textarea } from '../../../components/textarea';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import type { RootState } from '../../../store.ts';

const AVAILABLE_PLATFORMS = [
    { value: 'github', label: 'GitHub', icon: Github },
    { value: 'twitter', label: 'Twitter / X', icon: Twitter },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'website', label: 'Personal Website', icon: Globe },
    { value: 'other', label: 'Other', icon: LinkIcon },
];

const EditProfile = () => {
    const navigate = useNavigate();
    const { username: routeUsername } = useParams<{ username: string }>();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: userProfile, isLoading, isError } = useGetProfileQuery(undefined, {
        skip: !token,
    });
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
    const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateUserAvatarMutation();
    const [addSocialLink, { isLoading: isAddingLink }] = useAddSocialMediaLinkMutation();
    const [deleteSocialLink, { isLoading: isDeletingLink }] = useDeleteSocialMediaLinkMutation();
    const [sendResetCode, { isLoading: isSendingCode }] = useSendPasswordResetCodeMutation();
    const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

    const [newLinkPlatform, setNewLinkPlatform] = useState(AVAILABLE_PLATFORMS[0].value);
    const [newLinkUrl, setNewLinkUrl] = useState('');

    const [isResetMode, setIsResetMode] = useState(false);
    const [resetStep, setResetStep] = useState<'initial' | 'codeSent'>('initial');
    const [resetCode, setResetCode] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    useEffect(() => {
        if (currentUser && routeUsername && currentUser.username !== routeUsername) {
            navigate(`/profile/${routeUsername}`);
            return;
        }
        const dataToUse = userProfile || currentUser;
        if (dataToUse) {
            setUsername(dataToUse.username);
            setBio(dataToUse.bio || '');
            setAvatarPreview(dataToUse.avatarUrl);
        }
    }, [currentUser, userProfile, routeUsername, navigate]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Файл занадто великий (макс 5MB)");
                return;
            }
            setSelectedAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSendResetCode = async () => {
        if (!currentPassword) {
            toast.warning("Введіть поточний пароль");
            return;
        }
        try {
            await sendResetCode({ password: currentPassword }).unwrap();
            setResetStep('codeSent');
            toast.success("Код відправлено на ваш Email", { icon: <Mail className="size-4" /> });
        } catch (error: any) {
            toast.error(error?.data?.message || "Помилка відправки коду");
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Паролі не співпадають");
            return;
        }

        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!complexityRegex.test(newPassword)) {
            toast.error("Пароль не відповідає вимогам безпеки");
            return;
        }

        try {
            await resetPassword({ code: resetCode, newPassword }).unwrap();
            toast.success("Пароль успішно змінено!");
            setIsResetMode(false);
            setResetStep('initial');
            setCurrentPassword('');
            setResetCode('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error?.data?.error?.message || error?.data?.message || "Помилка зміни пароля");
        }
    };

    const handleAddSocialLink = async () => {
        if (!newLinkUrl.trim()) return;
        let formattedUrl = newLinkUrl;
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `https://${formattedUrl}`;
        }
        try {
            await addSocialLink({ platform: newLinkPlatform, url: formattedUrl }).unwrap();
            setNewLinkUrl('');
            toast.success("Посилання додано");
        } catch (error) {
            toast.error("Не вдалося додати посилання");
        }
    };

    const handleDeleteSocialLink = async (id: string) => {
        try {
            await deleteSocialLink({ socialMediaId: id }).unwrap();
            toast.success("Посилання видалено");
        } catch (error) {
            toast.error("Не вдалося видалити посилання");
        }
    };

    const handleSubmit = async () => {
        if (!username.trim()) {
            toast.error("Ім'я користувача обов'язкове");
            return;
        }
        try {
            if (selectedAvatarFile) {
                const formData = new FormData();
                formData.append('avatar', selectedAvatarFile);
                await updateAvatar(formData).unwrap();
            }
            if (username !== (userProfile?.username || currentUser?.username) || bio !== (userProfile?.bio || currentUser?.bio)) {
                await updateProfile({ username, bio }).unwrap();
            }
            toast.success("Профіль оновлено!");
            navigate(`/profile/${username}`);
        } catch (error: any) {
            toast.error(error?.data?.message || "Помилка оновлення профілю");
        }
    };

    const isGlobalLoading = isUpdatingProfile || isUpdatingAvatar;

    if (isLoading) return <Loading fullScreen text="Завантаження..." />;
    if (isError) return <ErrorMessage fullScreen title="Помилка" message="Не вдалося завантажити профіль." onDismiss={() => navigate(-1)} />;

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex justify-center p-4">
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="fixed top-20 right-20 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-20 size-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-3xl relative z-10 mt-16 mb-24">

                <div className="sticky top-4 z-30 mb-6 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-wrap justify-between items-center gap-3">
                    <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 truncate">
                        <User className="size-5 sm:size-6 text-primary flex-shrink-0" />
                        <span className="truncate">Редагування профілю</span>
                    </h1>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            disabled={isGlobalLoading}
                            className="hidden sm:flex"
                        >
                            Скасувати
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isGlobalLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                        >
                            {isGlobalLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Зберегти
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-8 shadow-xl space-y-8">
                    <section className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={avatarPreview || '/default-avatar.png'}
                                alt="Avatar preview"
                                className="size-32 sm:size-40 rounded-full object-cover border-4 border-primary/30 shadow-lg transition duration-300 group-hover:border-primary/60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                <Upload className="size-8 text-white" />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        <div className="text-center sm:text-left space-y-2 flex-1">
                            <h3 className="text-lg font-semibold">Фото профілю</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto sm:mx-0">
                                Натисніть на фото, щоб змінити. Рекомендується квадратне зображення (PNG, JPG) до 5MB.
                            </p>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="mt-2 sm:hidden w-full">
                                <Upload className="size-4 mr-2" /> Вибрати файл
                            </Button>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Нікнейм *</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-gray-900/50 border-white/10 focus-visible:ring-primary"
                                    placeholder="Ваш унікальний нікнейм"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative opacity-75">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                                    <Input
                                        id="email"
                                        value={userProfile?.email || currentUser?.email || ''}
                                        disabled
                                        className="pl-10 bg-gray-900/30 border-white/5 cursor-not-allowed text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="bio">Про себе</Label>
                                <span className="text-xs text-gray-500">{bio.length}/500</span>
                            </div>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="min-h-[120px] bg-gray-900/50 border-white/10 focus-visible:ring-primary resize-none"
                                placeholder="Розкажіть про свої навички, інтереси..."
                                maxLength={500}
                            />
                        </div>
                    </section>

                    <section className="pt-6 border-t border-white/10 space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <LinkIcon className="size-5 text-primary" />
                            Соціальні мережі
                        </h3>

                        <div className="space-y-3">
                            {userProfile?.socialLinks?.map((link) => {
                                const PlatformIcon = AVAILABLE_PLATFORMS.find(p => p.value === link.platform.toLowerCase())?.icon || LinkIcon;
                                return (
                                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-900/30 border border-white/5 rounded-xl group hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-gray-800/50 rounded-lg text-gray-300 group-hover:text-primary transition-colors">
                                                <PlatformIcon className="size-5" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium capitalize">{link.platform}</p>
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-primary/70 truncate block hover:underline">
                                                    {link.url}
                                                </a>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDeleteSocialLink(link.id)}
                                            disabled={isDeletingLink}
                                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 h-auto aspect-square rounded-lg"
                                        >
                                            {isDeletingLink ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
                            <Label className="text-sm font-medium">Додати нове посилання</Label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={newLinkPlatform}
                                    onChange={(e) => setNewLinkPlatform(e.target.value)}
                                    className="bg-gray-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none sm:w-40 transition-all"
                                >
                                    {AVAILABLE_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                <Input
                                    placeholder="https://..."
                                    value={newLinkUrl}
                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                    className="bg-gray-900/50 border-white/10 rounded-xl flex-1"
                                />
                                <Button onClick={handleAddSocialLink} disabled={!newLinkUrl.trim() || isAddingLink} className="sm:w-auto w-full">
                                    {isAddingLink ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                    <span className="sm:hidden ml-2">Додати</span>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="pt-6 border-t border-white/10 space-y-6" id="security">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Lock className="size-5 text-primary" />
                            Безпека
                        </h3>

                        {!isResetMode ? (
                            <Button
                                variant="secondary"
                                onClick={() => setIsResetMode(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/5 hover:border-primary/30 transition-all"
                            >
                                <Key className="size-4" />
                                Змінити пароль
                            </Button>
                        ) : (
                            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-md font-medium flex items-center gap-2">
                                        <Key className="size-4 text-primary" />
                                        Зміна пароля
                                    </h4>
                                    <Button variant="ghost" size="sm" onClick={() => { setIsResetMode(false); setResetStep('initial'); setCurrentPassword(''); }} className="hover:bg-white/5 rounded-full p-1 h-auto">
                                        <X className="size-5" />
                                    </Button>
                                </div>

                                {resetStep === 'initial' ? (
                                    <div className="space-y-4 max-w-md">
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Для безпеки, спочатку підтвердіть свою особу. Введіть поточний пароль, щоб отримати код підтвердження на <span className="text-white font-medium">{userProfile?.email || currentUser?.email}</span>.
                                        </p>
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassInitial">Поточний пароль</Label>
                                            <Input
                                                id="currentPassInitial"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="bg-gray-900/50 border-white/10"
                                            />
                                        </div>
                                        <Button onClick={handleSendResetCode} disabled={isSendingCode || !currentPassword} className="w-full">
                                            {isSendingCode ? <Loader2 className="size-4 animate-spin mr-2" /> : <Mail className="size-4 mr-2" />}
                                            Відправити код підтвердження
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
                                            <AlertCircle className="size-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-200 space-y-1">
                                                <p className="font-medium">Вимоги до нового пароля:</p>
                                                <ul className="list-disc list-inside opacity-80">
                                                    <li>Мінімум 8 символів</li>
                                                    <li>Велика літера (A-Z) та мала літера (a-z)</li>
                                                    <li>Цифра (0-9) та спец. символ (!@#$...)</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="resetCode">Код підтвердження з Email</Label>
                                                <Input
                                                    id="resetCode"
                                                    value={resetCode}
                                                    onChange={(e) => setResetCode(e.target.value)}
                                                    placeholder="Наприклад: 123456"
                                                    className="bg-gray-900/50 border-white/10 font-mono tracking-widest text-center text-lg"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="newPass">Новий пароль</Label>
                                                    <Input
                                                        id="newPass"
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="bg-gray-900/50 border-white/10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPass">Підтвердження пароля</Label>
                                                    <Input
                                                        id="confirmPass"
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="bg-gray-900/50 border-white/10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={handleResetPassword} disabled={isResettingPassword || !resetCode || !newPassword} className="w-full py-3 text-base">
                                            {isResettingPassword ? <Loader2 className="size-5 animate-spin mr-2" /> : <CheckCircle2 className="size-5 mr-2" />}
                                            Змінити пароль
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
};

export default EditProfile;