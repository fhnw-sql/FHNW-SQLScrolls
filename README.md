# SQLScrolls

# SQLScrolls Installation Guide Prototype 

## Step 1
Download the Game from Github -> Code -> Clone -> .zip
Unzip the download in desired folder

## Step 2
Set Environment variables in cmd:
`set API_URL=http://localhost:3000` 
`set IO_URL=http://localhost:80 `
`set POSTMARK_API_KEY=blank`
`set FROM_SENDER=stg@github.io`

## Step 3
Go into the game file and navigate into the folder "FHNW-SQL-Training-Game.github.io" and copy the directory path: for example C:\Users\player\downloads\SQL-Scrolls-main\FHNW-SQL-Training-Game.github.io
change the cmd directory by using the following command: `cd your copied path`

## Step 4
run the following DOcker command in your command line: `docker-compose up -d --force-recreate --renew-anon-volumes`
