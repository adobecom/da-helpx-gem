export default (block) => {
  const productAppLink = getProductAppLink(block);
  construct(block);
  init(block);
  restructureAppLink(productAppLink, block);
};

function restructureAppLink(productAppLink, block){
  if(!productAppLink) return;
  const imageSrc = "https://helpx.adobe.com/content/dam/help/mnemonics/pr_cc_app_RGB.svg";
  const productHref = productAppLink.querySelector('div > div').children[2].firstChild.getAttribute('href');
  const product = productAppLink.querySelector('div > div').children[1].firstChild.data;

  const div = document.createElement('div');
  div.innerHTML = `<div class="productDetails">
                    <a href="${productHref}" class="productSection">
                        <img src="${imageSrc}" alt="${product}">
                    </a>
                    <div class="productOpenLink">
                        <p class="productName">
                            <a href="${productHref}">Premiere Pro</a>
                        </p>
                        
                            <a href="${productHref}" class="openAppSection">
                                <span class="openAppText">Open app</span>
                                <span class="openAppIcon"></span>
                            </a>
                        
                    </div>
                  </div>`;
  
  block.insertBefore(div.firstElementChild, block.firstElementChild);
}

function getProductAppLink(block) {
  if(block.firstElementChild.querySelector('a').firstChild.data === 'open-app') {
    const appLink = block.removeChild(block.firstElementChild);
    return appLink;
  }
  return null;
}

function init(block) {
  const tocParentElement = block.querySelectorAll('li.toclink-label > .parentNode');
  const pageNavLink = block.querySelectorAll('.toclink-label a');
  const currentPagePath = window.location.pathname;
  setActiveIndicator(currentPagePath, pageNavLink);
  toggleIconAndExpandToc(tocParentElement);
  expandTOC(block,`.leafNode[href='${currentPagePath}']` );
}

function construct(block) {
  const tocList = [...block.querySelector(`div.toc > div > div`).children][0];
  tocList.classList.add('tocList');

  tocList.querySelectorAll('p > a[href]').forEach(anchor => {
    anchor.parentNode.outerHTML = anchor.outerHTML;
  })

  replaceElement(tocList, 'p', 'span');
  wrapWithSpan(tocList);
  addClassName(tocList, 'li', 'toclink-label');
  addClassName(tocList, 'a', 'leafNode');
  [...tocList.children].forEach(childElement => {
    addChildClass(childElement);
  });
  block.innerHTML = tocList.outerHTML;
}

function replaceElement(node, currElement, newElement) {
  [...node.getElementsByTagName(currElement)].forEach((element) => {
    const replacedElement = document.createElement(newElement);
    replacedElement.innerHTML = element.innerHTML;
    element.parentNode.replaceChild(replacedElement, element);
  });
}

function wrapWithSpan(node) {
  [...node.getElementsByTagName('span')].forEach((element) => {
    const outerElement = document.createElement('span');
    outerElement.classList.add('parentNode');

    const icon = document.createElement('span');
    icon.classList.add('parentNodeIcon');

    element.classList.add('parentNodeLabel');

    outerElement.innerHTML = icon.outerHTML + element.outerHTML;
    element.parentNode.replaceChild(outerElement, element);
  });
}

function addClassName(node, element, className) {
  [...node.getElementsByTagName(element)].forEach((ele) => {
    ele.classList.add(className);
  });
}

function addChildClass(node) {
  if (node.tagName.toLowerCase() === 'ul') {
    node.classList.add('tocListItem');
    if (node.childElementCount > 0) node.classList.add('children');
    [...node.children].forEach((child) => addChildClass(child));
  } else if (node.tagName.toLowerCase() === 'li') {
    if (node.childElementCount === 1 && node.firstElementChild.tagName.toLowerCase() === 'a') {
      node.classList.add('noChild');
    } else {
      node.classList.add('hasChildren');
      [...node.children].forEach((child) => addChildClass(child));
    }
  }
}

function expandTOC(block, elem) {
  if(!elem || !block) return;

  const initialElement = block.querySelector(`${elem}`);

  if (initialElement) {
    let currentElement = initialElement.parentElement;
    while (currentElement) {
      if (currentElement.classList.contains('toclink-label')) {
        const parentNode = currentElement.querySelector('.parentNode');
        if (parentNode) {
          parentNode.classList.add('expandToc', 'highlightNode');
        }
      }
      currentElement = currentElement.parentElement;
    }

    initialElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }
}

function setActiveIndicator(currentPagePath, pageNavLink) {
  if (!currentPagePath || !pageNavLink) return;
  pageNavLink.forEach((link) => {
    if (link.getAttribute('href').includes(currentPagePath)) {
      link.closest('.toclink-label').classList.add('is-active');
    }
  });
}

function toggleIconAndExpandToc(tocParentElement) {
  tocParentElement.forEach(parent => {
    parent.setAttribute('onclick','this.classList.toggle("expandToc");')
  });
  
}
