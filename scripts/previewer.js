import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://440859-genesis-dev.adobeio-static.net/api/v1/web/genesis-aio/fig-comps',
    'figmaAuthToken': '',
    'daToken': ''
}

// Hack to handle auth
const storedFigmaAuthToken = window.localStorage.getItem('figmaAuthToken');
const storedDaToken = window.localStorage.getItem('daToken');
if (storedFigmaAuthToken && !CONFIGS.figmaAuthToken) {
  CONFIGS.figmaAuthToken = storedFigmaAuthToken;
}
if (storedDaToken && !CONFIGS.daToken) {
  CONFIGS.daToken = storedDaToken;
}

async function initPreviewer() {
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');
    const editable = getQueryParam('editable');
    const target = getQueryParam('target');
    const targetUrl = getQueryParam('targetUrl');
    const token = getQueryParam('token');
    CONFIGS.figmaAuthToken = 'Bearer ' + token;

    if (!source || !contentUrl || !target || !targetUrl) {
        throw new Error("Source, content Url, target url or target cannot be empty! Stoppping all processing!");
    }

    // handle the content injection and WYSIWYG editor painting
    await initiatePreviewer(source, contentUrl, editable, target, targetUrl);
    await persist(source, contentUrl, target, targetUrl);
}

export async function persist(source, contentUrl, target, targetUrl) {
    await persistOnTarget(contentUrl, target, targetUrl, CONFIGS);
    console.log('Successfully persisted on DA');
}

async function initiatePreviewer(source, contentUrl, editable, target, targetUrl) {
    let html = '';
    if (source === 'figma') {
        html = await fetchFigmaContent(contentUrl, CONFIGS);
    }

    // html = targetCompatibleHtml(html, target, targetUrl, CONFIGS);

    if (editable && html) {
        html = renderEditableHtml(html);
    }

    html += `<a href="#" class="cta-button">Push to DA</a>`;
    
    paintHtmlOnPage(html);

    // finally call the Milo loadarea function to paint the WYSIWYG page
    document.querySelector('head').innerHTML += '<meta name="martech" content="off">';
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
