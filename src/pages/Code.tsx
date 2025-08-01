import { useState } from "react";
import DisplayText from "../components/DisplayText.tsx";
import DisplayForm from "../components/DisplayForm.tsx";
import Button from "../components/Button.tsx";
import OTPInput from "../components/OTPInput.tsx"; // 👈 новий компонент

const Code = () => {
    const [code, setCode] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitted code:", code);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 xl:p-32 bg-[url(./assets/img/bg1.jpg)] bg-cover bg-center">
            <DisplayForm onSubmit={handleSubmit}>
                <DisplayText variant="primary" className="mb-4">
                    Email verification
                </DisplayText>
                <DisplayText variant="secondary">
                    We sent a 6-digit code to your email. Enter it below.
                </DisplayText>

                <OTPInput value={code} onChange={setCode} />

                <Button variant="primary" type="submit" className="w-full">
                    Confirm
                </Button>
            </DisplayForm>
        </div>
    );
};

export default Code;
