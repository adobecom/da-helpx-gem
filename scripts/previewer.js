import {fetchFigmaContent} from './sources/figma.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comps',
    'figmaAuthToken': ''
}

function initPreviewer() {
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');

    if (source === null || contentUrl === null) {
        throw new Error("Source or content Url cannot be empty! Stoppping all processing!");
    }

    // handle the content injection and WYSIWYG editor painting
    initiatePreviewer(source, contentUrl);
}

async function initiatePreviewer(source, contentUrl) {
    let html = "";
    if (source === 'figma') {
        html = await fetchFigmaContent(contentUrl, CONFIGS);
    }

    paintHtmlOnPage(html);

    const { loadArea } = await import(
        `https://main--milo--adobecom.hlx.live/libs/utils/utils.js`
      );
    await loadArea();
}

function paintHtmlOnPage(html) {
    const mainEle = document.createElement('main');
    const wrappingDiv = document.createElement('div');
    wrappingDiv.innerHTML = html;
    mainEle.appendChild(wrappingDiv);
    document.body.appendChild(mainEle);
}

// TODO: manage error handling
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

initPreviewer();

