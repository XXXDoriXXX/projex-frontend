
import DisplayDiv from "./DisplayDiv.tsx";
import DisplayText from "./DisplayText.tsx";

const Loading = ({ message = "Loading..." }: { message?: string }) => {
    return (
        <DisplayDiv className="flex justify-center p-2 items-center my-4 bg-gray-800/50 rounded-lg shadow-lg">
            <DisplayText variant="secondary" className="text-blue-500 animate-pulse">
                {message}
            </DisplayText>
        </DisplayDiv>
    );
};

export default Loading;
