import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {type SimpleUser, useGetFollowersQuery, useGetFollowingQuery} from "../api/userApi.ts";
import Button from "../../../components/Button.tsx";
import Loading from "../../../components/Loading.tsx";

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    type: 'followers' | 'following';
}

const UserListModal = ({ isOpen, onClose, userId, type }: UserListModalProps) => {
    const navigate = useNavigate();

    const useQueryHook = type === 'followers' ? useGetFollowersQuery : useGetFollowingQuery;
    const { data: users, isLoading, isError } = useQueryHook(userId, {
        skip: !isOpen,
    });

    const title = type === 'followers' ? 'Підписники' : 'Підписки';

    const handleUserClick = (username: string) => {
        onClose();
        navigate(`/profile/${username}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
                        >

                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <UserIcon className="size-5 text-primary" />
                                    {title}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full p-1 h-auto hover:bg-white/10">
                                    <X className="size-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {isLoading ? (
                                    <div className="py-10"><Loading /></div>
                                ) : isError ? (
                                    <div className="text-center py-10 text-red-400">Помилка завантаження списку</div>
                                ) : users && users.length > 0 ? (
                                    <div className="space-y-1">
                                        {users.map((user: SimpleUser) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => handleUserClick(user.username)}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                                            >
                                                <img
                                                    src={user.avatarUrl || '/default-avatar.png'}
                                                    alt={user.username}
                                                    className="size-10 rounded-full object-cover border border-white/10 group-hover:border-primary/50 transition-colors"
                                                />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                        {user.username}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        Список порожній
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserListModal;