import {getDACompatibleHtml, postData} from './target/da.js';
import {fetchTargetHtmlFromStorage, pushTargetHtmlToSTore} from './store.js';

export function targetCompatibleHtml(html, target, CONFIGS, metadataMap = null) {

    if (target === 'da') {
        let modifiedHtml = getDACompatibleHtml(html, CONFIGS);
        if (metadataMap) {
            modifiedHtml = populateMetadataBlock(metadataMap);
        }
        pushTargetHtmlToSTore(modifiedHtml);
        return modifiedHtml;
    }
}

function populateMetadataBlock(metadataMap) {
    let html = "<div><div class='metadata'>";
    for (const [key, value] of Object.entries(metadataMap)) {
        html += `<div><div><p>${key}</p></div><div><p>${value}</p></div></div>`;
    }
    html += "</div></div>";
    return html
}

export async function persistOnTarget(contentUrl, target, targetUrl, CONFIGS) {
    if (target === 'da') {
        return await postData(targetUrl, fetchTargetHtmlFromStorage(contentUrl), CONFIGS);
    }
}
