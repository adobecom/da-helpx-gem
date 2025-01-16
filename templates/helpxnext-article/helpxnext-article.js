const getMain = () => {
    const mainElements = [...document.getElementsByTagName('main')];
    return mainElements[0];
  };
  
  const getToc = (main) => {
    const tocElements = [...main.getElementsByClassName('toc')];
    const toc = tocElements[0];
    toc.parentElement.removeChild(toc);
    return toc;
  };
  
  const getTitle = () => {
    const div = document.createElement('div');
    div.innerHTML = `
        <div id="title-bar" class="titlebar">
          <h1 class="page-title">${document.title}</h1>
        </div>
      `;
    return div.firstElementChild;
  };
  
  const getLastUpdatedDate = () => {
    let lastUpdatedDate = '2024-11-02T12:24:23.748Z';
    if (document.querySelector('meta[name="publishdate"')) {
      lastUpdatedDate = document
        .querySelector('meta[name="publishdate"')
        .getAttribute('content');
    }
  
    const date = new Date(lastUpdatedDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  
    const div = document.createElement('div');
    div.innerHTML = `
       <div class="lastUpdated">
          <div class="last-updated-container">
              <span class="publish-date-label">Last updated on </span>
              <span class="publish-date">${formattedDate}</span>
          </div>
      </div>
      `;
    return div.firstElementChild;
  };

  const getAnchorTag = (ele, className, label) => {
    const div = document.createElement('div');
    let href = '#';
    if (ele && ele.firstElementChild) {
      const anchorTag = ele.firstElementChild;
      if (anchorTag.getAttribute('href') != null)
        href = anchorTag.getAttribute('href');
      const text = anchorTag.firstChild.nodeValue;
  
      if (text !== null) {
        div.innerHTML = `
          <a class="${className}" href="${href}">
              <p class="label">
                  <small>${label}</small>
              </p>
              <p class="link">${text}</p>
          </a>
          `;
      }
    }
    if (href === '#') {
      div.innerHTML = `<a class="${className}" href="#"> </a>`;
    }
    return div.firstElementChild;
  };
  
  const getPageNavigationArrows = (toc) => {
    const currentPageAnchor = toc.querySelector(
      `a[href='${window.location.pathname}']`
    );
    const pnaTarget = document.createElement('div');
    pnaTarget.classList.add('pna-target');
    if (currentPageAnchor) {
      const prev = getAnchorTag(
        currentPageAnchor.parentElement.previousElementSibling,
        'prev-content',
        'Prev'
      );
      const next = getAnchorTag(
        currentPageAnchor.parentElement.nextElementSibling,
        'next-content',
        'Next'
      );
  
      pnaTarget.appendChild(prev);
      pnaTarget.appendChild(next);
    }
    const pagenavigationarrows = document.createElement('div');
    pagenavigationarrows.classList.add('pagenavigationarrows');
    pagenavigationarrows.innerHTML = pnaTarget.outerHTML;
    return pagenavigationarrows;
  };  
  
  const getMainContent = (main, pagenavigationarrows) => {
    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');
    const childItems = [...main.children];
    childItems.forEach((child) => mainContent.appendChild(child));
  
    const breadcrumb = mainContent.querySelector('.breadcrumb');
    if (breadcrumb) {
      breadcrumb.insertAdjacentElement('afterend', getLastUpdatedDate());
      breadcrumb.insertAdjacentElement('afterend', getTitle());

      if(pagenavigationarrows) {
        breadcrumb.parentElement.appendChild(pagenavigationarrows);
      }
    }
    return mainContent;
  };
  
  const restructMain = (main, toc, mainContent) => {
    main.innerHTML = toc.outerHTML + mainContent.outerHTML;
  };
  
  (() => {
    const main = getMain();
    const toc = getToc(main);
    const pna = getPageNavigationArrows(toc);
    const mainContent = getMainContent(main, pna);
    restructMain(main, toc, mainContent);
  })();
  