import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comps',
    'figmaAuthToken': 'Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6IlpSbE9waWI3RGw5ejhyTEFSRjI4Sjl0Q3Yxend3R2ppclFWUEUtcHpocEUiLCJhbGciOiJSUzI1NiIsIng1dCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCIsImtpZCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYTdiMWI1YS03YjM0LTQzODctOTRhZS1kMmMxNzhkZWNlZTEvIiwiaWF0IjoxNzMyMTEzMjU4LCJuYmYiOjE3MzIxMTMyNTgsImV4cCI6MTczMjExODQ2NiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhZQUFBQVBnamVOOEhDMnhqTXBPTWVoYmQrbGtZOUlJLzdHc1NxMUk4K2VGN0pOL2o3OGVCZGhGNDVFbTU4dlN3UWoxRWc1OStpMiswVFlJWWkzS0Vod3BzWVgyRXIzcEdVQmpLN2cxcWlrVVNEWEM0PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiTWlsbyBTdHVkaW8iLCJhcHBpZCI6IjQ1YmYwNTEzLTg0YzgtNDc2NC05MTE5LTk4N2YwODI1NDNhNyIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiVGhha3VyIiwiZ2l2ZW5fbmFtZSI6Ik5pc2hhbnQgS3VtYXIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDYuNTEuMTYyLjE1MiIsIm5hbWUiOiJOaXNoYW50IEt1bWFyIFRoYWt1ciIsIm9pZCI6IjlhZWUxN2Y4LTg0YTAtNGU0Mi1hMWM3LWI1ZmEzOTM2YjRkZiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS03NjI5Nzk2MTUtMjAzMTU3NTI5OS05Mjk3MDEwMDAtMzEwNDg0IiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMwMDAwODY4NjAyMzMiLCJyaCI6IjEuQVNZQVdodDctalI3aDBPVXJ0TEJlTjdPNFFNQUFBQUFBQUFBd0FBQUFBQUFBQUFtQUdvbUFBLiIsInNjcCI6ImVtYWlsIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBGaWxlcy5SZWFkV3JpdGUuQWxsIEZpbGVzLlJlYWRXcml0ZS5BcHBGb2xkZXIgb3BlbmlkIHByb2ZpbGUgU2l0ZXMuTWFuYWdlLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjQ3dmhja0pKUEI1elRla0tOZ1B4Ulh3eXlWUE80VFoyRzVtMUN0MVNDMDAiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiV1ciLCJ0aWQiOiJmYTdiMWI1YS03YjM0LTQzODctOTRhZS1kMmMxNzhkZWNlZTEiLCJ1bmlxdWVfbmFtZSI6Im50aGFrdXJAYWRvYmUuY29tIiwidXBuIjoibnRoYWt1ckBhZG9iZS5jb20iLCJ1dGkiOiJRUGdyeFVYU2pFYVhqSHMxRmQwV0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2lkcmVsIjoiMSAzMCIsInhtc19zdCI6eyJzdWIiOiIxcE5RY0ZnZlJIRVBxbU9ycVBORkVyczFIdFpBdEQ2VDdSVFlUb3FabDRzIn0sInhtc190Y2R0IjoxMzYxODEyNzQ1fQ.AQxJtz2gWhjqGc8wLtJ93EOuBDBHpwIKj6x6a6LMC22HMmuixLK3T37KsNj87PUcy93d7YmbG9zWQfgZqNsOLXYlv3qwEyv7CbYbIcl7mO9t_YMnKOZlkPAyhG33p-yE41di8ccxfoRs-xwSEeL9dh6yeZiTfSnE_VMYDyksty_r9rClOb9M93PSvtpTu5_UkdJRV-5OQzmMNMjRTax7xKLAukPOMbqDMU2-DtY_H-SN9bmii_CC00dGcbDwSlsiePISGq_kt5qTJrEgaOwo83w1QTAyq8-ouDQ3sRNYi6Yqaeo9DnmF3Vb8K60fHy-qnO4NM8qAPjXTzS6UMlRe6A',
    'daToken': 'Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3Mzg0NDE0MzI3NzVfODIwOWJmN2YtZWJkMC00OGU0LWEyNzAtYjgxMzM4NjdmY2MxX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJkYXJrYWxsZXkiLCJ1c2VyX2lkIjoiQTIyQjI4OTY1OTM2NzMxMDBBNDk1RDI4QGFkb2JlLmNvbSIsInN0YXRlIjoie1wic2Vzc2lvblwiOlwiaHR0cHM6Ly9pbXMtbmExLmFkb2JlbG9naW4uY29tL2ltcy9zZXNzaW9uL3YxL1l6RmtZek5tTURZdFptSmpPQzAwT1RFekxUZ3pOR1V0TWpVM01XSm1aV0UzTlRJNExTMUJNakpDTWpnNU5qVTVNelkzTXpFd01FRTBPVFZFTWpoQVlXUnZZbVV1WTI5dFwifSIsImFzIjoiaW1zLW5hMSIsImFhX2lkIjoiQTIyQjI4OTY1OTM2NzMxMDBBNDk1RDI4QGFkb2JlLmNvbSIsImN0cCI6MCwiZmciOiJaRk5LUFJSQlhQUDdNSFdLSE9RVjJYQUFWRT09PT09PSIsInNpZCI6IjE3Mzc0NjQ4NzIwMDlfNjI5M2VmNDctMjRlOC00MmMwLWFiNDktODQ0NmM2MTJhNjM3X3V3MiIsIm1vaSI6IjhmZWE5ZjI4IiwicGJhIjoiT1JHLE1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwiY3JlYXRlZF9hdCI6IjE3Mzg0NDE0MzI3NzUiLCJzY29wZSI6ImFiLm1hbmFnZSxBZG9iZUlELGduYXYsb3BlbmlkLG9yZy5yZWFkLHJlYWRfb3JnYW5pemF0aW9ucyxzZXNzaW9uLGFlbS5mcm9udGVuZC5hbGwsYWRkaXRpb25hbF9pbmZvLm93bmVyT3JnIn0.GxEnjg8qk8p1i_E-0oHoNxu1kEmDySZLeQf1zkZsjoGVHytqaJ3DiUdKLo72k5tJw13iV8iVoOkWTmp2-aqXY-i71FAz8yc1S6M4AA5ByekiUd4pIgtMo5DKbWSgNiYFHqUeAhDKq_bqpCfr0S7ZGPahbcQBkA38IxiBize9Qu3d3V_tnnrC_mNRiD4xdsOPWCqziP8e6qYY1PtbkamJ3QcMQZfY9pFNnXlLBUoqbHq7vR7j3h8A4XbUioh3NEKSuaKvs98iddUxkTJNEzNWIVoUBOecnkswfjwMfzYJt4QSHx_-a4rajxg--jA74qoUsF5Ks_ufTTIHIrha0RGObg'
}

