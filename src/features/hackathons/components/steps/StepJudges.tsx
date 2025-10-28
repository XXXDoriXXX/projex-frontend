import {Mail, UserPlus, Users, X} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Input} from "../../../../components/input.tsx";
import Button from "../../../../components/Button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "../../../../components/avatar.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";

export function StepJudges(){

    const {
        judgeEmail,
        setJudgeEmail,
        isSearchingJudge,
        searchedJudge,
        judgeSearchError,
        judgeIds,
        handleSearchJudge,
        handleAddJudge,
        handleRemoveJudge
    } = useCreateHackathon();

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
                        value={judgeEmail}
                        onChange={(e) => setJudgeEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchJudge())}
                        className="rounded-2xl bg-secondary/50 pl-10"
                        disabled={isSearchingJudge}
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
                ) : searchedJudge ? (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-primary/50 shadow-md">
                        <Avatar className="size-10">
                            <AvatarImage src={searchedJudge.avatarUrl} alt={searchedJudge.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {searchedJudge.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-semibold">{searchedJudge.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{searchedJudge.email}</p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddJudge}
                            disabled={judgeIds.some(c => c.id === searchedJudge.id)}
                            className="rounded-xl bg-primary/90 hover:bg-primary flex-shrink-0"
                        >
                            {judgeIds.some(c => c.id === searchedJudge.id) ? 'Додано' : 'Додати'}
                        </Button>
                    </div>
                ) : judgeSearchError ? (
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