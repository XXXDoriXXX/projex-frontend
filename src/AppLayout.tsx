
import { Outlet } from "react-router-dom";
import Header from "./components/Header.tsx";


const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            <Header />
            <main className="">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;