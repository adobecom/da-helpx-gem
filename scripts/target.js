import {getDACompatibleHtml, postData} from './target/da.js';
import {fetchTargetHtmlFromStorage, pushTargetHtmlToSTore} from './store.js';

export function targetCompatibleHtml(html, target, CONFIGS) {

    if (target === 'da') {
        let modifiedHtml = getDACompatibleHtml(html, CONFIGS);
        modifiedHtml = populateMetadataBlock(modifiedHtml);
        pushTargetHtmlToSTore(modifiedHtml);
        return modifiedHtml;
    }
}

function populateMetadataBlock(html) {
    return html += '<div class="metadata"> <div> <div><p>Title</p></div> <div><p>Customer Success Stories</p></div> </div> <div> <div><p>robots</p></div> <div><p>noodp</p></div> </div> <div> <div><p>description</p></div> <div> <p> Read our customer case studies and discover how Adobe Experience Cloud, Creative Cloud, and Document Cloud help the worlds leading brands. </p> </div> </div> <div> <div><p>keywords</p></div> <div><p>Experience Cloud</p></div> </div> <div> <div><p>serp-content-type</p></div> <div><p>case</p></div> </div> <div> <div><p>pageCreatedAt</p></div> <div><p>en</p></div> </div> <div> <div><p>translated</p></div> <div><p>false</p></div> </div> <div> <div><p>publishDate</p></div> <div><p>21-04-2022</p></div> </div> <div> <div><p>productJcrID</p></div> <div><p>products:SG_EXPERIENCECLOUD</p></div> </div> <div> <div><p>primaryProductName</p></div> <div><p>Experience Cloud</p></div> </div> <div> <div><p>data-event-swan-sessions-endpoint</p></div> <div></div> </div> <div> <div><p>data-jarvis-demandbase-enabled</p></div> <div><p>true</p></div> </div> <div> <div><p>entity_id</p></div> <div></div> </div> <div> <div><p>#teeside</p></div> <div> <p> https://business.adobe.com/fragments/customer-success-stories/modals/teesside-university </p> </div> </div> <div> <div><p>Tags</p></div> <div><p>Firefly</p></div> </div> </div>'
}

export async function persistOnTarget(contentUrl, target, targetUrl, CONFIGS) {
    if (target === 'da') {
        return await postData(targetUrl, fetchTargetHtmlFromStorage(contentUrl), CONFIGS);
    }
}
