# memeit.lol.bot

## Install
To install and setup run:
```git clone https://github.com/memeit-lol/memeit.lol.bot; cd memeit.lol.bot; npm install;```
Then copy config.example.js to config.js and edit to your liking. The key variable has to be the posting key to the account.
To start run:
```npm run start```

## Usage
In config.js ```mongo``` means the mongo database instances that memeit.lol uses. Accounts variable is for the accounts used to upvote the posts in the mongodb.

## How it works
It upvotes everyone the equal amount with an minimum 10% vote.