async function initPreviewer() {
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');
    const editable = getQueryParam('editable');
    const target = getQueryParam('target');
    const targetUrl = getQueryParam('targetUrl');

    if (!source || !contentUrl || !target || !targetUrl) {
        throw new Error("Source, content Url, target url or target cannot be empty! Stoppping all processing!");
    }

    // handle the content injection and WYSIWYG editor painting
    await initiatePreviewer(source, contentUrl, editable, target, targetUrl);
    await persist();
}

export async function persist() {
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');
    const target = getQueryParam('target');
    const targetUrl = getQueryParam('targetUrl');

    if (!source || !contentUrl || !target || !targetUrl) {
        throw new Error("Source, content Url, target url or target cannot be empty! Stoppping all processing!");
    }

    await persistOnTarget(contentUrl, target, targetUrl, CONFIGS);
    console.log('Successfully persisted on DA');
}

async function initiatePreviewer(source, contentUrl, editable, target, targetUrl) {
    let html = "";
    if (source === 'figma') {
        html = await fetchFigmaContent(contentUrl, CONFIGS);
    }

    html = targetCompatibleHtml(html, target, targetUrl, CONFIGS);

    if (editable && html) {
        html = renderEditableHtml(html);
    }

    paintHtmlOnPage(html);

    // finally call the Milo loadarea function to paint the WYSIWYG page
    const { loadArea } = await import(
        `https://main--milo--adobecom.hlx.live/libs/utils/utils.js`
      );
    await loadArea();
}

function paintHtmlOnPage(html) {
    const mainEle = document.createElement('main');
    const wrappingDiv = document.createElement('div');
    wrappingDiv.innerHTML = html;
    mainEle.appendChild(wrappingDiv);
    document.body.appendChild(mainEle);
}

// TODO: manage error handling
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

initPreviewer();