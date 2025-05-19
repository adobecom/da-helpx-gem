import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';
import {mapGenerativeContent} from './sources/generativeContent.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://440859-genesis-dev.adobeio-static.net/api/v1/web/genesis-aio/fig-comps',
    'figmaAuthToken': '',
    'daToken': '',
    'figmaBlockContentUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comp-details'
}
let CONTEXT = null;
// Hack to handle auth
const storedFigmaAuthToken = window.localStorage.getItem('figmaAuthToken');
const storedDaToken = window.localStorage.getItem('daToken');
if (storedFigmaAuthToken && !CONFIGS.figmaAuthToken) {
  CONFIGS.figmaAuthToken = storedFigmaAuthToken;
}
if (storedDaToken && !CONFIGS.daToken) {
  CONFIGS.daToken = storedDaToken;
}

const msgList = ["Bringing the words to life ", "Fueling the creative engine ", "Spinning up something sharp ", "Crafting brilliance behind the scenes "];

// check if context is present
window.addEventListener("message", (e) => {
  const eventData = e.data;
  console.log(eventData);
  if (eventData.hasOwnProperty('chatContext')) {
      CONTEXT = {
        chat: {
          "context": eventData.chatContext,
        }
      }
    }
}, '*');

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

function fixRelativeLinks(html) {
    let updatedHtml = html.replaceAll("./media","https://main--milo--adobecom.aem.page/media");
    return updatedHtml;
}

async function initiatePreviewer(source, contentUrl, editable, target, targetUrl, context) {
    let html = '';
    let blockMapping = '';
    if (source === 'figma') {
        const pageComponents = await fetchFigmaContent(contentUrl, CONFIGS);
        html = pageComponents.html;
        blockMapping = pageComponents.blockMapping;
    }
    document.querySelector("#loader-content").innerText = "Building your HTML—precision in progress ";

    if (CONTEXT) {

        let blockNames = "";
        blockMapping.details.components.forEach((b) => {
          blockNames += `
                - ${b.name}`;
        });
        window.parent.postMessage({
          blockList: blockNames,
        }, '*');

        setTimeout(() => {
          if(!msgList.length) return;
          document.querySelector("#loader-content").innerText = msgList[0];
          msgList.shift();
        }, 5000);

        window.addEventListener("message", async (e) => {
          const eventData = e.data;
          if (e.data.hasOwnProperty('generativeContent')) {
            await mapGenerativeContent(html, blockMapping, eventData.generativeContent);
            html = html.map((h) => h.outerHTML).join('');
            html = fixRelativeLinks(html);
            html = await wrapDivs(html);
            document.querySelector("#loader-content").innerText = "Bringing blocks to life ";
            startHTMLPainting(html, source, contentUrl, target, targetUrl);
            document.querySelector("#loader-container").remove();
            targetCompatibleHtml(html, target, targetUrl, CONFIGS);
            if (editable && html) {
                html = renderEditableHtml(html);
            }
          }
      }, '*');
    } else {
      html = html.map((h) => h.outerHTML).join('');
      html = fixRelativeLinks(html);
      html = await wrapDivs(html);
      startHTMLPainting(html, source, contentUrl, target, targetUrl);
      document.querySelector("#loader-container").remove();
      targetCompatibleHtml(html, target, targetUrl, CONFIGS);
      if (editable && html) {
          html = renderEditableHtml(html);
      }
    }
}

async function startHTMLPainting(html, source, contentUrl, target, targetUrl) {
    paintHtmlOnPage(html, source, contentUrl, target, targetUrl);
    window["page-load-ok-milo"].remove();
    // finally call the Milo loadarea function to paint the WYSIWYG page
    document.querySelector('head').innerHTML += '<meta name="martech" content="off">';
    const upload = document.createElement('input');
    upload.type = "file"
    upload.id = "imgUpload";
    upload.accept = "image/*";
    upload.style = "display: none;";
    document.body.append(upload);
    let imgTarget = "";
    document.querySelectorAll("img").forEach((i) => {
      i.addEventListener('click', (e) => {
        window["imgUpload"].click();
        imgTarget = e.target;
      });
    });
    window["imgUpload"].addEventListener('change', () => {
      const objectUrl = URL.createObjectURL(window["imgUpload"].files[0]);
      imgTarget.src = objectUrl;
      const pic = imgTarget.closest('picture');
      if (pic) pic.querySelectorAll('source').forEach((s) => s.srcset = objectUrl);
    });
    const { loadArea } = await import(
        `https://main--milo--adobecom.aem.live/libs/utils/utils.js`
      );
    await loadArea();
}

async function wrapDivs(htmlString) {
  const container = document.createElement('div');
  container.innerHTML = htmlString;

  const children = Array.from(container.children);
  const newContainer = document.createElement('div');
  let wrapper = null;

  for (const child of children) {
    if (child.tagName === 'DIV') {
      if (child.classList.length > 0) {
        if (!wrapper) wrapper = document.createElement('div');
        wrapper.appendChild(child);
      } else {
        if (wrapper) {
          newContainer.appendChild(wrapper);
          wrapper = null;
        }
        newContainer.appendChild(child);
      }
    } else {
      if (wrapper) {
        newContainer.appendChild(wrapper);
        wrapper = null;
      }
      newContainer.appendChild(child);
    }
  }

  if (wrapper) {
    newContainer.appendChild(wrapper);
  }

  return newContainer.innerHTML;
}
  

async function paintHtmlOnPage(html, source, contentUrl, target, targetUrl) {
    const mainEle = document.createElement('main');
    mainEle.innerHTML = html;
    document.body.appendChild(mainEle);

    const pushToDABtn = document.createElement('a');
    pushToDABtn.href = '#';
    pushToDABtn.classList.add('cta-button');
    pushToDABtn.innerHTML = '<span><img height="24px" width="24px" src="https://da.live/blocks/edit/img/Smock_Send_18_N.svg"></span>Push to DA';

    document.body.append(pushToDABtn);

    await persist(source, contentUrl, target, targetUrl);

    const message = { daUrl: `https://da.live/edit#/${targetUrl}` };

    // Send the message to the parent window
    window.parent.postMessage({
      "daUrl": message,
    }, '*');

    pushToDABtn.addEventListener('click', async () => {
        await persist(source, contentUrl, target, targetUrl);
    });
}

// TODO: manage error handling
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

initPreviewer();
