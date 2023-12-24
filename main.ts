import { parse, stringify } from "https://deno.land/x/xml@2.1.1/mod.ts";
import data_dir from "https://deno.land/x/dir@1.5.1/data_dir/mod.ts";
import metadata from "./metadata.json" assert { type: "json" };
import { Source } from "./types.ts";

if (metadata?.tag) {
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
      (data?.otherData?.url?.hostname).split(".").some((x) => {
        if (data.webPageName.toLowerCase().includes(x.toLowerCase())) {
          console.log(
            `"${data.webPageName}" includes the hostname: "${x}"`,
          );
        }
        return data.webPageName.toLowerCase().includes(x.toLowerCase());
      })
    ) {
      data.webPageName = prompt(
        `Please enter the name of the page:`,
        data.webPageName,
      ) || data.webPageName;
    }

    if (data.url != url) {
      console.log(
        "The url you entered is different from the canonical url, please check if the source is correct.",
      );
      console.log(`Url entered: \n${url}`);
      console.log(`Canonical url: \n${data.url}`);
      if (!confirm("would you like to use the canonical url instead?")) {
        data.url = url;
      }
    }

    if (!data.year) {
      if (confirm("No date was found, would you like to enter the date?")) {
        data.year = prompt("Please enter the year:") || "";
        data.month = prompt("Please enter the month:") || "";
        data.day = prompt("Please enter the day:") || "";
      }
    }
    //@ts-expect-error: I know what I'm doing
    json["b:Sources"]["b:Source"].push(convertToSourceFormat(data));
    await Deno.writeTextFile(
      data_dir() + "/Microsoft/Bibliography/Sources.xml",
      stringify(json),
    );
    console.log("Source added successfully\n\n");
  }
}

async function getSiteName(hostname: string) {
  const res = await getSource(hostname);
  const title = res?.otherData?.title;
  return res?.authors?.[0] || title.split(" - ")?.[0] || title;
}

function getAuthorJson(authors: string[]) {
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
function convertToSourceFormat(data: Source) {
  const guid = crypto.randomUUID().toUpperCase();
  const date = new Date();

  console.log("\nData added:");
  console.log("Author:", getAuthorJson(data.authors));

  console.log("Title:", data.webPageName);
  console.log("InternetSiteTitle:", data.webSiteName);
  if (data.year) console.log("Year:", data.year);
  if (data.month) console.log("Month:", data.month);
  if (data.day) console.log("Day:", data.day);
  console.log("URL:", data.url);

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
  try {
    const json = parse(
      await Deno.readTextFile(
        data_dir() + "/Microsoft/Bibliography/Sources.xml",
      ),
    );
    //@ts-expect-error: I know what I'm doing
    if (!Array.isArray(json?.["b:Sources"]?.["b:Source"])) {
      return {
        xml: { "@version": "1.0" },
        "b:Sources": {
          "@SelectedStyle": null,
          "@xmlns:b":
            "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
          "@xmlns":
            "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
          //@ts-expect-error: I know what I'm doing
          "b:Source": [json["b:Sources"]["b:Source"]],
        },
      };
    }
    return json;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return {
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
}

async function getSource(url: string): Promise<Source> {
  return await fetch(
    "https://auto-references-api.deno.dev/api?url=" +
      encodeURIComponent(url),
  ).then((res) => res.json());
}
