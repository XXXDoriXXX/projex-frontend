import Button from "../../../components/Button.tsx";
import DarkVeil from "../../../components/DarkVeil/DarkVeil.tsx";
import BlurText from "../../../components/TextAnimations/BlurText/BlurText.tsx";
import ShinyText from "../../../components/TextAnimations/ShinyText/ShinyText.tsx";
import TextType from "../../../components/TextAnimations/TextType/TextType.tsx";
import MagicBento from "../../../components/Components/MagicBento/MagicBento.tsx";
import { MotionEffect } from "../../../components/Animations/Motion/Motion-effect.tsx";
import {useNavigate} from "react-router-dom";



const Home = () => {
    const navigate = useNavigate();
    const handleAnimationComplete = () => {
        console.log('Animation completed!');
    };
    const handleNavigate = (path: string) => () => {
        navigate(path);
    }
    return (
        <div className="relative min-h-screen text-white flex flex-col items-center overflow-hidden">


            {/* HERO SECTION */}
            <section id="Hero" className="relative w-full h-screen flex flex-col justify-center items-center">
                <div className="absolute inset-0 -z-100">
                    <DarkVeil />
                </div>

                <div className="max-w-6/10 w-full flex flex-col md:flex-row justify-center items-center pr-0 pl-0">
                    {/* Ліва частина */}
                    <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.05}>
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <BlurText
                                text={`Build amazing projects.\nShare with the world.\nLevel up your skills.`}
                                delay={50}
                                animateBy="words"
                                direction="top"
                                onAnimationComplete={handleAnimationComplete}
                                className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-shadow-pink-500"
                            />

                            <TextType
                                text={["ProjeX", "It's a network for developers", "where your projects are your calling card."]}
                                typingSpeed={75}
                                pauseDuration={1500}
                                showCursor={true}
                                cursorCharacter="|"
                                textColors={["#c2c2c2", "#949494", "#949494"]}
                                className="mb-8 font-semibold tracking-wide mt-8"
                            />

                            <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.1}>
                                <div className="flex gap-8 flex-wrap mt-8">

                                        <>
                                            <Button variant="primary" className="text-xl">Explore Projects</Button>
                                            <Button variant="glass" onClick={handleNavigate("/project/create")}>
                                                <ShinyText text="Create a new project!" disabled={false} speed={3} className="text-xl" />
                                            </Button>
                                        </>
                                </div>
                            </MotionEffect>
                        </div>
                    </MotionEffect>

                    {/* Права частина */}
                    <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.1}>
                        <div className="flex-1 flex justify-end">

                        </div>
                    </MotionEffect>
                </div>
            </section>


            {/* SHOWCASE SECTION */}
            <section id="Showcase" className="w-full min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0016] flex justify-center items-center px-8 py-20">
                <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.05}>
                    <MagicBento
                        textAutoHide={true}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        enableTilt={true}
                        enableMagnetism={true}
                        clickEffect={true}
                        spotlightRadius={300}
                        particleCount={12}
                        glowColor="132, 0, 255"
                    />
                </MotionEffect>
            </section>

            {/* FEATURES SECTION */}
            <section id="Features" className="w-full min-h-screen bg-gradient-to-b from-[#0a0016] to-[#060010] flex flex-col justify-center items-center px-8 py-20">
                <h2 className="text-4xl font-bold mb-12">Why choose ProjeX?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl">
                    <FeatureCard title="Build Fast" desc="Use our tools to speed up your development process." />
                    <FeatureCard title="Showcase Skills" desc="Create an online portfolio that speaks for you." />
                    <FeatureCard title="Find Collaborators" desc="Work with other talented developers worldwide." />
                </div>
            </section>

            {/* COMMUNITY SECTION */}
            <section id="Community" className="w-full min-h-screen bg-gradient-to-b from-[#060010] to-[#050010] flex flex-col justify-center items-center px-8 py-20">
                <h2 className="text-4xl font-bold mb-12">Join our growing community</h2>
                <p className="text-lg text-white/70 max-w-2xl text-center">Over <span className="font-bold">10,000+</span> developers already use ProjeX to share their work and connect with others.</p>
            </section>

            {/* CTA SECTION */}
            <section id="CTA" className="w-full min-h-[50vh] bg-gradient-to-b from-[#050010] to-[#040010] flex flex-col justify-center items-center px-8 py-20">
                <h2 className="text-3xl font-bold mb-6">Ready to showcase your projects?</h2>
                <Button variant="glass" className="text-xl">Join Now</Button>
            </section>

            {/* FOOTER */}
            <footer id="Footer" className="w-full bg-gradient-to-b from-[#040010] to-[#060010] text-white/60 text-center py-4 text-sm font-mono tracking-widest">
                Made with ♥ by Котик
            </footer>
        </div>
    );
};

// Simple feature card component
const FeatureCard = ({ title, desc }: { title: string; desc: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-white/70">{desc}</p>
    </div>
);

export default Home;
