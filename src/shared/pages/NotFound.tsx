
import { useNavigate } from "react-router-dom";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
            <h1
                className="text-[10rem] md:text-[15rem] font-extrabold mb-4
                           bg-clip-text text-transparent bg-gradient-to-r from-primary via-red-500 to-pink-500
                           animate-pulse tracking-widest"
            >
                404
            </h1>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary animate-bounce">
                Ой лишенько!
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-lg">
                Схоже, ця сторінка вирушила у відпустку. Навіть наші найкращі розробники не можуть її знайти.
            </p>

            <button
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-primary text-primary-foreground
                           rounded-2xl text-xl font-bold
                           hover:bg-primary/90 transition-all duration-300
                           shadow-2xl hover:shadow-primary/40
                           transform hover:scale-105"
            >
                Повернутися на безпечну Батьківщину
            </button>

        </div>
    );
}

export default NotFound;