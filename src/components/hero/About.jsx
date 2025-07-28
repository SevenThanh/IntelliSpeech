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
        <div className="">
            <TranslationPortal/>
            <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                cardDimensions={{ width: 400, height: 400 }}
                cardsData={images}
                />
        </div>
    );
}

export default About;

