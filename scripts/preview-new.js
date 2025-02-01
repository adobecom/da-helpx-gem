function initPreviewer() {
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
    // spinner.style.display = 'none'; 
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
        let html = "";
        const editorHtml = window.sessionStorage.getItem('editor-html');
        if (editorHtml !== null) {
            const editorHtmlJson = JSON.parse(editorHtml);
            if (editorHtmlJson.url === contentUrl) {
                html = editorHtmlJson.html;
            }
        } else {
            const blockMapping = await fetchFigmaMapping(contentUrl);
            console.log('figmaBlockMapping is : ', blockMapping);
    
            if (blockMapping !== null && blockMapping.details !== undefined && blockMapping.details.components !== undefined) {
                console.log('found the right set of mapping with size: ', blockMapping.details.components.length);
                html = await createHTML(blockMapping.details.components);
                html = html.replaceAll("./media","https://main--milo--adobecom.hlx.page/media");
                window.sessionStorage.setItem('editor-html', JSON.stringify({'url': contentUrl, 'html':html}));
            }
        }

        const mainEle = document.createElement('main');
        const wrappingDiv = document.createElement('div');
        wrappingDiv.innerHTML = html;
        mainEle.appendChild(wrappingDiv);
        document.body.appendChild(mainEle);

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
          Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6IlpSbE9waWI3RGw5ejhyTEFSRjI4Sjl0Q3Yxend3R2ppclFWUEUtcHpocEUiLCJhbGciOiJSUzI1NiIsIng1dCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCIsImtpZCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYTdiMWI1YS03YjM0LTQzODctOTRhZS1kMmMxNzhkZWNlZTEvIiwiaWF0IjoxNzMyMTEzMjU4LCJuYmYiOjE3MzIxMTMyNTgsImV4cCI6MTczMjExODQ2NiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhZQUFBQVBnamVOOEhDMnhqTXBPTWVoYmQrbGtZOUlJLzdHc1NxMUk4K2VGN0pOL2o3OGVCZGhGNDVFbTU4dlN3UWoxRWc1OStpMiswVFlJWWkzS0Vod3BzWVgyRXIzcEdVQmpLN2cxcWlrVVNEWEM0PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiTWlsbyBTdHVkaW8iLCJhcHBpZCI6IjQ1YmYwNTEzLTg0YzgtNDc2NC05MTE5LTk4N2YwODI1NDNhNyIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiVGhha3VyIiwiZ2l2ZW5fbmFtZSI6Ik5pc2hhbnQgS3VtYXIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDYuNTEuMTYyLjE1MiIsIm5hbWUiOiJOaXNoYW50IEt1bWFyIFRoYWt1ciIsIm9pZCI6IjlhZWUxN2Y4LTg0YTAtNGU0Mi1hMWM3LWI1ZmEzOTM2YjRkZiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS03NjI5Nzk2MTUtMjAzMTU3NTI5OS05Mjk3MDEwMDAtMzEwNDg0IiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMwMDAwODY4NjAyMzMiLCJyaCI6IjEuQVNZQVdodDctalI3aDBPVXJ0TEJlTjdPNFFNQUFBQUFBQUFBd0FBQUFBQUFBQUFtQUdvbUFBLiIsInNjcCI6ImVtYWlsIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBGaWxlcy5SZWFkV3JpdGUuQWxsIEZpbGVzLlJlYWRXcml0ZS5BcHBGb2xkZXIgb3BlbmlkIHByb2ZpbGUgU2l0ZXMuTWFuYWdlLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjQ3dmhja0pKUEI1elRla0tOZ1B4Ulh3eXlWUE80VFoyRzVtMUN0MVNDMDAiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiV1ciLCJ0aWQiOiJmYTdiMWI1YS03YjM0LTQzODctOTRhZS1kMmMxNzhkZWNlZTEiLCJ1bmlxdWVfbmFtZSI6Im50aGFrdXJAYWRvYmUuY29tIiwidXBuIjoibnRoYWt1ckBhZG9iZS5jb20iLCJ1dGkiOiJRUGdyeFVYU2pFYVhqSHMxRmQwV0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2lkcmVsIjoiMSAzMCIsInhtc19zdCI6eyJzdWIiOiIxcE5RY0ZnZlJIRVBxbU9ycVBORkVyczFIdFpBdEQ2VDdSVFlUb3FabDRzIn0sInhtc190Y2R0IjoxMzYxODEyNzQ1fQ.AQxJtz2gWhjqGc8wLtJ93EOuBDBHpwIKj6x6a6LMC22HMmuixLK3T37KsNj87PUcy93d7YmbG9zWQfgZqNsOLXYlv3qwEyv7CbYbIcl7mO9t_YMnKOZlkPAyhG33p-yE41di8ccxfoRs-xwSEeL9dh6yeZiTfSnE_VMYDyksty_r9rClOb9M93PSvtpTu5_UkdJRV-5OQzmMNMjRTax7xKLAukPOMbqDMU2-DtY_H-SN9bmii_CC00dGcbDwSlsiePISGq_kt5qTJrEgaOwo83w1QTAyq8-ouDQ3sRNYi6Yqaeo9DnmF3Vb8K60fHy-qnO4NM8qAPjXTzS6UMlRe6A' // add a valid token
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

initPreviewer();
