import * as core from '@actions/core'

import * as fs from 'fs'
import {CoffeeSupporter, CoffeeSupportersResponse} from './interfaces'

import coffeeAPI from 'buymeacoffee.js'

const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->'
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->'

async function run(): Promise<void> {
  try {
    const readmeFileName = core.getInput('README');
    core.debug('started, getting buyme token...')
    const coffeeToken = core.getInput('BUY_ME_A_COFFEE_TOKEN')
    const coffee = new coffeeAPI(coffeeToken)
    core.debug('coffeeAPI connection established.')
    const supporters: CoffeeSupportersResponse = await coffee.Supporters()
    const decodedReadme = fs.readFileSync(readmeFileName, 'utf-8')
    const numberOfMessages = Number(core.getInput('NUMBER_OF_MESSAGES'))
    const messages = supporters.data
      .slice(0, numberOfMessages)
      .map((supporter: CoffeeSupporter) => generateMessageLine(supporter))
      .join('\n')
    const updatedReadme = updateReadme(decodedReadme, messages)

    fs.writeFileSync(readmeFileName, updatedReadme)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export const updateReadme = (readme: string, messages: string): string => {
  const str = `${PLACEHOLDER_START}[\\s\\S]*${PLACEHOLDER_END}`
  const updateRegexp = new RegExp(str, 'g')

  return readme.replace(
    updateRegexp,
    `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`
  )
}
export const generateMessageLine = (supporter: CoffeeSupporter): string => {
  let coffees = '<div>'
  for (let i = 0; i < supporter.support_coffees; ++i) {
    coffees += '<img src="/assets/bmc-logo.png" width="30">'
  }
  coffees += ` from <b>${supporter.payer_name}</b> </div>`
  return `${coffees}  <div><i>${supporter.support_note}</i></div><br>`
}

run()
