import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useEditProject } from '../../hooks/useEditProjectContext';
import { useLazyLookupUserByEmailQuery } from '../../../profile/api/userApi';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import Button from '../../../../components/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/avatar';
import Loading from '../../../../components/Loading';
// --- ВИПРАВЛЕННЯ: Додано Check ---
import { Mail, Plus, UserPlus, X, Check } from 'lucide-react';

interface UserLookupData { id: string; email: string; name: string; avatarUrl: string; }

export const SectionTeam = () => {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

    const { collaborators, setCollaborators } = useEditProject();

    const [collaboratorEmail, setCollaboratorEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);

    const [
        lookupUser,
        { data: foundUser, isFetching: isUserFetching, error: userLookupError }
    ] = useLazyLookupUserByEmailQuery();

    const isCollaboratorTheAuthor = searchedUser && currentUserId && searchedUser.id === currentUserId;


    const handleSearchUser = () => {
        const email = collaboratorEmail.trim();
        if (email) {
            setSearchedUser(null);
            lookupUser(email);
        }
    };

    const handleAddCollaborator = () => {
        if (!searchedUser) return;

        if (isCollaboratorTheAuthor) {
            alert('Ви є автором цього проекту і не можете бути додані як співавтор.');
            return;
        }

        if (!collaborators.find(c => c.id === searchedUser.id)) {
            setCollaborators(prev => [...prev, {
                id: searchedUser.id,
                name: searchedUser.name,
                email: searchedUser.email,
                avatar: searchedUser.avatarUrl
            }]);
            setSearchedUser(null);
            setCollaboratorEmail('');
        }
    };

    const handleRemoveCollaborator = (id: string) => {
        setCollaborators(collaborators.filter(c => c.id !== id));
    };

    useEffect(() => {
        if (!isUserFetching) {
            if (foundUser) {
                setSearchedUser(foundUser);
            } else if (userLookupError) {
                setSearchedUser(null);
            }
        }
    }, [isUserFetching, foundUser, userLookupError]);

    return (
        <div className="pt-4 space-y-6">
            {/* Collaborator Search */}
            <div className="space-y-3">
                <Label htmlFor="collaboratorEmail">Email співавтора</Label>
                <div className="flex flex-col sm:flex-row gap-2"> {/* Адаптивний контейнер */}
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            id="collaboratorEmail"
                            placeholder="email@example.com"
                            value={collaboratorEmail}
                            onChange={(e) => setCollaboratorEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
                            disabled={isUserFetching}
                            className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 h-12"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSearchUser}
                        disabled={isUserFetching || !collaboratorEmail.trim()}
                        className="flex rounded-xl items-center justify-center hover:scale-105 bg-primary/90 hover:bg-primary gap-2 w-full sm:w-28 h-12 flex-shrink-0"
                    >
                        {isUserFetching ? <Loading className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                        {isUserFetching ? 'Пошук...' : 'Знайти'}
                    </Button>
                </div>
                {/* Search Result */}
                <div className="min-h-[70px] pt-2">
                    {searchedUser && (
                        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl shadow-md gap-3 ${isCollaboratorTheAuthor ? 'bg-destructive/10 border border-destructive/50' : 'bg-secondary/50 border border-primary/30'}`}>
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary">{searchedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className='min-w-0'>
                                    <p className="truncate font-medium">{searchedUser.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                                </div>
                            </div>

                            {/* Кнопка Додати/Додано/Автор */}
                            <Button
                                type="button"
                                onClick={handleAddCollaborator}
                                disabled={collaborators.some(c => c.id === searchedUser.id) || isCollaboratorTheAuthor}
                                className={`rounded-xl flex-shrink-0 gap-1 w-full sm:w-auto justify-center ${
                                    isCollaboratorTheAuthor
                                        ? 'bg-destructive/50 text-white cursor-not-allowed'
                                        : collaborators.some(c => c.id === searchedUser.id)
                                            ? 'bg-green-500/50 text-white cursor-not-allowed'
                                            : 'bg-green-500/90 hover:bg-green-600/90'
                                }`}
                            >
                                {isCollaboratorTheAuthor
                                    ? 'Ви є автором'
                                    : collaborators.some(c => c.id === searchedUser.id)
                                        ? <> <Check className="size-4" /> Додано </>
                                        : <> <Plus className="size-4" /> Додати </>
                                }
                            </Button>
                        </div>
                    )}
                    {!isUserFetching && userLookupError && collaboratorEmail.trim() && (
                        <p className="text-sm text-destructive mt-2">Користувача з такою поштою не знайдено.</p>
                    )}
                    {isCollaboratorTheAuthor && (
                        <p className="text-sm text-destructive mt-2">Ви є автором цього проекту, тому не можете бути співавтором.</p>
                    )}
                </div>
            </div>
            {/* Collaborators List */}
            {collaborators.length > 0 && (
                <div className="space-y-3">
                    <Label>Співавтори ({collaborators.length})</Label>
                    <div className="space-y-2">
                        {collaborators.map((collab) => (
                            <div key={collab.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
                                <Avatar className="size-10">
                                    <AvatarImage src={collab.avatar} alt={collab.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary"> {collab.name?.charAt(0)?.toUpperCase() || 'U'} </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium">{collab.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{collab.email}</p>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => handleRemoveCollaborator(collab.id)} className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0 p-2 h-auto">
                                    <X className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};