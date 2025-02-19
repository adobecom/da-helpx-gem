import {fetchFromStorage, pushToStorage} from '../store.js';

export async function fetchFigmaContent(figmaUrl, CONFIGS) {
    let html = fetchFromStorage(figmaUrl);

    if (html === "") {
        html = await getFigmaContent(figmaUrl, CONFIGS);
        pushToStorage({url: figmaUrl, html: html});
    }

    return html;
}

async function getFigmaContent(figmaUrl, CONFIGS) {
    const blockMapping = await fetchFigmaMapping(figmaUrl, CONFIGS);
    let html = "";

    if (blockMapping !== null && blockMapping.details !== undefined && blockMapping.details.components !== undefined) {
        html = await createHTML(blockMapping.details.components);
        html = fixRelativeLinks(html);
        pushToStorage({'url': figmaUrl, 'html': html});
    }
    return html;
}

function fixRelativeLinks(html) {
    let updatedHtml = html.replaceAll("./media","https://main--milo--adobecom.hlx.page/media");
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

async function createHTML(blocks) {
    let html = "";
    for (let i=0; i< blocks.length; i++) {
        const obj = blocks[i];
        if (obj.id !== null && obj.path !== null) {
            console.log('foudn a valid block with id: ', obj.id);
            const doc = await fetchContent(obj.path, obj.id);
            const blockContent = getHtml(doc, obj.id);
            if (blockContent !== null) {
                html += getHtml(doc, obj.id).outerHTML;
            }
        }
    }
    return html;
}

function getHtml(resp, id) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(resp, 'text/html');
    return doc.querySelector("." + id);
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