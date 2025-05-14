import {fetchFromStorage, pushToStorage} from '../store.js';
import { mapMarqueeContent } from '../blocks/marquee.js';
import { mapTextContent } from '../blocks/text.js';
import {mapMediaContent} from "../blocks/media.js";

export async function fetchFigmaContent(figmaUrl, CONFIGS) {
    const html = await getFigmaContent(figmaUrl, CONFIGS);
    window.sessionStorage.setItem('previewer-html', html);
    return html;
}

async function getFigmaContent(figmaUrl, CONFIGS) {
    const blockMapping = await fetchFigmaMapping(figmaUrl, CONFIGS);
    let html = "";

    if (blockMapping !== null && blockMapping.details !== undefined && blockMapping.details.components !== undefined) {
        html = await createHTML(blockMapping.details.components, figmaUrl, CONFIGS);
        html = fixRelativeLinks(html);
        // pushToStorage({'url': figmaUrl, 'html': html});
    }
    return html;
}

function fixRelativeLinks(html) {
    let updatedHtml = html.replaceAll("./media","https://main--milo--adobecom.aem.page/media");
    return updatedHtml;
}

async function fetchFigmaMapping(figmaUrl, CONFIGS) {
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIGS.figmaAuthToken // add a valid token
        },
        body: JSON.stringify({ figmaUrl: figmaUrl }) 
      };
      
      const response = await fetch(CONFIGS.figmaMappingUrl, options)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const mapping = await response.json();
      return mapping;
}

async function createHTML(blocks, figmaUrl, CONFIGS) {
    let html = "";
    for (let i=0; i< blocks.length; i++) {
        const obj = blocks[i];
        if (obj.id !== null && obj.path !== null) {
            console.log('foudn a valid block with id: ', obj.id);
            const doc = await fetchContent(obj.path, obj.id);
            let blockContent = getHtml(doc, obj.id, obj.variant);

            // get block figma content
            const figContent = await fetchBlockContent(obj.figId, obj.id, figmaUrl, CONFIGS);

            // map the figma content before rendering
            blockContent = mapFigmaContent(blockContent, obj.properties, obj.id, figContent);
            if (blockContent !== null && blockContent !== undefined) {
                html += blockContent.outerHTML;
            }
        }
    }
    return html;
}

async function fetchBlockContent(figId, id, figmaUrl, CONFIGS) {
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIGS.figmaAuthToken // add a valid token
        },
        body: JSON.stringify({ figmaUrl: figmaUrl, figId: figId, id: id}) 
      };
      
      const response = await fetch(CONFIGS.figmaBlockContentUrl, options)

      if (!response.ok) {
        return {};
      }

      const mapping = await response.json();
      return mapping;
}

function mapFigmaContent(blockContent, props, name, figContent) {
    console.log('inside mapFigmaContent');
    // const elements = getLevelElements(blockContent);
    switch(name){
        case 'marquee': 
            mapMarqueeContent(blockContent, figContent);
            break;
        case 'text':
            mapTextContent(blockContent, figContent);
            break;
        case 'media':
            mapMediaContent(blockContent, figContent);
            break;
        default:
            break;
    }

    return blockContent;
}

function getLevelElements(parent) {
    const levelElements = [];
    
    // Recursively find all non-div child elements
    function findElements(node) {
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() !== 'div') {
                levelElements.push(child);
            }
            // Recurse if the child is an element (including div)
            if (child.nodeType === Node.ELEMENT_NODE && child.nodeType !== 'picture') {
                findElements(child);
            }
        });
    }
    
    findElements(parent);
    return levelElements;
}

function getHtml(resp, id, variant) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(resp, 'text/html');
    return doc.querySelectorAll("." + id)[variant];
}


async function fetchContent(contentUrl) {
    try {
        const response = await fetch(contentUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const content = await response.text();
        return content;
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}