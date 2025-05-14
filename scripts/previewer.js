import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://440859-genesis-dev.adobeio-static.net/api/v1/web/genesis-aio/fig-comps',
    'figmaAuthToken': '',
    'daToken': '',
    'figmaBlockContentUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comp-details'
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
    CONFIGS.daToken = 'Bearer ' + token;

    if (!source || !contentUrl || !target || !targetUrl) {
        throw new Error("Source, content Url, target url or target cannot be empty! Stoppping all processing!");
    }

    // handle the content injection and WYSIWYG editor painting
    await initiatePreviewer(source, contentUrl, editable, target, targetUrl);
    // await persist(source, contentUrl, target, targetUrl);
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

    targetCompatibleHtml(html, target, targetUrl, CONFIGS);

    if (editable && html) {
        html = renderEditableHtml(html);
    }

    paintHtmlOnPage(html, source, contentUrl, target, targetUrl);


    window["page-load-ok-milo"].remove();
    // finally call the Milo loadarea function to paint the WYSIWYG page
    document.querySelector('head').innerHTML += '<meta name="martech" content="off">';
    const { loadArea } = await import(
        `https://main--milo--adobecom.aem.live/libs/utils/utils.js`
      );
    await loadArea();
}

async function paintHtmlOnPage(html, source, contentUrl, target, targetUrl) {
    const mainEle = document.createElement('main');
    const wrappingDiv = document.createElement('div');
    wrappingDiv.innerHTML = html;
    mainEle.appendChild(wrappingDiv);
    document.body.appendChild(mainEle);

    // const pushToDABtn = document.createElement('a');
    // pushToDABtn.href = '#';
    // pushToDABtn.classList.add('cta-button');
    // pushToDABtn.innerHTML = '<span><img height="24px" width="24px" src="https://da.live/blocks/edit/img/Smock_Send_18_N.svg"></span>Push to DA';

    document.body.append(pushToDABtn);
    await persist(source, contentUrl, target, targetUrl);
    // pushToDABtn.addEventListener('click', async () => {
    //     await persist(source, contentUrl, target, targetUrl);
    // });
}

// TODO: manage error handling
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

initPreviewer();
