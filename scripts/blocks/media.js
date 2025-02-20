export function mapMediaContent(blockContent, figContent) {

    const x = {
        "layout":"right content",
        "foregroundImage": "https://s3-alpha-sig.figma.com/img/6ef4/1851/74bc530e2d9afcfbc5a58e126ed722ff?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=CZIZUVwmtlenJ4MG~rSYOR8OhKr3b3pYLKJ5R7F96AzN0-kBwsNMH7P3U1w7nFljGOvGZ4atA~eWaYsEZKEpFABE44AA9lyviTexobVfygu9AKVNbRIjXbdGLZdAmarxKp8kYnuSRyKpZPcQ~623qP~h~l51Q-ZyhMWIlviZn~plLQMlHMxGcrVBe6~ggLWS5o42ZUGlWF~rbQMZXUrTgOFAWLtmlhSFSi-Vaxtt8nNYx-Cb9iIWCiAQbHwaP98ly9qO4zGchMtEhlaSesiC4WJ4vfmUjZwjL~ozM43ztNNwpY-oLyk3dxcc-xUao9kOaLL5Zlb9DPXyKrsSP~lOCQ__",
        "detail":"this is the detail",
        "body":"this is the body",
        "heading": "this is the heading",
        "action": false,
        "action2": false,
    };

    if (!x) return;

    const ks = Object.keys(x);
    ks.forEach((k) => {
        switch(k) {
            case "layout":
                if (x.layout === 'right content') {
                    swapMediaDivs(blockContent);
                }
                break;
            case "foregroundImage":
                if (x.foregroundImage !== '') {
                    const img = blockContent.querySelector(':scope div div picture');
                    img.querySelector('img').src = x.foregroundImage;
                    img.querySelectorAll('div picture source').forEach((s) => {s.srcset = x.foregroundImage;});
                }
                break;
            case "detail":
                const detail = blockContent.querySelector(':scope div div p strong');
                if (x.detail !== '') {
                    detail.innerHTML = x.detail;
                } else {
                    detail.remove();
                }
            case "heading":
                const heading = blockContent.querySelector(':scope div h2');
                if (x.heading !== '') {
                    heading.innerHTML = x.heading;
                } else {
                    heading.remove();
                }
                break;
            case "body":
                const body = blockContent.querySelector(':scope div h2 + p');
                if (x.body !== '') {
                    body.innerHTML = x.body;
                } else {
                    body.remove();
                }
                break;
            case "action":
                const action = blockContent.querySelector(':scope strong a, :scope a strong');
                if (!x.action) action.remove();
                break;
            case "action2":
                const action2 = blockContent.querySelector(':scope em a, :scope a em');
                if (!x.action2) action2.remove();
                break;
            default:
                break;
        }
    });
}

function swapMediaDivs(blockContent) {  
    const innerDivs = blockContent.querySelectorAll(':scope div div');
    if (innerDivs.length != 2) return;
    
    // Swap elements
    const firstDiv = innerDivs[0];
    const secondDiv = innerDivs[1];
    
    firstDiv.parentNode.insertBefore(secondDiv, firstDiv);
}