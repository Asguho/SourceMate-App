import { parse, stringify } from 'https://deno.land/x/xml/mod.ts';
import data_dir from 'https://deno.land/x/dir/data_dir/mod.ts';

const guid = crypto.randomUUID().toUpperCase();
const date = new Date();
const data = await fetch(
  'https://auto-references-api.deno.dev/api?url=' +
    encodeURIComponent('https://videnskab.dk/kultur-samfund/hvorfor-hedder-det-nordmaend-og-ikke-norskere/')
).then((res) => res.json());

const source = {
  'b:Tag': guid,
  'b:SourceType': 'DocumentFromInternetSite',
  'b:Guid': `{${guid}}`,
  'b:Author': {
    'b:Author': getAuthorJson(data.author),
  },
  'b:Title': data.webPageName,
  'b:InternetSiteTitle': data.webSiteName,
  'b:Year': data.year,
  'b:Month': data.month,
  'b:Day': data.day,
  'b:URL': data.url,
  'b:YearAccessed': date.getFullYear(),
  'b:MonthAccessed': date.getMonth() + 1,
  'b:DayAccessed': date.getDate(),
};

function getAuthorJson(author) {
  if ((author || '').split(' ').length > 1) {
    return {
      'b:NameList': {
        'b:Person': {
          'b:First': (author || '').substring(0, (author || '').indexOf(' ')),
          'b:Last': (author || '').substring((author || '').indexOf(' ') + 1),
        },
      },
    };
  } else {
    return {
      'b:Corporate': author,
    };
  }
}

const json = parse(await Deno.readTextFile(data_dir() + '/Microsoft/Bibliography/Sources.xml'));
console.log(JSON.stringify(json, null, 2));

// json['b:Sources']['b:Source'].push(source);

await Deno.writeTextFile(data_dir() + '/Microsoft/Bibliography/Sources.xml', stringify(json));
