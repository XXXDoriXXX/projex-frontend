import {Outlet} from "react-router-dom";
import Header from "./components/Header.tsx";

function Footer() {
    return null;
}

const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;