export default (block) => {
  const elements = [];
  const ol = document.createElement('ol');
  ol.classList.add('steps');
  [...block.children].forEach((child) => {
    if (child.children[0] && child.children[0].children[0]) {
      if (child.children[0].children[0].tagName.toLowerCase() === 'h2') {
        if (elements.length != 0) {
          const li = document.createElement('li');
          li.classList.add('step');
          while (elements.length > 0) {
            li.appendChild(elements.shift());
          }
          ol.appendChild(li);
        }
      }
      [...child.children[0].children].forEach((element) =>
        elements.push(element)
      );
    }
  });
  if (elements.length != 0) {
    const li = document.createElement('li');
    while (elements.length > 0) {
      li.appendChild(elements.shift());
    }
    ol.appendChild(li);
  }
  block.replaceChildren(ol);
};
