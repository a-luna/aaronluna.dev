function createCopyButton(highlight) {
  const button = document.createElement("button");
  button.className = "copy-code-button";
  button.type = "button";
  button.innerText = "Copy";
  button.addEventListener("click", () => copyCodeToClipboard(button, highlight));
  addCopyButtonToDom(button, highlight);
}

async function copyCodeToClipboard(button, highlight) {
  const codeElement = highlight.querySelector(":last-child > .chroma > code");
  const codeToCopy = codeElement.innerText;
  try {
    result = await navigator.permissions.query({ name: "clipboard-write" });
    if (result.state == "granted" || result.state == "prompt") {
      await navigator.clipboard.writeText(codeToCopy);
    } else {
      copyCodeBlockExecCommand(codeToCopy, highlight);
    }
  } catch (_) {
    copyCodeBlockExecCommand(codeToCopy, highlight);
  }
  finally {
    codeWasCopied(button);
  }
}

function copyCodeBlockExecCommand(codeToCopy, highlight) {
  const textArea = document.createElement("textArea");
  textArea.contentEditable = 'true'
  textArea.readOnly = 'false'
  textArea.className = "copyable-text-area";
  textArea.value = codeToCopy;
  highlight.insertBefore(textArea, highlight.firstChild);
  const range = document.createRange()
  range.selectNodeContents(textArea)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
  textArea.setSelectionRange(0, 999999)
  document.execCommand("copy");
  highlight.removeChild(textArea);
}

function codeWasCopied(button) {
  button.blur();
  button.innerText = "Copied!";
  setTimeout(function() {
    button.innerText = "Copy";
  }, 2000);
}

function addCopyButtonToDom(button, highlight) {
  highlight.insertBefore(button, highlight.firstChild);
  const wrapper = document.createElement("div");
  wrapper.className = "highlight-wrapper";
  highlight.parentNode.insertBefore(wrapper, highlight);
  wrapper.appendChild(highlight);
}

document.querySelectorAll(".highlight")
  .forEach(highlight => createCopyButton(highlight));
