function createCopyButton(code, chroma) {
  let button = document.createElement("button");
  button.className = "copy-code-button";
  button.type = "button";
  button.innerText = "Copy";
  button.addEventListener("click", () => copyCodeBlock(button, code, chroma));
  return button;
}

async function copyCodeBlock(button, code, chroma) {
  try {
    result = await navigator.permissions.query({ name: "clipboard-write" });
    if (result.state == "granted" || result.state == "prompt") {
      await navigator.clipboard.writeText(code.innerText);
    } else {
      copyCodeBlockExecCommand(code, chroma);
    }
    codeWasCopied(button);
  } catch (_) {
    copyCodeBlockExecCommand(code, chroma);
    codeWasCopied(button);
  }
}

function copyCodeBlockExecCommand(code, chroma) {
  let textArea = document.createElement("textArea");
  textArea.className = "copyable-text-area";
  textArea.value = code.innerText;
  chroma.parentNode.insertBefore(textArea, chroma);
  textArea.select();
  document.execCommand("copy");
  chroma.parentNode.removeChild(textArea);
}

function codeWasCopied(button) {
  button.blur();
  button.innerText = "Copied!";
  setTimeout(function() {
    button.innerText = "Copy";
  }, 2000);
}

function addCopyButtonToDom(button, chroma, highlight) {
  chroma.parentNode.insertBefore(button, chroma);
  let wrapper = document.createElement("div");
  wrapper.className = "highlight-wrapper";
  highlight.parentNode.insertBefore(wrapper, highlight);
  wrapper.appendChild(highlight);
}

document.querySelectorAll(".highlight").forEach(
  highlight => {
      let code = highlight.querySelector('code[class^="language"]');
      let chroma = highlight.firstChild;
      let button = createCopyButton(code, chroma);
      addCopyButtonToDom(button, chroma, highlight);
    }
);
