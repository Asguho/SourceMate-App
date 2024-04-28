import data_dir from "https://deno.land/x/dir@1.5.1/data_dir/mod.ts";
import { stringify } from "https://deno.land/x/xml@2.1.1/mod.ts";
import metadata from "./metadata.json" with { type: "json" };
import {
  convertToSourceFormat,
  getJson,
  getSiteName,
  getSource,
} from "./utils.ts";

console.clear();

// Remove old version
try {
  const fileInfo = await Deno.stat(Deno.execPath() + ".old");
  if (fileInfo.isFile) await Deno.remove(Deno.execPath() + ".old");
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    if ((error instanceof Deno.errors.PermissionDenied)) {
      console.error("Couldn't remove old version");
    } else throw error;
  }
}

// // Check and create shortcut
// try {
//   if (
//     dataDir && !Deno.cwd().includes(dataDir) &&
//     Deno.execPath().includes(Deno.cwd())
//   ) {
//     // moving file to data dir
//     await Deno.mkdir(dataDir + "\\Asguho\\WordSourceCLI", { recursive: true });

//     try {
//       await Deno.rename(
//         Deno.execPath(),
//         dataDir + "\\Asguho\\WordSourceCLI\\WordSourceCLI.exe",
//       );
//     } catch (error) {
//       if (error.message.includes("os error 5")) {
//         console.error(
//           "Couldn't move file, please run the file as administrator.",
//         );
//       } else {
//         throw error;
//       }
//     }

//     try {
//       // creating shortcut
//       await Deno.symlink(
//         dataDir + "\\Asguho\\WordSourceCLI\\WordSourceCLI.exe",
//         Deno.cwd() + "WordSourceCLI.lnk",
//       );
//     } catch (error) {
//       // if error is permission denied
//       // then make a hard link
//       if (error.message.includes("os error 1314")) {
//         await Deno.link(
//           dataDir + "\\Asguho\\WordSourceCLI\\WordSourceCLI.exe",
//           Deno.execPath(),
//         );
//         console.error(
//           "Couldn't create shortcut, please run the file as administrator.",
//         );
//         prompt("Press enter to continue anyway...");
//       } else {
//         throw error;
//       }
//     }
//   }
// } catch (error) {
//   console.error("Couldn't create shortcut");
//   console.error(error);
// }

// Check for updates
if (metadata?.tag && Deno.execPath().includes(Deno.cwd())) {
  const response = await fetch(
    "https://api.github.com/repos/Asguho/word-source-cli/releases/latest",
  );
  if (!response.ok) {
    console.error("Couldn't get latest version, please check your internet.");
  } else {
    const latest = await response.json();
    if (metadata.tag != latest?.tag_name) {
      if (
        confirm(
          `A new version is available: ${latest.tag_name}\nWould you like to update automatically?`,
        )
      ) {
        for (const asset of latest.assets) {
          if (
            asset.name.toLowerCase().includes(
              Deno.build.os + "-" + Deno.build.arch,
            )
          ) {
            console.log("Downloading latest version...");
            const latestFileResponse = await fetch(
              asset.browser_download_url,
            );
            if (!latestFileResponse.ok) {
              console.error(
                "Couldn't download latest version, please check your internet.",
              );
            } else {
              console.log("Writing to file...");
              const data = await latestFileResponse.arrayBuffer();
              await Deno.rename(Deno.execPath(), Deno.execPath() + ".old");
              await Deno.writeFile(Deno.execPath(), new Uint8Array(data));
              console.log("Restarting...");
              const cmd = new Deno.Command(Deno.execPath());
              cmd.spawn();
              Deno.exit();
            }
          }
        }
      }
    }
  }
}

//
const json = await getJson();
if (Deno.args.length > 0) {
  // for (const url of Deno.args) {
  //   json["b:Sources"]["b:Source"].push(getSource(await getSource(url)));
  // }
  // await Deno.mkdir(path, { recursive: true });
  // await Deno.writeTextFile(
  //   path,
  //   stringify(json),
  // );
  console.warn("This feature is not yet implemented");
} else {
  while (true) {
    const url = (prompt("Please enter a url to a new source:") || "")
      .trim();
    console.clear();

    if (!url) {
      continue;
    }

    const data = await getSource(url);
    //console.log("Data retrived:", data);

    if (!data?.otherData?.response?.ok) {
      console.log(`Couldn't find data for this url: ${url}\n\n`);
      continue;
    }

    if (!data?.authors?.[0]) {
      data.authors = (prompt(
        `Please enter the authors of the source (separated with commas):`,
        (await getSiteName(data?.otherData?.url?.hostname)).trim(),
      ) || "").split(",");
    }
    if (
      (data.authors.length == 1 &&
        ((data.authors[0].trim() || "").split(" ").length) <= 1)
    ) {
      data.corporate = true;
    } else {
      data.corporate = confirm(
        `Is this a "${data.authors.join(",")}" corporate author?`,
      );
    }

    if (
      (data?.otherData?.url?.hostname).split(".").some((x) => {
        if (data.webPageName.toLowerCase().includes(x.toLowerCase())) {
          // console.log(
          //   `"${data.webPageName}" includes the hostname: "${x}"`,
          // );
        }
        return data.webPageName.toLowerCase().includes(x.toLowerCase());
      }) || data.authors.some((x) => {
        if (data.webPageName.toLowerCase().includes(x.toLowerCase())) {
          // console.log(
          //   `"${data.webPageName}" includes the author: "${x}"`,
          // );
        }
        return data.webPageName.toLowerCase().includes(x.toLowerCase());
      }) || data.webPageName.includes(" - ") ||
      data.webPageName.includes(" | ")
    ) {
      data.webPageName = prompt(
        `Please edit the name of the page:`,
        data.webPageName,
      ) || data.webPageName;
    }

    if (data.url != url) {
      console.log(
        "The url you entered is different from the canonical url, please check if the source is correct.",
      );
      console.log(`Url entered: \n${url}`);
      console.log(`Canonical url: \n${data.url}`);
      if (!confirm("Would you like to use the canonical url instead?")) {
        data.url = url;
      }
    }

    if (!data.year) {
      if (confirm("No date was found, would you like to enter the date?")) {
        data.year = prompt("Please enter the year:") || "";
        if (!data.month && confirm("Would you also like to enter the month?")) {
          data.month = prompt("Please enter the month:") || "";
          if (!data.day && confirm("Would you also like to enter the day?")) {
            data.day = prompt("Please enter the day:") || "";
          }
        }
      }
    }
    if (
      !(json?.["b:Sources"] instanceof Object &&
        Array.isArray(json?.["b:Sources"]?.["b:Source"]))
    ) {
      console.error("Invalid js on format");
      continue;
    }

    if (
      json["b:Sources"] instanceof Object &&
      Array.isArray(json["b:Sources"]["b:Source"])
    ) {
      json["b:Sources"]["b:Source"].push(convertToSourceFormat(data));
    }

    await Deno.writeTextFile(
      data_dir() + "/Microsoft/Bibliography/Sources.xml",
      stringify(json),
    );
    console.log("Source added successfully\n\n");
  }
}
