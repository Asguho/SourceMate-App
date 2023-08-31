import { parse } from 'https://deno.land/x/xml/mod.ts';
import data_dir from 'https://deno.land/x/dir/data_dir/mod.ts';
const xml = await Deno.readTextFile(data_dir() + '/Microsoft/Bibliography/Sources.xml');
const json = parse(xml);
console.log(JSON.stringify(json['b:Sources']['b:Source'], null, 2));
const myUUID = crypto.randomUUID();
