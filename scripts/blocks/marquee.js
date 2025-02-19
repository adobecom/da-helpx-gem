export function mapMarqueeContent(blockContent) {
    blockContent.classList.remove('small');
    blockContent.classList.add('light');
    blockContent.classList.add('large');

    const x = {
        "background": "#ababab",
        "backgroundType": "color",
        "foregroundImage": "https://s3-alpha-sig.figma.com/img/0975/3f2d/07335ce02672c2703cee4c63cf6a7afb?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=hvXW6kd1o3pH0Dgo6Y3CJtts-xsRvYCfZawSalZKwscWI7T8rzOvT7z503~7HG7CGuFn8KZs8QhIRPbYW8C~EmlLWRKLR~WTp3idCNV8OHg0oQrJF7UAYvSJKdNCAagdMSi6kqbvxDzoNU5Yw4Kcg00ErRH4Sd1aWq~sdeslN4dDimyV6XlOapHuci4SUTF-KwNoT3dtu~2yIpjIuFMOdzlPLqi0Mpem28AJWON-C9mF9SRQVDbpeWcw~vCutEz3e6lWkXEZvo7gdtKuaENlPRrqZ2Hz3-WQWfP6QY~bFM5AZT79OmbEXsNmvKi-kQy---C8QI5WDkHak1zwsmAI5g__",
        "heading": "Find that hard-to-type font with Retype",
        "body": "Identify a fontIdentify a font used in any image with Retype in Adobe Illustrator. Then, choose from a list of suggested font matches to get just the right look.",
        "actions": true
    };

    const ks = Object.keys(x);
    ks.forEach((k) => {
        switch(k) {
        case  "background":
            if (x.backgroundType === 'color') {
            const p = blockContent.querySelector(':scope div div');
            p.innerHTML = x.background;
            } else {
            blockContent.querySelector('div picture img').src = x.background;
            }
            break;
        case  "foregroundImage":
            const a = blockContent.querySelectorAll(':scope > div')[1].querySelectorAll(':scope > div')[1];
            a.querySelector('img').src = x.foregroundImage;
            a.querySelectorAll('div picture source').forEach((s) => {s.srcset = x.foregroundImage;});
            break;
        case  "heading":
            blockContent.querySelector('h1').innerHTML = x.heading;
            const det = blockContent.querySelector('h1').previousElementSibling;
            if (det && det.innerText.includes('OPTIONAL')) det.remove();
            break;
        case  "body":
            blockContent.querySelector('h1 + p').innerHTML = x.body;
            break;
        case  "actions":
            blockContent.querySelector('a strong, strong a').innerHTML = 'Buy Now';
            blockContent.querySelector('a em, em a').innerHTML = 'Free Trial';
            break;
        }
    });
}