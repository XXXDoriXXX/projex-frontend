import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DisplayText from "../../../components/DisplayText";
import FormInput from "../../../components/FormInput";
import Button from "../../../components/Button";
import DisplayDiv from "../../../components/DisplayDiv.tsx";
import ScrollStack, {ScrollStackItem} from "../../../components/Components/ScrollStack/ScrollStack.tsx";

const steps = [
    { id: "general", label: "General", required: true },
    { id: "settings", label: "Settings", required: false },
    { id: "links", label: "Links", required: true },
    { id: "media", label: "Media", required: false },
];

const CreateProject = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        visibility: "public",
        tags: "",
        repo: "",
        demo: "",
        image: null as File | null,
        video: null as File | null,
    });

    const [activeStep, setActiveStep] = useState("general");

    const progressRef = useRef<HTMLDivElement>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, files } = e.target as HTMLInputElement;
        setForm({
            ...form,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Project data:", form);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const newActiveStep = entry.target.id;
                        setActiveStep(newActiveStep);
                    }
                    else {
                        const idx = steps.findIndex(s => s.id === entry.target.id);
                        if (idx > 0) {
                            setActiveStep(steps[idx-1].id);
                        }
                    }
                });
            },
            { threshold: 0.7 }
        );

        steps.forEach((step) => {
            const el = document.getElementById(step.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);


    const getProgressPercentage = () => {
        const activeIndex = steps.findIndex((s) => s.id === activeStep);
        if (activeIndex === -1) return 0;
        if (activeIndex === 0) return 5;
        return (activeIndex / (steps.length - 1)) * 100;
    };


    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#050010] to-[#040010] text-white overflow-hidden">
            <aside className="w-max bg-transperent shadow-md ticky top-0 h-screen fixed top-0 flex-col justify-center flex items-center justify-center p-8">
                <DisplayText variant="primary" className="text-xl mb-6">
                     Steps
                </DisplayText>
                <div className="relative  flex items-center justify-center flex-col ">
                    <div className="absolute left-4.5 top-0 h-full w-1 bg-gray-600"></div>
                    <motion.div
                        ref={progressRef}
                        className="absolute left-4.5 top-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.7)] origin-top"
                        animate={{
                            height: `${getProgressPercentage()}%`,
                        }}
                        transition={{ duration: 0.3 }}
                    />

                    <ul className="space-y-8 md:space-y-16 lg:space-y-32 xl:space-y-50 relative">
                        {steps.map((step, index) => {

                            const isActive = activeStep === step.id;
                            const activeIndex = steps.findIndex((s) => s.id === activeStep);
                            const isPassed = index < activeIndex;

                            const color = isPassed
                                ? "bg-blue-500 shadow-blue-500/70"
                                : isActive
                                    ? "bg-blue-500 shadow-blue-500/70 ring-4 ring-blue-400"
                                    : "bg-gray-500 shadow-gray-500/50";

                            const textColor = isActive
                                ? "text-blue-400 font-semibold"
                                : isPassed
                                    ? "text-blue-300"
                                    : "text-gray-300 hover:text-blue-300";

                            return (
                                <li key={step.id} className="flex items-center gap-3">
                                    <button
                                        className={`w-10 h-10 rounded-full flex-shrink-0 transition-all ${color} ${
                                            isActive ? "scale-110" : ""
                                        }`}
                                        aria-label={`Go to ${step.label} step`}
                                    ></button>
                                    <button
                                        className={`transition ${textColor}`}
                                    >
                                        {step.label}
                                        {step.required && <span className="text-red-500">*</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 p-12 space-y-16">
                <form onSubmit={handleSubmit} className="h-250">
                    <ScrollStack blurAmount={10} itemDistance={700} itemStackDistance={10} baseScale={0.9}  className={"scrollbar-hide"}>

                        <ScrollStackItem>
                            <DisplayDiv className={"mb-32 bg-purple-40"}>
                                <section id="general" className={`flex flex-col items-start p-8 space-y-6`}>
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Name *
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Enter the name of your project. This will be displayed on the project card.
                                    </DisplayText>
                                    <FormInput
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Enter project name..."
                                        required
                                        className="w-full"
                                    />

                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Description
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Enter a brief description of your project. This will help others understand what your project is about.
                                    </DisplayText>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe your project..."
                                        rows={6}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </section>
                            </DisplayDiv>
                        </ScrollStackItem>

                        <ScrollStackItem>
                            <DisplayDiv className={"mb-32"}>
                                <section id="settings" className={`flex flex-col items-start p-8 space-y-6`}>
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Visibility *
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Choose the visibility of your project. Public projects are visible to everyone, private projects are only visible to you, and unlisted projects can be accessed via a direct link.
                                    </DisplayText>
                                    <select
                                        name="visibility"
                                        value={form.visibility}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3"
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="unlisted">For link</option>
                                    </select>
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Tags
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Enter tags to help others find your project. Use commas to separate tags.
                                    </DisplayText>
                                    <FormInput
                                        name="tags"
                                        value={form.tags}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="react, typescript, api"
                                        className="w-full"
                                    />
                                </section>
                            </DisplayDiv>
                        </ScrollStackItem>

                        <ScrollStackItem>
                            <DisplayDiv className={"mb-32"}>
                                <section id="links" className={`flex flex-col items-start p-8 space-y-6`}>
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        GitHub Repo
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Enter the URL of your GitHub repository. This will allow others to view your code and contribute to your project.
                                    </DisplayText>
                                    <FormInput
                                        name="repo"
                                        value={form.repo}
                                        onChange={handleChange}
                                        type="url"
                                        placeholder="https://github.com/username/project"
                                        className="w-full"
                                    />
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Live Demo
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Enter the URL of your live demo. This will allow others to see your project in action.
                                    </DisplayText>
                                    <FormInput
                                        name="demo"
                                        value={form.demo}
                                        onChange={handleChange}
                                        type="url"
                                        placeholder="https://myproject.com"
                                        className="w-full"
                                    />
                                </section>
                            </DisplayDiv>
                        </ScrollStackItem>

                        <ScrollStackItem>
                            <DisplayDiv className={"mb-32"}>
                                <section id="media" className={`flex flex-col items-start p-8 space-y-6`}>
                                    <DisplayText variant="primary" className="text-2xl mb-4">
                                        Media
                                    </DisplayText>
                                    <DisplayText variant={"secondary"} className={"text-lg"}>
                                        Drop an image or video to represent your project. This will be displayed on the project card.
                                    </DisplayText>
                                    <DisplayDiv className={"p-8 w-full h-64"}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="image"
                                            onChange={handleChange}
                                            className="block"
                                        />
                                    </DisplayDiv>
                                </section>
                                <div className="flex justify-end gap-4 p-8">
                                    <Button variant="glass" type="button">
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Create project 🚀
                                    </Button>
                                </div>
                            </DisplayDiv>
                        </ScrollStackItem>
                    </ScrollStack>
                </form>
            </main>
        </div>
    );
};

export default CreateProject;