import { parse, stringify } from "https://deno.land/x/xml@2.1.1/mod.ts";
import data_dir from "https://deno.land/x/dir@1.5.1/data_dir/mod.ts";
import metadata from "./metadata.json" assert { type: "json" };
const path = data_dir() + "/Microsoft/Bibliography/Sources.xml";

if (metadata.tag) {
  const latest = await fetch(
    "https://api.github.com/repos/Asguho/word-source-cli/releases/latest",
  ).then((res) => res.json());
  if (metadata.tag != latest?.tag_name) {
    console.log("New version available");
    console.log("Please download the new version at:");
    console.log("https://github.com/Asguho/word-source-cli/releases/latest");
    prompt("Press enter to continue anyway.");
    console.clear();
  }
}

const json = await getJson();
if (Deno.args.length > 0) {
  for (const url of Deno.args) {
    json["b:Sources"]["b:Source"].push(getSource(await getSource(url)));
  }
  await Deno.mkdir(path, { recursive: true });
  await Deno.writeTextFile(
    path,
    stringify(json),
  );
} else {
  while (true) {
    const url = prompt("Please enter a url to a new source:", "").trim();
    console.clear();

    if (!url) {
      continue;
    }

    const data = await getSource(url);
    console.log("Data retrived:", data);

    if (!data?.otherData?.response?.ok) {
      console.log(`Couldn't find data for this url: ${url}\n\n`);
      continue;
    }

    if (!data?.authors?.[0]) {
      data.authors = prompt(
        `Please enter the authors of the source (separated with commas). Press enter for the default:`,
        data?.otherData?.url?.hostname,
      ).split(",");
    }

    if (
      (data?.otherData?.hostname || "").split(".").some((x) =>
        data.webPageName.includes(x)
      )
    ) {
      data.webPageName = prompt(
        `Please enter the name of the page. Press enter for the default:`,
        data.webPageName,
      );
    }

    if (data.url != url) {
      console.log(
        "The url you entered is different from the canonical url, please check if the source is correct.",
      );
      console.log(`Url entered: \n${url}}`);
      console.log(`Canonical url: \n${data.url}`);
      if (!confirm("would you like to use the canonical url instead?")) {
        data.url = url;
      }
    }

    if (!data.year) {
      if (confirm("No date was found, would you like to enter the date?")) {
        data.year = prompt("Please enter the year:", "");
        data.month = prompt("Please enter the month:", "");
        data.day = prompt("Please enter the day:", "");
      }
    }

    json["b:Sources"]["b:Source"].push(convertToSourceFormat(data));
    await Deno.writeTextFile(
      data_dir() + "/Microsoft/Bibliography/Sources.xml",
      stringify(json),
    );
    console.log("Source added successfully\n\n");
  }
}

function getAuthorJson(authors) {
  if (
    authors.length == 1 && ((authors[0].trim() || "").split(" ").length <= 1)
  ) {
    return ({
      "b:Corporate": authors[0].trim() || "",
    });
  } else {
    const authorsJson = [];
    for (const author of authors) {
      const authorNames = (author.trim() || "").split(" ");
      authorsJson.push({
        "b:Person": {
          "b:First": authorNames[0],
          "b:Middle": authorNames.slice(1, authorNames.length - 1).join(" "),
          "b:Last": authorNames[authorNames.length - 1],
        },
      });
    }
    return ({
      "b:NameList": authorsJson,
    });
  }
}

function convertToSourceFormat(data) {
  const guid = crypto.randomUUID().toUpperCase();
  const date = new Date();

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

async function getJson() {
  let json;
  try {
    json = parse(
      await Deno.readTextFile(
        data_dir() + "/Microsoft/Bibliography/Sources.xml",
      ),
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
  return json;
}

async function getSource(url) {
  return await fetch(
    "https://auto-references-api.deno.dev/api?url=" +
      encodeURIComponent(url),
  ).then((res) => res.json());
}
