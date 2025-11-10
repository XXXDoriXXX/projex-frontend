
import { Link } from "react-router-dom";
import logo from "../assets/img/logo_small.png";

const AuthHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 py-4">
            <div className="container mx-auto px-4">
                <Link to="/" className="inline-block">
                    <img
                        src={logo}
                        alt="Projex Logo"
                        className="h-12 w-auto object-contain select-none drop-shadow-lg transition-transform duration-500 hover:scale-115"
                    />
                </Link>
            </div>
        </header>
    );
};

export default AuthHeader;