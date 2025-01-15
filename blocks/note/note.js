/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export default (block) => {
  const noteMarkUp = ruleSet(block);
  const noteHTML = createNoteBlock(noteMarkUp);
  replaceNoteContent(block, noteHTML);
}

function ruleSet(block) {
  const parentClass = block.getAttribute('class');
  const content = block.querySelector(`div.${parentClass} > div > div`);
  const keyValuePair = {
    type: parentClass,
    content: content.innerHTML
  };

  return keyValuePair;
}

function createNoteBlock(data) {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="${data.type}">
      <span class="noteHeader">Note:</span>
      <p class="noteContent"><b>Note: </b>${data.content}</p>
    </div>
  `;
  return div.firstElementChild;
}

function replaceNoteContent(block,newContent) {
  if (block && block.classList.contains('note')) {
    block.innerHTML = newContent.innerHTML;
  }
}
