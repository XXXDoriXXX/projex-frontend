
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem("user");
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white">
                <p className="text-xl mb-4">Користувача не знайдено</p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
                >
                    Увійти
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-black/40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 w-full max-w-md transition-transform duration-500 hover:scale-[1.02]">
                <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={`${user.username} avatar`}
                    className="w-32 h-32 rounded-full border-4 border-white/50 object-cover transition-all duration-300 hover:scale-110 hover:border-white hover:shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                />
                <h1 className="text-2xl font-semibold text-white">{user.username}</h1>
                <p className="text-white/70">{user.email}</p>
                <button
                    onClick={() => alert("Редагувати профіль")}
                    className="px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300"
                >
                    Редагувати профіль
                </button>
            </div>
        </div>
    );
};

export default Profile;
