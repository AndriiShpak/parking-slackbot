# Parking Slackbot

Useful for companies that has limited parking slots


## Features

1) Notify others where you parked
2) See available slots with parking schema
3) Blame someone for not using chatbot


## Environment variables

1) SLACK_SIGNING_SECRET -- get it from slack
2) SLACK_BOT_TOKEN -- get it from slack
3) DATABASE_URL -- format: postgres://{user}:{password}@{hostname}:{port}/{database-name}
4) AVAILABLE_SLOTS -- List of available parking slots in your company
5) IMAGE_URL -- Link to the parking scheme (can be link to image that is in slack - https://slack-files.com/XXXX)

## Deployment

Bot is developed using Node.js and can be hosted on any server. You would need the following services:
1) Server to host Node.js
2) SQL database (PostgreSQL)
3) Public API url that can be accessed by slack

### Heroku

Probably the simplest way is to deploy on Heroku:

1) Create Heroku account - [Heroku account](https://signup.heroku.com)
2) Install Heroku CLI - [CLI](https://devcenter.heroku.com/articles/heroku-cli)
3) Run `heroku create {insert-app-name}` (created app on heroku)
4) Rune `heroku addons:create heroku-postgresql:hobby-dev` (adds Heroku PostgreSQL)
5) Run `heroku git:remote -a {insert-app-name}` (connects git to heroku)
6) Set the following environment variables: SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, DATABASE_URL, AVAILABLE_SLOTS, IMAGE_URL. As an example: `heroku config:set AVAILABLE_SLOTS=5,43,53,75`
7) Run `git push heroku master` (deploys application to heroku)

Useful info regarding slackbot setup and heroku deployment [here](https://blog.heroku.com/how-to-deploy-your-slack-bots-to-heroku)
