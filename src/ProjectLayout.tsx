import {Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import type {RootState} from "./store.ts";
import {useGetProfileQuery} from "./features/auth/api/authApi.ts";

const ProjectLayout = () => {
    const token = useSelector((state: RootState) => state.auth.token);


    useGetProfileQuery(token!, {
        skip: !token,
    });
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-white">
                <Outlet />
        </div>
    );
};
export default ProjectLayout;