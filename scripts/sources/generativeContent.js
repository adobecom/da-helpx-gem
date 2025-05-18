import { changeMarqueeContent } from '../blocks/marquee.js';
// import { mapTextContent } from '../blocks/text.js';
// import {mapMediaContent} from "../blocks/media.js";

export async function mapGenerativeContent(html, blockMapping, generativeContent) {
  blockMapping.details.components.forEach((b, idx) => {
    switch(b.id){
        case 'marquee': 
            html = changeMarqueeContent(html, b.blockDomEl, generativeContent[idx]["Marquee"]);
            break;
        // case 'text':
        //     mapTextContent(b.blockDomEl, generativeContent[idx]);
        //     break;
        // case 'media':
        //     mapMediaContent(b.blockDomEl, generativeContent[idx]);
        //     break;
        default:
            break;
    }
  });
}
