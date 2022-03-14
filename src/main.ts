import * as core from '@actions/core'

import * as github from '@actions/github';
import * as  fs from 'fs';
import { Updater } from './updateFile';
import { getActionOptions } from './util';

const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->';
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->';


const coffeeAPI = require('buymeacoffee.js');

async function run(): Promise<void> {
  try {
    const repo = core.getInput('REPOSITORY');
    let coffeeToken = core.getInput('BUY-ME-A-COFFEE-TOKEN');
    const coffee = new coffeeAPI(coffeeToken); // add your token here
    const supporters = await coffee.Supporters();

    const octoToken = core.getInput('GH_TOKEN');
    const octokit = github.getOctokit(octoToken);
    const readme = await octokit.rest.repos.getReadme({ owner: repo.split('/')[0], repo: repo.split('/')[1]});
    const decodedReadme = readme.data.content;
    const options = getActionOptions();
    const updater = new Updater(options);
    const numberOfMessages = core.getInput('NUMBER-OF-MESSAGES');
    const messages = supporters.data.slice(0,numberOfMessages).map((supporter:any) => supporter.support_note).join('\n');

    const updateRegexp = new RegExp(`${PLACEHOLDER_START}[^\<]*${PLACEHOLDER_END}`, 'g');
    const updatedReadme = decodedReadme.replace(updateRegexp, `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`);
    fs.writeFileSync('readme.md', updatedReadme);

    // await updater.updateFile('readme.md');

} catch (error) {
  if (error instanceof Error) core.setFailed(error.message);
}

}

run()
