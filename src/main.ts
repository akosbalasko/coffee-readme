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

    /*
    console.debug('getting github token')
    const octoToken = core.getInput('GH_TOKEN');
    const octokit = github.getOctokit(octoToken);
    console.debug('github connection establised.')
    const readme = await octokit.rest.repos.getReadme({ owner: repo.split('/')[0], repo: repo.split('/')[1]});
    let buff = Buffer.from(readme.data.content, 'base64');
    let decodedReadme = buff.toString('ascii');
    */
    const decodedReadme = fs.readFileSync('README.md', 'ascii');
    const numberOfMessages = Number(core.getInput('NUMBER_OF_MESSAGES'));
    const messages = supporters.data.slice(0,numberOfMessages).map((supporter:any) => generateMessageLine(supporter)).join('\n');

    const updatedReadme = updateReadme(decodedReadme, messages);

    core.setOutput('UPDATED_README', updatedReadme);
    fs.writeFileSync('README.md', updatedReadme);

    // DIFFERENT ACTION:
    /*
      const options = getActionOptions();
      const updater = new Updater(options);
     await updater.updateFile(readme.data.path);
    */
} catch (error) {
  if (error instanceof Error) core.setFailed(error.message);
}

}

export const updateReadme = (readme: string, messages: string): string => {
  //const str = `(?<=${PLACEHOLDER_START})(.*)(?=${PLACEHOLDER_END})`;
  const str = `${PLACEHOLDER_START}[\\s\\S]+${PLACEHOLDER_END}`;
  console.log(str);
  const updateRegexp = new RegExp(str, 'g');
  
  return readme.replace(updateRegexp, `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`);
}
export const generateMessageLine = (supporter: CoffeeSupporter): string => {
  let coffees = '<div>';
  for (let i=0; i < supporter.support_coffees; ++i) {
    coffees += '<img src="/assets/bmc-logo.png" width="30">';
  }
  coffees += ` from <b>${supporter.payer_name}</b> </div>`;
  return `${coffees}  <div><i>${supporter.support_note}</i></div><br>`;
  

}

run()
