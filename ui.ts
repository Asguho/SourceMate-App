// To run this script:
// deno run --allow-all --unstable hello_world.ts

// Import from local (Debugging and Development)
// import { WebUI } from "../../mod.ts";

// Import from deno.land (Production)
import { WebUI } from "https://deno.land/x/webui/mod.ts";
import { getSource } from "./utils.ts";

const title = "Source Manager";

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
myWindow.show(
  Deno.readTextFileSync(
    "C:/Users/aske/Documents/GitHub/word-source-cli/word-cli-frontend/.svelte-kit/output/prerendered/pages/index.html",
  ),
); // Or myWindow.show('./myFile.html');

// Wait until all windows get closed
await WebUI.wait();

console.log("Thank you.");
