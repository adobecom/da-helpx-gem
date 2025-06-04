import {getDACompatibleHtml, postData} from './target/da.js';
import {fetchTargetHtmlFromStorage, pushTargetHtmlToSTore} from './store.js';

export function targetCompatibleHtml(html, target, CONFIGS, metadataMap = null) {

    if (target === 'da') {
        let modifiedHtml = getDACompatibleHtml(html, CONFIGS);
        if (metadataMap) {
            modifiedHtml = populateMetadataBlock(html,metadataMap);
        }
        pushTargetHtmlToSTore(modifiedHtml);
        return modifiedHtml;
    }
}

function populateMetadataBlock(html, metadataMap) {
    let metaHtml = "<div><div class='metadata'>";
    for (const [key, value] of Object.entries(metadataMap)) {
        metaHtml += `<div><div><p>${key}</p></div><div><p>${value}</p></div></div>`;
    }
    metaHtml += "</div></div>";
    return html + metaHtml;
}

export async function persistOnTarget(contentUrl, target, targetUrl, CONFIGS) {
    if (target === 'da') {
        return await postData(targetUrl, fetchTargetHtmlFromStorage(contentUrl), CONFIGS);
    }
}
