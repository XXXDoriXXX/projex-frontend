import {Outlet} from "react-router-dom";

const ProjectLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-white">
                <Outlet />
        </div>
    );
};
export default ProjectLayout;