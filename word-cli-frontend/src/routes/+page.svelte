    <script lang="ts">
	import { onMount } from "svelte";
    import { dev } from "$app/environment";

      function openEditSourceWindow(sourceString: string) {
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
      onMount(()=>{
        if(!dev){
            const script = document.createElement("script");
            script.src = "webui.js";
            document.body.appendChild(script);
        }
      })

    </script>  

    <body>
        <br>
        <section id="inputSection">
          <span>Url: <input id="urlInput" value="https://videnskab.dk/naturvidenskab/quiz-kan-du-kende-forskel-paa-dansk-naturs-look-a-likes/"></span>
          <br>
          <br>
          <button id="getSource" class="w-full">getSource</button>
        </section>
    </body>
  
`;