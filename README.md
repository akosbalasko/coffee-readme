
# Buy Me A Coffee Donations and Messages on your Readme page


## It will look like this:


## Prerequisites

In order to set this action, you need to have the followings:
1. A github token
2. A buyMeACoffee token
API keys etc

## Setup

1. Edit your README.md file and add two lines as follows: 
```md
<!--START_SECTION:buy-me-a-coffee-->
<!--END_SECTION:buy-me-a-coffe-->
```

These lines won't be shown in the generated Readme file (because they are comments in HTML), but they will specify the concrete place where the list of the latest donations should be inserted. Please note that anything between these two lines will be removed by the newly generated list when the action is triggered.

2. Set a workflow in your repository

Please follow the steps below:

1. Go to your project's `actions`, hit `New workflow` and `set up a workflow yourself`, then delete all the default content.
2. Copy-Paste the code below to your new workflow file and save/commit it as `buy-me-a-coffee.yml`.

   ```yml
   name: Buy Me A Coffee Readme

   on:
     workflow_dispatch:
     schedule:
       # Runs at every 12AM UTC
       - cron: "0 0 * * *"

   jobs:
     bmac-readme:
       name: Update Buy Me A Coffee section in this repo's README
       runs-on: ubuntu-latest
       steps:
         - uses: akosbalasko/coffee-readme@master
           with:
             BUY_ME_A_COFFEE_TOKEN: ${{ secrets.BUY_ME_A_COFFEE_TOKEN }}
             GH_TOKEN: ${{secrets.GH_TOKEN }}
   ```

    Optionally you can set `NUMBER_OF_MESSAGES` property as a number of the latest messages to be passed into the readme file.

3. Create a new GitHub secret
4. Set your BuyMeACoffee API Key as secret


## Enjoy! 


