export default function decorate(block) {
    const buttons = block.querySelectorAll('.btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        console.log(`Clicked: ${btn.textContent}`);
      });
    });
  }
