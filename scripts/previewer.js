import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';
import {mapGenerativeContent} from './sources/generativeContent.js';
import { setDOM, getDOM } from './utils.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://440859-genesis-dev.adobeio-static.net/api/v1/web/genesis-aio/fig-comps',
    'figmaAuthToken': '',
    'daToken': '',
    'figmaBlockContentUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comp-details'
}

const storedFigmaAuthToken = window.localStorage.getItem('figmaAuthToken');
const storedDaToken = window.localStorage.getItem('daToken');
if (storedFigmaAuthToken && !CONFIGS.figmaAuthToken) {
  CONFIGS.figmaAuthToken = storedFigmaAuthToken;
}
if (storedDaToken && !CONFIGS.daToken) {
  CONFIGS.daToken = storedDaToken;
}

const msgList = [
  "Fueling the creative engine ",
  "Words are forming. Stand by for brilliance.",
  "Spinning up something sharp ",
  "Bringing the words to life ",
  "Not just loading — creating.",
  "Crafting brilliance behind the scenes ",
  "Building bold content as we chat",
  "Constructing the masterpiece. Stay tuned.",
  "On it — content coming right up",
  "Loading genius... please remain calm.",
  "Ideas loading. Stand by for impact.",
  "Verbs locked. Nouns loaded. Brilliance imminent."
];

const idNameMap = {
  "marquee": "Marquee",
  "text": "Text",
  "media": "Media",
  "howto": "HowTo",
  "aside": "Aside",
  "notification": "Notification",
}

let CONTEXT = null;
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

window.parent.postMessage({'iframeReady': true}, '*');

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
    let storedHTML = null;
    if (window.localStorage.getItem('previewer-html')) {
      storedHTML = JSON.parse(window.localStorage.getItem('previewer-html'))
    }
    if (storedHTML && storedHTML.figmaUrl == contentUrl) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(storedHTML.html, "text/html");
      html = [...doc.querySelectorAll("body > div > div")];
      blockMapping = {
        success: true,
        details: {
          components: []
        }
      }
      html.forEach((d) => {
        blockMapping.details.components.push({
          id: d.classList[0],
          name: idNameMap[d.classList[0]] ? idNameMap[d.classList[0]] : d.classList[0],
          blockDomEl: d,
        })
      });

      function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      await wait(2000);

    } else if (source === 'figma') {
        window.localStorage.removeItem('previewer-html');
        const pageComponents = await fetchFigmaContent(contentUrl, CONFIGS);
        html = pageComponents.html;
        html.forEach((h, idx) => {
          if (typeof h == 'object') {
            h.id = `block-${idx}`;
          }
        });
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

        function changeLoaderContent() {
          document.querySelector("#loader-content").innerText = msgList[0];
          msgList.shift();
          if(msgList.length) setTimeout( () => { changeLoaderContent(); }, 15000);
        }
        changeLoaderContent();

        window.addEventListener("message", async (e) => {
          const eventData = e.data;
          if (e.data.hasOwnProperty('generativeContent')) {
            await mapGenerativeContent(html, blockMapping, eventData.generativeContent);
            setDOM(html);
            html = html.map((h) => h.outerHTML).join('');
            html = fixRelativeLinks(html);
            html = wrapDivs(html);
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
      setDOM(html);
      html = html.map((h) => h.outerHTML).join('');
      html = fixRelativeLinks(html);
      html = wrapDivs(html);

      window.localStorage.setItem(
        'previewer-html',
        JSON.stringify({
          figmaUrl: contentUrl,
          html
        })
      );
      
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
    window["page-load-ok-milo"]?.remove();
    // finally call the Milo loadarea function to paint the WYSIWYG page
    document.querySelector('head').innerHTML += '<meta name="martech" content="off">';
    const upload = document.createElement('input');
    upload.type = "file"
    upload.id = "imgUpload";
    upload.accept = "image/*";
    upload.style = "display: none;";
    document.body.append(upload);
    const { loadArea } = await import(
        `https://main--milo--adobecom.aem.live/libs/utils/utils.js`
      );
    await loadArea();

    function checkAndRun(fn, delay = 1000, pollInterval = 200) {
      const intervalId = setInterval(() => {
        const decoratedExists = document.querySelector('.section[data-decorated]') !== null;
        if (!decoratedExists) {
          clearInterval(intervalId);
          setTimeout(() => {
            fn();
          }, delay);
        }
      }, pollInterval);
    }
    checkAndRun(() => {
      const allElements = document.querySelectorAll('*');

      function hasTextNode(element) {
        for (const node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            return true;
          }
        }
        return false;
      }

      allElements.forEach(el => {
        if (el.nodeName === "IMG") {
          el.addEventListener('click', (e) => {
            console.log('Clicked img:', e.target);
            const currSrc = e.target.src;
            console.log(currSrc);
            let imgTarget = "";
            window["imgUpload"].click();

            window["imgUpload"].addEventListener('change', async () => {
              const objectUrl = URL.createObjectURL(window["imgUpload"].files[0]);
              const s3url = await uploadToS3(window["imgUpload"].files[0]);
              imgTarget.src = s3url;
              const pic = imgTarget.closest('picture');
              if (pic) pic.querySelectorAll('source').forEach((s) => s.srcset = s3url);
            }, { once: true});
          });
        } else if (hasTextNode(el)) {
          el.addEventListener('click', (e) => {
            console.log('Clicked parent with text node', el);
            const oldTxt = e.target.innerText;
            e.target.contentEditable = true;
            e.target.addEventListener('blur', (ev) => {
              e.target.removeAttribute('contenteditable');
              const closestBlock = e.target.closest('[id^="block-"]');
              const currHTML = getDOM();
              const index = currHTML.findIndex(el => el.id === closestBlock.id);
              [...currHTML[index].querySelectorAll('*')].forEach(node => {
                if (hasTextNode(node) && node.innerText.trim() === oldTxt) {
                  node.innerText = e.target.innerText;
                  let tmphtml = currHTML.map((h) => h.outerHTML).join('');
                  tmphtml = fixRelativeLinks(tmphtml);
                  tmphtml = wrapDivs(tmphtml);
                  targetCompatibleHtml(tmphtml, target, targetUrl, CONFIGS);
                }
              });
            }, { once: true });
          });
        }
      });

    }, 1000, 200);

}

function wrapDivs(htmlString) {
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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getImageBlobData(url) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) res(xhr.response);
      else rej(xhr.status);
    };
    xhr.send();
  });
}

async function uploadToS3(file) {
  const form = new FormData();
  // debugger
  form.append("data", file);
  const options = {
    method: 'POST',
    headers: {
      accept: '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      Authorization: `${CONFIGS.daToken}`,
      'Content-Type': 'multipart/form-data',
      origin: 'https://da.live',
      priority: 'u=1, i',
      referer: 'https://da.live/',
      'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
    }
  };
  options.body = form;
  // const guid = `img-${generateUUID()}`;
  const guid = `myimagename`;
  const res = await fetch(`https://admin.da.live/source/adobecom/da-cc-sandbox/drafts/adisharm/images/${file.name}`, options);
  const data = await res.json();
  // debugger
  return data.aem.previewUrl;
}

initPreviewer();
