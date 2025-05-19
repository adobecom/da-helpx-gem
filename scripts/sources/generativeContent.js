import { changeMarqueeContent } from '../blocks/marquee.js';
// import { mapTextContent } from '../blocks/text.js';
// import {mapMediaContent} from "../blocks/media.js";

export async function mapGenerativeContent(html, blockMapping, generativeContent) {
  blockMapping.details.components.forEach((b, idx) => {
    switch(b.id){
        case 'marquee': 
            html = changeMarqueeContent(html, b.blockDomEl, generativeContent[idx]["Marquee"]);
            break;
        case 'text':
            mapTextContent(html, b.blockDomEl, generativeContent[idx]["Text"]);
            break;
        case 'media':
            mapMediaContent(html, b.blockDomEl, generativeContent[idx]["Media"]);
            break;
        default:
            break;
    }
  });
}
