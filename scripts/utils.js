export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, location) => {
      libs = (() => {
        return 'https://main--milo--adobecom.aem.live/libs';
        const { hostname, search } = location || window.location;
        if (!(hostname.includes('.aem.') || hostname.includes('local')))
          return prodLibs;
        const branch = new URLSearchParams(search).get('milolibs') || 'main';
        if (branch === 'local') return 'http://localhost:6456/libs';
        return branch.includes('--')
          ? `https://${branch}.aem.live/libs`
          : `https://${branch}--milo--adobecom.aem.live/libs`;
      })();
      return libs;
    },
    () => libs,
  ];
})();

export const [setDOM, getDOM] = (() => {
  let htmlDOM;
  return [
    (currDom) => {
      htmlDOM = (() => {
        return currDom;
      })();
      return htmlDOM;
    },
    () => htmlDOM,
  ];
})();

export const [setUnityLibs, getUnityLibs] = (() => {
  let libs;
  return [
    (libPath, project = 'unity') => {
      if (project === 'unity') {
        libs = `${origin}/unitylibs`;
        return libs;
      }
      libs = libPath;
      return libs;
    },
    () => libs,
  ];
})();

export function decorateArea(area = document) {}

const miloLibs = setLibs('/libs');

const { createTag, getConfig, loadStyle } = await import(
  `${miloLibs}/utils/utils.js`
);
export { createTag, loadStyle, getConfig };
const { decorateDefaultLinkAnalytics } = await import(
  `${miloLibs}/martech/attributes.js`
);
export { decorateDefaultLinkAnalytics };

export function getGuestAccessToken() {
  try {
    const { token } = window.adobeIMS.getAccessToken();
    return `Bearer ${token}`;
  } catch (e) {
    return '';
  }
}

export function getHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: getGuestAccessToken(),
    'x-api-key': apiKey,
  };
}

export function defineDeviceByScreenSize() {
  const DESKTOP_SIZE = 1200;
  const MOBILE_SIZE = 600;
  const screenWidth = window.innerWidth;
  if (screenWidth >= DESKTOP_SIZE) return 'DESKTOP';
  if (screenWidth <= MOBILE_SIZE) return 'MOBILE';
  return 'TABLET';
}

export async function loadSvg(src) {
  try {
    const res = await fetch(src, { mode: 'no-cors' });
    if (!res.status === 200) return null;
    const svg = await res.text();
    return svg;
  } catch (e) {
    return '';
  }
}

export function loadImg(img) {
  return new Promise((res) => {
    img.loading = 'eager';
    img.fetchpriority = 'high';
    if (img.complete) res();
    else {
      img.onload = () => res();
      img.onerror = () => res();
    }
  });
}

export async function createActionBtn(
  btnCfg,
  btnClass,
  iconAsImg = false,
  swapOrder = false
) {
  const txt = btnCfg.innerText;
  const img = btnCfg.querySelector('img[src*=".svg"]');
  const actionBtn = createTag('a', {
    href: '#',
    class: `unity-action-btn ${btnClass}`,
  });
  if (img) {
    let btnImg = null;
    const { pathname } = new URL(img.src);
    const libSrcPath = `${getUnityLibs().split('/unitylibs')[0]}${pathname}`;
    if (iconAsImg) btnImg = createTag('img', { src: libSrcPath });
    else btnImg = await loadSvg(libSrcPath);
    const btnIcon = createTag('div', { class: 'btn-icon' }, btnImg);
    actionBtn.append(btnIcon);
  }
  if (txt) {
    const btnTxt = createTag(
      'div',
      { class: 'btn-text' },
      txt.split('\n')[0].trim()
    );
    if (swapOrder) actionBtn.prepend(btnTxt);
    else actionBtn.append(btnTxt);
  }
  return actionBtn;
}

async function createErrorToast() {
  const [alertImg, closeImg] = await Promise.all([
    fetch(`${getUnityLibs()}/img/icons/alert.svg`).then((res) => res.text()),
    fetch(`${getUnityLibs()}/img/icons/close.svg`).then((res) => res.text()),
  ]);
  const errholder = createTag('div', { class: 'alert-holder' });
  const errdom = createTag('div', { class: 'alert-toast' });
  const alertContent = createTag('div', { class: 'alert-content' });
  const alertIcon = createTag('div', { class: 'alert-icon' });
  const alertText = createTag('div', { class: 'alert-text' });
  const p = createTag('p', {}, 'Alert Text');
  alertText.append(p);
  alertIcon.innerHTML = alertImg;
  alertIcon.append(alertText);
  const alertClose = createTag('a', { class: 'alert-close', href: '#' });
  const alertCloseText = createTag(
    'span',
    { class: 'alert-close-text' },
    'Close error toast'
  );
  alertClose.innerHTML = closeImg;
  alertClose.append(alertCloseText);
  alertContent.append(alertIcon, alertClose);
  errdom.append(alertContent);
  errholder.append(errdom);
  alertClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.closest('.alert-holder').style.display = 'none';
  });
  decorateDefaultLinkAnalytics(errholder);
  return errholder;
}

export async function showErrorToast(targetEl, unityEl, className) {
  const alertHolder = targetEl.querySelector('.alert-holder');
  if (!alertHolder) {
    const errorToast = await createErrorToast();
    targetEl.append(errorToast);
  }
  const msg = unityEl.querySelector(className)?.nextSibling.textContent;
  document.querySelector(
    '.unity-enabled .interactive-area .alert-holder .alert-toast .alert-text p'
  ).innerText = msg;
  document.querySelector(
    '.unity-enabled .interactive-area .alert-holder'
  ).style.display = 'flex';
}

export async function retryRequestUntilProductRedirect(
  cfg,
  requestFunction,
  delay = 1000
) {
  while (cfg.continueRetrying) {
    try {
      const scanResponse = await requestFunction();
      if (
        scanResponse.status === 429 ||
        (scanResponse.status >= 500 && scanResponse.status < 600)
      ) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        cfg.scanResponseAfterRetries = scanResponse;
        return scanResponse;
      }
    } catch (e) {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  return cfg.scanResponseAfterRetries;
}

export function createIntersectionObserver({
  el,
  callback,
  cfg,
  options = {},
}) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        callback(cfg);
      }
    });
  }, options);
  io.observe(el);
  return io;
}

export const unityConfig = (() => {
  const { host } = window.location;
  const commoncfg = {
    apiKey: 'leo',
    refreshWidgetEvent: 'unity:refresh-widget',
    interactiveSwitchEvent: 'unity:interactive-switch',
  };
  const cfg = {
    prod: {
      apiEndPoint: 'https://unity.adobe.io/api/v1',
      connectorApiEndPoint: 'https://unity.adobe.io/api/v1/asset/connector',
      ...commoncfg,
    },
    stage: {
      apiEndPoint: 'https://unity-stage.adobe.io/api/v1',
      connectorApiEndPoint:
        'https://unity-stage.adobe.io/api/v1/asset/connector',
      ...commoncfg,
    },
  };
  if (
    host.includes('hlx.page') ||
    host.includes('localhost') ||
    host.includes('stage.adobe') ||
    host.includes('corp.adobe') ||
    host.includes('graybox.adobe')
  ) {
    return cfg.stage;
  }
  return cfg.prod;
})();
