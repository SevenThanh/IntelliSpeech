import TranslationPortal from "../ui/TranslationPortal";
import HowToUseSection from "../ui/HowToUseSection"; 
import FAQ from "../ui/FAQ";
import chinaImage from "../../assets/china.png";
import franceImage from "../../assets/france.png";
import spainImage from "../../assets/spain.png";
import brazilImage from "../../assets/brazil.png";
import BlurText from "../ui/BlurText";
import Stack from '../ui/CardRotate'

const images = [
  { id: 1, img: chinaImage },
  { id: 2, img: franceImage },
  { id: 3, img: spainImage },
  { id: 4, img: brazilImage }
];

const handleAnimationComplete = () => {
    console.log('Animation completed!');
};

const About = () => {
    return (
        <div className="min-h-screen ">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                    <BlurText
                        text="No more language barriers"
                        delay={360}
                        animateBy="words"
                        direction="top"
                        onAnimationComplete={handleAnimationComplete}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center "
                    />
                </div>
                    <TranslationPortal/>
            </div>

            <HowToUseSection />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    Join in Any
                                    <br />
                                    <span className="text-blue-600">Language</span>
                                </h2>
                                
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Our AI interprets 40+ languages as you speak—no interpreters, no delays.
                                </p>
                            </div>
                            
                            <div className="pt-4">
                                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                                    <span className="relative z-10">Get Started</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-center lg:justify-start">
                            <div className="relative">
                                <Stack
                                    randomRotation={true}
                                    sensitivity={180}
                                    sendToBackOnClick={true}
                                    cardDimensions={{ width: 400, height: 400 }}
                                    cardsData={images}
                                />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <FAQ/>
        </div>
    );
}

export default About;