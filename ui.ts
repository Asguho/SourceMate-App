// To run this script:
// deno run --allow-all --unstable hello_world.ts

// Import from local (Debugging and Development)
// import { WebUI } from "../../mod.ts";

// Import from deno.land (Production)
import { WebUI } from "https://deno.land/x/webui/mod.ts";
import { getSource } from "./utils.ts";

const title = "Source Manager";
const myHtml = `
<!DOCTYPE html>
<html>
	<head>
    <script src="webui.js"></script>
		<title>${title} </title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        color: white;
        background: linear-gradient(to right, #507d91, #1c596f, #022737);
        text-align: center;
        font-size: 18px;
      }
      button, input {
        padding: 10px;
        margin: 10px;
        border-radius: 3px;
        border: 1px solid #ccc;
        box-shadow: 0 3px 5px rgba(0,0,0,0.1);
        transition: 0.2s;
      }
      button {
        background: #3498db;
        color: #fff; 
        cursor: pointer;
        font-size: 16px;
      }
      h1 { text-shadow: -7px 10px 7px rgb(67 57 57 / 76%); }
      button:hover { background: #c9913d; }
      input:focus { outline: none; border-color: #3498db; }
    </style>
    </head>
    <body>
        <h1>${title}</h1>
        <br>
        <section id="inputSection">
          <span>Url: <input id="urlInput" value="https://videnskab.dk/naturvidenskab/quiz-kan-du-kende-forskel-paa-dansk-naturs-look-a-likes/"></span>
          <br>
          <br>
          <button id="getSource">getSource</button>
        </section>
    </body>
    <script>
      function openEditSourceWindow(sourceString) {
        const source = JSON.parse(sourceString);
        const section = document.createElement("section");
        section.setAttribute("id", "editSource");

        for (const key in source) {    
          // add label
          const label = document.createElement("label");
          label.setAttribute("for", key);
          label.innerText = key;
          section.appendChild(label);

          // add input
          const input = document.createElement("input");
          input.setAttribute("type", "text");
          input.setAttribute("id", key);
          input.setAttribute("value", source[key]);
          section.appendChild(input);
        }
        const saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        section.appendChild(saveButton);

        const oldSection = document.getElementById("editSource");
        if (oldSection) {
          oldSection.remove();
        }

        document.body.appendChild(section);
      }

    </script>    
</html>
`;
// Create new window
const myWindow = new WebUI();
// Bind
myWindow.bind("getSource", async (e: WebUI.Event) => {
  try {
    getSource(
      await e.window.script("return document.getElementById('urlInput').value"),
    ).then((response) => {
      console.log(`alert(\`${JSON.stringify(response)}\`)`);
      // e.window.run(`alert(\`${JSON.stringify(response)}\`)`);
      e.window.run(`openEditSourceWindow(\`${JSON.stringify(response)}\`)`);
    }).catch((error) => {
      console.error(error);
    });
  } catch (error) {
    console.error(error);
  }
});
myWindow.bind("exit", () => {
  WebUI.exit();
});

// Show the window
myWindow.show(myHtml); // Or myWindow.show('./myFile.html');

// Wait until all windows get closed
await WebUI.wait();

console.log("Thank you.");
