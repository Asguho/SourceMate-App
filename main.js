import { parse, stringify } from "https://deno.land/x/xml@2.1.1/mod.ts";
import data_dir from "https://deno.land/x/dir@1.5.1/data_dir/mod.ts";
import metadata from "./metadata.json" assert { type: "json" };

function getAuthorJson(authors) {
  const authorJson = [];
  for (const author of authors) {
    if ((author.trim() || "").split(" ").length > 1) {
      const authorNames = (author.trim() || "").split(" ");
      authorJson.push({
        "b:NameList": {
          "b:Person": {
            "b:First": authorNames[0],
            "b:Middle": authorNames.slice(1, authorNames.length - 1).join(" "),
            "b:Last": authorNames[authorNames.length - 1],
          },
        },
      });
    } else {
      console.log("corporate", author);
      authorJson.push({
        "b:Corporate": author.trim() || "",
      });
    }
  }
  return authorJson;
}

async function getSource(url) {
  const guid = crypto.randomUUID().toUpperCase();
  const date = new Date();
  const data = await fetch(
    "https://auto-references-api.deno.dev/api?url=" + encodeURIComponent(url),
  ).then((res) => res.json());
  console.log("Source added:", data);
  return {
    "b:Tag": guid,
    "b:SourceType": "DocumentFromInternetSite",
    "b:Guid": `{${guid}}`,
    "b:Author": {
      "b:Author": getAuthorJson(data.authors),
    },
    "b:Title": data.webPageName,
    "b:InternetSiteTitle": data.webSiteName,
    "b:Year": data.year,
    "b:Month": data.month,
    "b:Day": data.day,
    "b:URL": data.url,
    "b:YearAccessed": date.getFullYear(),
    "b:MonthAccessed": date.getMonth() + 1,
    "b:DayAccessed": date.getDate(),
  };
}

let json;
try {
  json = parse(
    await Deno.readTextFile(data_dir() + "/Microsoft/Bibliography/Sources.xml"),
  );
  json["xml"]["@version"] = "1.0";
  if (!Array.isArray(json["b:Sources"]["b:Source"])) {
    json = {
      xml: { "@version": "1.0" },
      "b:Sources": {
        "@SelectedStyle": null,
        "@xmlns:b":
          "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
        "@xmlns":
          "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
        "b:Source": [json["b:Sources"]["b:Source"]],
      },
    };
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    json = {
      xml: { "@version": "1.0" },
      "b:Sources": {
        "@SelectedStyle": null,
        "@xmlns:b":
          "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
        "@xmlns":
          "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
        "b:Source": [],
      },
    };
  } else {
    throw error;
  }
}
//https://api.github.com/repos/Asguho/word-source-cli/releases/latest
if (metadata.tag) {
  // console.log("Current version:", metadata.tag);
  const latest = await fetch(
    "https://api.github.com/repos/Asguho/word-source-cli/releases/latest",
  ).then((res) => res.json());
  if (metadata.tag != latest?.tag_name) {
    // if (latest?.assets[0]?.browser_download_url) {
    //   await Deno.writeTextFile(
    //     data_dir() + "/Microsoft/Bibliography/Sources.xml",
    //     await fetch(latest?.assets[0]?.browser_download_url).then((res) =>
    //       res.text()
    //     ),
    //   );
    //   for (const asset of latest?.assets) {
    //     console.log("Download", asset.browser_download_url);
    //   }
    // }
    console.log("New version available");
    console.log("Please download the new version at:");
    console.log("https://github.com/Asguho/word-source-cli/releases/latest");
    prompt("Press enter to continue anyway.");
    console.clear();
  }
}

if (Deno.args.length > 0) {
  for (const url of Deno.args) {
    json["b:Sources"]["b:Source"].push(await getSource(url));
  }
  await Deno.writeTextFile(
    data_dir() + "/Microsoft/Bibliography/Sources.xml",
    stringify(json),
  );
} else {
  while (true) {
    const url = prompt("Please enter a url to a new source:");
    console.clear();
    if (url) {
      console.log("Url:", url);
      json["b:Sources"]["b:Source"].push(await getSource(url));
      await Deno.writeTextFile(
        data_dir() + "/Microsoft/Bibliography/Sources.xml",
        stringify(json),
      );
    }
  }
}
