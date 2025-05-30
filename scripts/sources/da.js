
export async function fetchDAContent(daUrl, CONFIGS) {
    const html = await getDAContent(daUrl, CONFIGS);
    // window.sessionStorage.setItem('previewer-html', htmlAndMapping.html);
    console.log(html);
    return htmlAndMapping;
}

async function getDAContent(daUrl, CONFIGS) {
    let url = daUrl;
    if (!url.startsWith('/')) {
        url = '/' + url;
    }
    if (!url.endsWith(".html")) 
    {
        url += ".html";
    }
    
    const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'text/html',
          Authorization: CONFIGS.figmaAuthToken // add a valid token
        }
    };
      
    const response = await fetch(`https://admin.da.live/source${url}`, options)

    if (!response.ok) {
    return {};
    }

    const html = await response.text();
    return html;
}