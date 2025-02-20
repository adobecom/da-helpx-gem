import {getDACompatibleHtml, postData} from './target/da.js';
import {fetchTargetHtmlFromStorage, pushTargetHtmlToSTore} from './store.js';

export function targetCompatibleHtml(html, target, CONFIGS) {

    if (target === 'da') {
        const modifiedHtml = getDACompatibleHtml(html, CONFIGS);
        pushTargetHtmlToSTore(modifiedHtml);
        return modifiedHtml;
    }
}

export async function persistOnTarget(contentUrl, target, targetUrl, CONFIGS) {
    if (target === 'da') {
        return await postData(targetUrl, fetchTargetHtmlFromStorage(contentUrl), CONFIGS);
    }
}
