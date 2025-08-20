import React from "react";
import DisplayDiv from "./DisplayDiv.tsx";
import DisplayText from "./DisplayText.tsx";

interface ErrorMessageProps {
    error?: any;
    defaultMessage?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, defaultMessage = "Something went wrong" }) => {

    let message = defaultMessage;

    if (error) {
        if (typeof error === "string") message = error;
        else if (error.data?.message) message = error.data.message;
        else if (error.message) message = error.message;
    }

    return (
        <DisplayDiv className="flex justify-center items-center my-4 p-2 bg-red-100 border border-red-300 rounded-xl">
            <DisplayText variant="secondary" className="text-red-500">
                {message}
            </DisplayText>
        </DisplayDiv>
    );
};

export default ErrorMessage;
