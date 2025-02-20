export function mapMediaContent(blockContent, figContent) {

    const x = {
        "layout":"right content / left content",
        "foregroundImage": "url",
        "detail":"lorem20",
        "body":"lorem50",
        "action": true,
        "action2": true,
    };

    if (!x) return;

    // const ks = Object.keys(x);
    // ks.forEach((k) => {
    //     switch(k) {
    //     case  "background":
    //         if (!x.background.startsWith('http')) {
    //             const p = blockContent.querySelector(':scope div div');
    //             p.innerHTML = x.background;
    //         } else {
    //             blockContent.querySelector('div picture img').src = x.background;
    //         }
    //         break;
    //     case  "foregroundImage":
    //         const a = blockContent.querySelectorAll(':scope > div')[1].querySelectorAll(':scope > div')[1];
    //         a.querySelector('img').src = x.foregroundImage;
    //         a.querySelectorAll('div picture source').forEach((s) => {s.srcset = x.foregroundImage;});
    //         break;
    //     case  "heading":
    //         blockContent.querySelector('h1').innerHTML = x.heading;
    //         const det = blockContent.querySelector('h1').previousElementSibling;
    //         if (det && det.innerText.includes('OPTIONAL')) det.remove();
    //         break;
    //     case  "body":
    //         blockContent.querySelector('h1 + p').innerHTML = x.body;
    //         break;
    //     case  "actions":
    //         if (x.actions) {
    //             blockContent.querySelector('a strong, strong a').innerHTML = 'Buy Now';
    //             blockContent.querySelector('a em, em a').innerHTML = 'Free Trial';
    //         } else {
    //             const primaryBtn = blockContent.querySelector('a strong, strong a');
    //             const secBtn = blockContent.querySelector('a em, em a');
    //             primaryBtn.remove();
    //             secBtn.remove();
    //         }
    //         break;
    //     }
    // });
}