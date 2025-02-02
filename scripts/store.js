export function fetchFromStorage(contentUrl) {
    const editorHtml = window.sessionStorage.getItem('editor-html');
    let html = "";
    if (editorHtml !== null) {
        const editorHtmlJson = JSON.parse(editorHtml);
        if (editorHtmlJson.url === contentUrl) {
            html = editorHtmlJson.html;
        }
    }
    return html;
}

export function fetchTargetHtmlFromStorage(contentUrl) {
    const editorHtml = window.sessionStorage.getItem('editor-html');
    let html = "";
    if (editorHtml !== null) {
        const editorHtmlJson = JSON.parse(editorHtml);
        if (editorHtmlJson.url === contentUrl) {
            html = editorHtmlJson.targetHtml;
        }
    }
    return html;
}

export function pushToStorage(obj) {
    window.sessionStorage.setItem('editor-html', JSON.stringify(obj));
}

export function pushEditableHtmlToSTore(editableHtml) {
    if (window.sessionStorage.getItem('editor-html')) {
        const json = JSON.parse(window.sessionStorage.getItem('editor-html'));
        json.editableHtml = editableHtml;
        window.sessionStorage.setItem('editor-html', JSON.stringify(json));
    }
}

export function pushTargetHtmlToSTore(html) {
    if (window.sessionStorage.getItem('editor-html')) {
        const json = JSON.parse(window.sessionStorage.getItem('editor-html'));
        json.targetHtml = html;
        window.sessionStorage.setItem('editor-html', JSON.stringify(json));
    }
}