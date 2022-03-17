import {expect, test} from '@jest/globals'
import { updateReadme } from './../src/main';


// shows how the runner will run a javascript action with env / stdout protocol
test('test update readme regexp', () => {

  const readme = '<!--START_SECTION:buy-me-a-coffee--><!--END_SECTION:buy-me-a-coffe-->';
  const updatedReadme = updateReadme(readme, 'updated messages');
  
    expect(updatedReadme).toBe('<!--START_SECTION:buy-me-a-coffee-->updated messages<!--END_SECTION:buy-me-a-coffe-->');
  /*process.env['REPOSITORY'] = 'akosbalasko/literate-funicular';
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())*/
})
