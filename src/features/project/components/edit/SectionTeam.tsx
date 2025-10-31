import React, { useState, useEffect } from 'react';
import { useEditProject } from '../../hooks/useEditProjectContext';
import { useLazyLookupUserByEmailQuery } from '../../../profile/api/userApi';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import Button from '../../../../components/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/avatar';
import Loading from '../../../../components/Loading';
import { Mail, Plus, UserPlus, X } from 'lucide-react';

interface UserLookupData { id: string; email: string; name: string; avatarUrl: string; }

export const SectionTeam = () => {
    const { collaborators, setCollaborators } = useEditProject();

    const [collaboratorEmail, setCollaboratorEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);

    const [
        lookupUser,
        { data: foundUser, isFetching: isUserFetching, error: userLookupError }
    ] = useLazyLookupUserByEmailQuery();

    const handleSearchUser = () => {
        const email = collaboratorEmail.trim();
        if (email) {
            setSearchedUser(null);
            lookupUser(email);
        }
    };

    const handleAddCollaborator = () => {
        if (searchedUser && !collaborators.find(c => c.id === searchedUser.id)) {
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
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            id="collaboratorEmail"
                            placeholder="email@example.com"
                            value={collaboratorEmail}
                            onChange={(e) => setCollaboratorEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
                            disabled={isUserFetching}
                            className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10"
                        />
                    </div>
                    <Button type="button" variant="secondary" onClick={handleSearchUser} disabled={isUserFetching || !collaboratorEmail.trim()} className="flex rounded-xl items-center justify-center hover:scale-105 bg-primary/90 hover:bg-primary gap-2 w-28">
                        {isUserFetching ? <Loading /> : <UserPlus className="size-4" />}
                        {isUserFetching ? 'Пошук...' : 'Знайти'}
                    </Button>
                </div>
                {/* Search Result */}
                <div className="min-h-[70px] pt-2">
                    {searchedUser && (
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-2xl border border-primary/30 shadow-md">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary">{searchedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="truncate">{searchedUser.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddCollaborator}
                                disabled={collaborators.some(c => c.id === searchedUser.id)}
                                className="rounded-xl flex-shrink-0 bg-green-500/90 hover:bg-green-600/90 gap-1"
                            >
                                <Plus className="size-4" />
                                {collaborators.some(c => c.id === searchedUser.id) ? 'Додано' : 'Додати'}
                            </Button>
                        </div>
                    )}
                    {!isUserFetching && userLookupError && collaboratorEmail.trim() && (
                        <p className="text-sm text-destructive mt-2">Користувача з такою поштою не знайдено.</p>
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
                                    <p className="truncate">{collab.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{collab.email}</p>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => handleRemoveCollaborator(collab.id)} className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0">
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