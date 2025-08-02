import logo from '../assets/img/logo.png';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 via-purple-400 to-pink-500 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 text-center px-6">

            {/* Лого */}
            <img
                src={logo}
                alt="Projex Logo"
                className="w-48 h-48 mb-8 drop-shadow-xl animate-spin-slow"
            />

            {/* Заголовок */}
            <h1 className="font-['Bitcount_Prop_Double'] text-8xl sm:text-9xl text-white font-extralight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] tracking-wide select-none">
                Projex
            </h1>

            {/* Підзаголовок */}
            <p className="mt-4 text-lg sm:text-xl font-sans text-white/90 max-w-xl">
                Ласкаво просимо до світу, де кожен проект оживає. <br />
                Поринь у створення з Projex.
            </p>

            {/* Кнопка для дії */}
            <button
                className="mt-10 bg-white bg-opacity-20 hover:bg-opacity-40 transition rounded-full px-8 py-3 text-white font-semibold shadow-lg backdrop-blur-sm ring-1 ring-white ring-opacity-30 hover:ring-opacity-70"
                onClick={() => alert('Тут буде редірект, але поки що алерт 😼')}
            >
                Почати
            </button>

            {/* Анімація підпису */}
            <small className="mt-12 text-white/60 font-mono tracking-widest animate-pulse">
                Made with ♥ by Котик
            </small>

            {/* Анімація кастомна для повільного обертання лого */}
            <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default Home;
