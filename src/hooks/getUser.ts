import axios from "axios";

export const getUser = async () => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
            "http://localhost:3000/api/auth/me",
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const { id, username, email, avatarUrl } = data;
        const user = { id, username, email, avatarUrl: avatarUrl || "/default-avatar.png" };

        console.log("User fetched successfully:", user);
        return user

    } catch (error) {
        console.error("Error fetching user:", error);
    }
};
