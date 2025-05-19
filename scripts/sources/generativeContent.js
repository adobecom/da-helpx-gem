import { changeMarqueeContent } from '../blocks/marquee.js';
import { changeTextContent } from '../blocks/text.js';
import { changeMediaContent } from "../blocks/media.js";

export async function mapGenerativeContent(html, blockMapping, generativeContent) {
  blockMapping.details.components.forEach((b, idx) => {
    switch(b.id){
        case 'marquee': 
            html = changeMarqueeContent(html, b.blockDomEl, generativeContent[idx]["Marquee"]);
            break;
        case 'text':
            changeTextContent(html, b.blockDomEl, generativeContent[idx]["Text"]);
            break;
        case 'media':
            changeMediaContent(html, b.blockDomEl, generativeContent[idx]["Media"]);
            break;
        default:
            break;
    }
  });
}
