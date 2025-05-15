import {fetchFigmaContent} from './sources/figma.js';
import {renderEditableHtml} from './editor.js';
import {targetCompatibleHtml} from './target.js';
import {persistOnTarget} from './target.js';
import {mapGenerativeContent} from './sources/generativeContent.js';

const CONFIGS = {
    'figmaMappingUrl': 'https://440859-genesis-dev.adobeio-static.net/api/v1/web/genesis-aio/fig-comps',
    'figmaAuthToken': '',
    'daToken': '',
    'figmaBlockContentUrl': 'https://runtime.adobe.io/api/v1/web/440859-genesis-dev/genesis-aio/fig-comp-details'
}

// Hack to handle auth
const storedFigmaAuthToken = window.localStorage.getItem('figmaAuthToken');
const storedDaToken = window.localStorage.getItem('daToken');
if (storedFigmaAuthToken && !CONFIGS.figmaAuthToken) {
  CONFIGS.figmaAuthToken = storedFigmaAuthToken;
}
if (storedDaToken && !CONFIGS.daToken) {
  CONFIGS.daToken = storedDaToken;
}

async function initPreviewer() {
    const source = getQueryParam('source');
    const contentUrl = getQueryParam('contentUrl');
    const editable = getQueryParam('editable');
    const target = getQueryParam('target');
    const targetUrl = getQueryParam('targetUrl');
    const token = getQueryParam('token');
    CONFIGS.figmaAuthToken = 'Bearer ' + token;
    CONFIGS.daToken = 'Bearer ' + token;

    // TODO: delete the window context steting later as this would come from Stream Chat agent
    window.stream = {};
    window.stream.chat = {
        "context": "Certainly! To create a comprehensive technical requirement document for the web design strategy targeting creative designers, I will outline the key sections and details you might need. Heres a draft template you can customize:\n\n---\n\n# Technical Requirement Document: Web Redesign Strategy to Target Creative Designers\n\n## 1. Project Overview\n- **Project Name:** Creative Designers Campaign Web Redesign\n- **Purpose:** Redesign the website to attract creative designers and encourage them to use our product.\n- **Stakeholders:** Marketing Team, Product Team, Design Team, Development Team\n\n## 2. Objectives\n- Increase engagement from creative designers\n- Highlight features relevant to designers\n- Improve user experience tailored to creative workflows\n- Enhance brand perception as a design-friendly product\n\n## 3. Target Audience\n- Professional creative designers (graphic designers, UX/UI designers, illustrators, etc.)\n- Design students and freelancers\n- Agencies specializing in creative projects\n\n## 4. Functional Requirements\n\n### 4.1 User Interface (UI) Requirements\n- Modern, visually appealing design with a creative flair\n- Use of vibrant colors, creative typography, and dynamic layouts\n- Showcase portfolio examples or case studies relevant to designers\n- Interactive elements such as sliders, hover effects, and animations\n- Responsive design for desktop, tablet, and mobile devices\n\n### 4.2 Content Requirements\n- Dedicated sections highlighting product benefits for designers\n- Tutorials, design tips, and inspiration blog posts\n- Testimonials and success stories from creative professionals\n- Downloadable resources like design templates or toolkits\n\n### 4.3 User Experience (UX) Requirements\n- Intuitive navigation tailored for designers' interests\n- Quick access to product demos or free trials\n- Easy sign-up or onboarding process\n- Integration with design tools or plugins if applicable\n\n### 4.4 Performance Requirements\n- Fast loading times (<3 seconds)\n- Optimized images and media content\n- SEO optimized for keywords related to creative design\n\n## 5. Technical Requirements\n\n### 5.1 Platform and Technology Stack\n- Frontend: React.js / Vue.js / Angular (choose based on current stack)\n- Backend: Node.js / Django / Ruby on Rails (as applicable)\n- CMS: Headless CMS or custom CMS for managing creative content\n- Hosting: Cloud provider with CDN for performance (e.g., AWS, Azure, Cloudflare)\n\n### 5.2 Integration Requirements\n- Analytics tools (Google Analytics, Hotjar)\n- Marketing tools (Mailchimp, HubSpot)\n- Social media integrations (Instagram, Behance, Dribbble)\n- Product trial and sign-up system integration\n\n### 5.3 Security Requirements\n- HTTPS enabled\n- Data protection for user sign-ups\n- Compliance with GDPR/CCPA as applicable\n\n## 6. Design Guidelines\n- Follow brand identity with added creative elements\n- Use imagery and iconography that resonate with designers\n- Accessibility compliance (WCAG 2.1 AA standard)\n\n## 7. Testing and Quality Assurance\n- Cross-browser compatibility testing\n- Responsive design testing on various devices\n- Usability testing with creative designers' feedback\n- Performance testing for load times\n\n## 8. Timeline and Milestones\n- Research and Requirement Gathering: 2 weeks\n- Design Phase: 3 weeks\n- Development Phase: 4 weeks\n- Testing and QA: 2 weeks\n- Launch: [Date]\n\n## 9. Success Metrics\n- Increase in website traffic from creative designers by X%\n- Increase in product sign-ups from target audience by Y%\n- Engagement metrics (time on page, bounce rate) improvement\n- Positive feedback from user testing sessions\n\n---\n\nWould you like me to help with a more detailed version or specific sections like the UI/UX design specifications or integration details?"
    }

    // check if context is present

    let context = null;
    if (window.stream && window.stream.chat && window.stream.chat.context) {
        context = window.stream?.chat?.context;
    }

    if (!source || !contentUrl || !target || !targetUrl) {
        throw new Error("Source, content Url, target url or target cannot be empty! Stoppping all processing!");
    }

    // handle the content injection and WYSIWYG editor painting
    await initiatePreviewer(source, contentUrl, editable, target, targetUrl);
    // await persist(source, contentUrl, target, targetUrl);
}

