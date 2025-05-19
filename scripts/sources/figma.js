import { mapMarqueeContent } from '../blocks/marquee.js';
import { mapTextContent } from '../blocks/text.js';
import {mapMediaContent} from "../blocks/media.js";

export async function fetchFigmaContent(figmaUrl, CONFIGS) {
    const htmlAndMapping = await getFigmaContent(figmaUrl, CONFIGS);
    // window.sessionStorage.setItem('previewer-html', htmlAndMapping.html);
    return htmlAndMapping;
}

async function getFigmaContent(figmaUrl, CONFIGS) {
    const blockMapping = await fetchFigmaMapping(figmaUrl, CONFIGS);
    let html = "";

    if (blockMapping?.details?.components) {
        html = await createHTML(blockMapping, figmaUrl, CONFIGS);
        // html = fixRelativeLinks(html);
        // pushToStorage({'url': figmaUrl, 'html': html});
    }

    return {
      html,
      blockMapping
    };
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

async function createHTML(blockMapping, figmaUrl, CONFIGS) {
  const blocks = blockMapping.details.components;
    // let html = "";
    // for (let i=0; i< blocks.length; i++) {
    //     const obj = blocks[i];
    //     if (obj.id !== null && obj.path !== null) {
    //         console.log('foudn a valid block with id: ', obj.id);
    //         const doc = await fetchContent(obj.path, obj.id);
    //         let blockContent = getHtml(doc, obj.id, obj.variant);

    //         // get block figma content
    //         const figContent = await fetchBlockContent(obj.figId, obj.id, figmaUrl, CONFIGS);

    //         // map the figma content before rendering
    //         blockContent = mapFigmaContent(blockContent, obj.properties, obj.id, figContent);
    //         if (blockContent !== null && blockContent !== undefined) {
    //             html += blockContent.outerHTML;
    //         }
    //     }
    // }
    // return html;

    document.querySelector("#loader-content").innerText = "Building the map—block by block ";
    const htmlParts = await Promise.all(
        blocks.map(async (obj) => {
            if (obj.id !== null && obj.path !== null) {
                console.log('found a valid block with id: ', obj.id);

                // Fetch doc and figContent in parallel
                const [doc, figContent] = await Promise.all([
                    fetchContent(obj.path, obj.id),
                    fetchBlockContent(obj.figId, obj.id, figmaUrl, CONFIGS)
                ]);

                let blockContent = getHtml(doc, obj.id, obj.variant);
                
                // Map figma content
                blockContent = mapFigmaContent(blockContent, obj.properties, obj.id, figContent);
                obj.blockDomEl = blockContent;
                if (blockContent) return blockContent
                else return '';
            }
            return ''; // If id or path is null, return empty string
        })
    );

    // Join all HTML parts in order
    // return htmlParts.join('');
    return htmlParts;
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
