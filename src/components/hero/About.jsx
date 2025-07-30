//About.jsx
import TranslationPortal from "../ui/TranslationPortal";
import chinaImage from "../../assets/china.png";
import franceImage from "../../assets/france.png";
import spainImage from "../../assets/spain.png";
import brazilImage from "../../assets/brazil.png";

import Stack from '../ui/CardRotate'

const images = [
  { id: 1, img: chinaImage },
  { id: 2, img: franceImage },
  { id: 3, img: spainImage },
  { id: 4, img: brazilImage }
];

const About = () => {
    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <TranslationPortal/>
            
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
                            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                Get Started
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
    );
}

export default About;