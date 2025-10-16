import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const GithubCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        if (!code) {
            setError("Authorization code not found");
            return;
        }

        const exchangeCodeForToken = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/auth/github?code=${code}`);
                const { token } = res.data;
                localStorage.setItem("token", token);
                navigate("/");
            } catch (err) {
                setError(`GitHub login failed. Please try again: ${err}` );
            }
        };

        exchangeCodeForToken();
    }, [location.search, navigate]);

    return (
        <div>
            {error ? <p className="text-red-500">{error}</p> : <p>Loading...</p>}
        </div>
    );
};

export default GithubCallback;
