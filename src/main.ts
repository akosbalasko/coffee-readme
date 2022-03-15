import * as core from '@actions/core'

import * as github from '@actions/github';
import * as  fs from 'fs';
import { Updater } from './updateFile';
import { getActionOptions } from './util';

const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->';
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->';

interface CoffeeSupporter {
  support_note: string;
  support_coffees: number;
  payer_name: string;
}
interface CoffeeSupportersResponse {
  data: Array<CoffeeSupporter>;
}

const coffeeAPI = require('buymeacoffee.js');

async function run(): Promise<void> {
  try {
    const repo = core.getInput('REPOSITORY');
    console.debug('started, getting buyme token...')
    let coffeeToken = core.getInput('BUY_ME_A_COFFEE_TOKEN');
    const coffee = new coffeeAPI(coffeeToken); // add your token here
    console.debug('coffeeAPI connection established.')
    const supporters: CoffeeSupportersResponse = await coffee.Supporters();


    console.debug('getting github token')
    const octoToken = core.getInput('GH_TOKEN');
    const octokit = github.getOctokit(octoToken);
    console.debug('github connection establised.')
    const readme = await octokit.rest.repos.getReadme({ owner: repo.split('/')[0], repo: repo.split('/')[1]});
    let buff = new Buffer(readme.data.content, 'base64');
    let decodedReadme = buff.toString('ascii');
    const options = getActionOptions();
    const updater = new Updater(options);
    const numberOfMessages = Number(core.getInput('NUMBER_OF_MESSAGES'));
    const messages = supporters.data.slice(0,numberOfMessages).map((supporter:any) => generateMessageLine(supporter)).join('\n');

    const updateRegexp = new RegExp(`(?<=${escapeRegExp(PLACEHOLDER_START)})(.*)(?=${escapeRegExp(PLACEHOLDER_END)})`, 'g');
    const updatedReadme = decodedReadme.replace(updateRegexp, `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`);
    fs.writeFileSync(readme.data.path, updatedReadme);

    await updater.updateFile(readme.data.path);

} catch (error) {
  if (error instanceof Error) core.setFailed(error.message);
}

}

export const generateMessageLine = (supporter: CoffeeSupporter): string => {
  let coffees = '<div>';
  for (let i=0; i < supporter.support_coffees; ++i) {
    coffees += '<img src="/assets/bmc-logo.png" width="30">';
  }
  coffees += '</div>'
  return `${coffees} from ${supporter.payer_name} <div>${supporter.support_note}</div>`;
  

}

const escapeRegExp = (text: string): string =>  {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
run()
