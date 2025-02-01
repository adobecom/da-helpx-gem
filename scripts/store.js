export function fetchFromStorage(contentUrl) {
    const editorHtml = window.sessionStorage.getItem('editor-html');
    let html = "";
    if (editorHtml !== null) {
        const editorHtmlJson = JSON.parse(editorHtml);
        for (let i=0; i< editorHtmlJson.length; i++) {
            if (editorHtmlJson[i].url === contentUrl) {
                html = editorHtmlJson[i].html;
            }
        }
    }
    return html;
}

export function pushToStorage(obj) {
    const editorHtml = window.sessionStorage.getItem('editor-html');
    if (editorHtml !== null) {
        const editorHtmlJson = JSON.parse(editorHtml);
        editorHtmlJson.push(obj);
    }
}