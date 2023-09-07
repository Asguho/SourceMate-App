import { parse, stringify } from "https://deno.land/x/xml@2.1.1/mod.ts";
import data_dir from "https://deno.land/x/dir@1.5.1/data_dir/mod.ts";

function getAuthorJson(author) {
  if ((author || "").split(" ").length > 1) {
    return {
      "b:NameList": {
        "b:Person": {
          "b:First": (author || "").substring(0, (author || "").indexOf(" ")),
          "b:Last": (author || "").substring((author || "").indexOf(" ") + 1),
        },
      },
    };
  } else {
    return {
      "b:Corporate": author,
    };
  }
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
      "b:Author": getAuthorJson(data.author),
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
    console.log("Url:", url);
    json["b:Sources"]["b:Source"].push(await getSource(url));
    await Deno.writeTextFile(
      data_dir() + "/Microsoft/Bibliography/Sources.xml",
      stringify(json),
    );
  }
}
