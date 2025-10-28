import {Mail, UserPlus, Users, X} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Input} from "../../../../components/input.tsx";
import Button from "../../../../components/Button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "../../../../components/avatar.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React, {useEffect, useState } from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";
import { useLazyLookupUserByEmailQuery, type UserLookupData } from "../../../profile/api/userApi.ts";

export function StepJudges(){

    const {
        judgeIds,
        setJudgeIds,
    } = useCreateHackathon();
    const [judgeEmail, setJudgeEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);
    const [
        lookupUser,
        { isFetching: isSearchingJudge, isError: judgeSearchError, data: foundUser }
    ] = useLazyLookupUserByEmailQuery();
    const handleSearchJudge = () => {
        const email = judgeEmail.trim();
        if (email) {
            lookupUser(email); // Викликаємо API
        }
    };
    useEffect(() => {
        if (foundUser) {
            setSearchedUser(foundUser);
        } else {
            setSearchedUser(null);
        }
    }, [foundUser]);
    const handleAddJudge = () => {
        if (searchedUser && !judgeIds.find(j => j.id === searchedUser.id)) {
            const newJudge = {
                id: searchedUser.id,
                name: searchedUser.name,
                email: searchedUser.email,
                avatar: searchedUser.avatarUrl,
            };
            setJudgeIds([...judgeIds, newJudge]);
            setJudgeEmail('');
            setSearchedUser(null);
        }
    };

    const handleRemoveJudge = (id: string) => {
        setJudgeIds(judgeIds.filter(c => c.id !== id));
    };
    return(<div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Users className="size-6 text-white" />
            </div>
            <div>
                <h2>Суддівська колегія</h2>
                <p className="text-muted-foreground">Додайте суддів хакатону</p>
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="judgeEmail">Email судді</Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="judgeEmail"
                        type="email"
                        placeholder="judge@example.com"
                        value={judgeEmail} // <--- Локальний стан
                        onChange={(e) => setJudgeEmail(e.target.value)} // <--- Локальний стан
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchJudge())} // <--- Локальний обробник
                        className="rounded-2xl bg-secondary/50 pl-10"
                        disabled={isSearchingJudge} // <--- Стан з RTK Query
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleSearchJudge}
                    disabled={isSearchingJudge || !judgeEmail.trim()}
                    className="flex rounded-xl hover:scale-110 bg-primary/90 hover:bg-primary gap-2"
                >
                    {/* {isSearchingJudge ? <Loading /> : <UserPlus className="size-6" />} */}
                    <UserPlus className="size-6" />
                    {isSearchingJudge ? 'Пошук...' : 'Знайти'}
                </Button>
            </div>
            <div className="min-h-10">
                {isSearchingJudge ? (
                    <p className="text-sm text-primary/70">Шукаємо користувача...</p>
                ) : searchedUser ? ( // <--- Локальний стан
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-primary/50 shadow-md">
                        <Avatar className="size-10">
                            <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {searchedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-semibold">{searchedUser.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddJudge} // <--- Локальний обробник
                            disabled={judgeIds.some(c => c.id === searchedUser.id)}
                            className="rounded-xl bg-primary/90 hover:bg-primary flex-shrink-0"
                        >
                            {judgeIds.some(c => c.id === searchedUser.id) ? 'Додано' : 'Додати'}
                        </Button>
                    </div>
                ) : judgeSearchError ? ( // <--- Стан з RTK Query
                    <p className="text-sm text-destructive">Користувач не знайдений.</p>
                ) : null}
            </div>
        </div>

        {judgeIds.length > 0 && (
            <div className="space-y-3">
                <Label>Судді ({judgeIds.length})</Label>
                <div className="space-y-2">
                    {judgeIds.map((judge) => (
                        <div
                            key={judge.id}
                            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border/50"
                        >
                            <Avatar className="size-10">
                                <AvatarImage src={judge.avatar} alt={judge.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {judge.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="truncate">{judge.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{judge.email}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveJudge(judge.id)}
                                className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>)
}