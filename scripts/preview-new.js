function init() {
    console.log('inside preview init');
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');

    // console.log('Source:', source);
    // console.log('Content URL:', contentUrl);

    if (source === null || contentUrl === null) {
        console.log("-------------- ERROR ----------------");
    } else {
        console.log('found the right values for the source: {} and contentUrl: {}', source, contentUrl);
    }

    // handle the content injection and WYSIWYG editor painting
    handleContentRendering(source, contentUrl);
}

async function createHTML(blocks) {
    console.log('inside createHTML');
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
    console.log('final html is : ',html);
    return html;
}

function getHtml(resp, id) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(resp, 'text/html');
    console.log('parsed doc is : ', doc.querySelector("." + id));
    return doc.querySelector("." + id);
}

async function handleContentRendering(source, contentUrl) {

    if (source === 'figma') {
        const blockMapping = await fetchFigmaMapping(contentUrl);
        console.log('figmaBlockMapping is : ', blockMapping);

        if (blockMapping !== null && blockMapping.details !== undefined && blockMapping.details.components !== undefined) {
            console.log('found the right set of mapping with size: ', blockMapping.details.components.length);
            let html = await createHTML(blockMapping.details.components);
            window.sessionStorage.setItem('editor-html', html);
            const mainEle = document.createElement('main');
            const wrappingDiv = document.createElement('div');
            wrappingDiv.innerHTML = html;
            mainEle.appendChild(wrappingDiv);
            document.body.appendChild(mainEle);
        }

        // finally paint the page by calling the milo load area function

        const { loadArea } = await import(
            `https://main--milo--adobecom.hlx.live/libs/utils/utils.js`
          );
        await loadArea();

    } else {
        const content = await fetchContent(contentUrl);
        if (content) {
            // console.log('Content received is:', content);
        } else {
            console.error('Failed to fetch content.');
        }
    
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
    
        console.log('parsed doc is : ', doc);
    
        const metaTags = doc.querySelectorAll('meta');
        const mainBody = doc.querySelector('body > main');
        // const blocks = doc.querySelector('class=*');
    
        console.log('metatags are: ', metaTags);
        console.log('main body element is : ', mainBody);
    
    
        // append the values
        document.head.append(metaTags);
        document.body.append(mainBody);
    }
}

async function fetchFigmaMapping(figmaUrl) {
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '' // add a valid token
        },
        body: JSON.stringify({ figmaUrl: figmaUrl }) 
      };
      
      const response = await fetch('https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comps', options)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const mapping = await response.json();
      return mapping;
}


async function fetchContent(contentUrl) {
    try {
        const response = await fetch(contentUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const content = await response.text(); // Assuming content is plain text or HTML
        // console.log('Content fetched successfully:', content);
        return content; // Return the fetched content
    } catch (error) {
        console.error('Error fetching content:', error);
        return null; // Return null in case of an error
    }
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

init();