export async function persist(source, contentUrl, target, targetUrl) {
    await persistOnTarget(contentUrl, target, targetUrl, CONFIGS);
    console.log('Successfully persisted on DA');
}

async function initiatePreviewer(source, contentUrl, editable, target, targetUrl, context) {
    let html = '';
    if (source === 'figma') {
        html = await fetchFigmaContent(contentUrl, CONFIGS);
    }

    targetCompatibleHtml(html, target, targetUrl, CONFIGS);

    if (editable && html) {
        html = renderEditableHtml(html);
    }

    if (context) {
        html = await mapGenerativeContent(html, context);
    }

    paintHtmlOnPage(html, source, contentUrl, target, targetUrl);


    window["page-load-ok-milo"].remove();
    // finally call the Milo loadarea function to paint the WYSIWYG page
    document.querySelector('head').innerHTML += '<meta name="martech" content="off">';
    const { loadArea } = await import(
        `https://main--milo--adobecom.aem.live/libs/utils/utils.js`
      );
    await loadArea();
}

async function paintHtmlOnPage(html, source, contentUrl, target, targetUrl) {
    const mainEle = document.createElement('main');
    const wrappingDiv = document.createElement('div');
    wrappingDiv.innerHTML = html;
    mainEle.appendChild(wrappingDiv);
    document.body.appendChild(mainEle);

    const pushToDABtn = document.createElement('a');
    pushToDABtn.href = '#';
    pushToDABtn.classList.add('cta-button');
    pushToDABtn.innerHTML = '<span><img height="24px" width="24px" src="https://da.live/blocks/edit/img/Smock_Send_18_N.svg"></span>Push to DA';

    document.body.append(pushToDABtn);

    await persist(source, contentUrl, target, targetUrl);

    const message = { daUrl: `https://da.live/edit#/${targetUrl}` };

    // Send the message to the parent window
    window.parent.postMessage(message, '*');

    pushToDABtn.addEventListener('click', async () => {
        await persist(source, contentUrl, target, targetUrl);
    });
}

// TODO: manage error handling
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

initPreviewer();
