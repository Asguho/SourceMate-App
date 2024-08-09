import { parse } from "@libs/xml";
import type { Source } from "./sourceSchema.ts";
import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";

function getAuthorJson(authors: string[], corporate = false) {
	if (corporate) {
		return {
			"b:Corporate": authors[0].trim() || "",
		};
	}
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
	return {
		"b:NameList": authorsJson,
	};
}

// export function convertToSourceFormat(data: Source) {
// 	const guid = crypto.randomUUID().toUpperCase();
// 	const date = new Date();

// 	console.log("\nData added:");
// 	console.log("Author:", getAuthorJson(data.authors, data.corporate));

// 	console.log("Title:", data.webPageName);
// 	console.log("InternetSiteTitle:", data.webSiteName);
// 	if (data.year) console.log("Year:", data.year);
// 	if (data.month) console.log("Month:", data.month);
// 	if (data.day) console.log("Day:", data.day);
// 	console.log("URL:", data.url);

// 	return {
// 		"b:Tag": guid,
// 		"b:SourceType": "DocumentFromInternetSite",
// 		"b:Guid": `{${guid}}`,
// 		"b:Author": {
// 			"b:Author": getAuthorJson(data.authors, data.corporate),
// 		},
// 		"b:Title": data.webPageName,
// 		"b:InternetSiteTitle": data.webSiteName,
// 		"b:Year": data.year,
// 		"b:Month": data.month,
// 		"b:Day": data.day,
// 		"b:URL": data.url,
// 		"b:YearAccessed": date.getFullYear(),
// 		"b:MonthAccessed": date.getMonth() + 1,
// 		"b:DayAccessed": date.getDate(),
// 	};
// }

export async function getJson() {
	try {
		// json["~children"]
		if (json?.["b:Sources"] instanceof Object) {
			if (Array.isArray(json?.["b:Sources"]?.["b:Source"])) {
				if (json?.xml) {
					json.xml["@version"] = "1.0";
				} else {
					console.error("xml is not defined");
				}
				return json;
			}
		}

		return {
			xml: { "@version": "1.0" },
			"b:Sources": {
				"@SelectedStyle": null,
				"@xmlns:b": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
				"@xmlns": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
				"b:Source": json["b:Sources"] instanceof Object ? [json["b:Sources"]["b:Source"]] : [],
			},
		};
	} catch (error) {
		console.error(error);
		// if (error instanceof Deno.errors.NotFound) {
		// 	return {
		// 		xml: { "@version": "1.0" },
		// 		"b:Sources": {
		// 			"@SelectedStyle": null,
		// 			"@xmlns:b": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
		// 			"@xmlns": "http://schemas.openxmlformats.org/officeDocument/2006/bibliography",
		// 			"b:Source": [],
		// 		},
		// 	};
		// } else {
		// 	throw error;
		// }
	}
}
