export async function mapGenerativeContent(html, generativeContent) {
    console.log(generativeContent);
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function run() {
      console.log("Start");
      await delay(2000);
      console.log("Executed after 2 seconds");
    }
    run();
    return html;
}
