# Pokemon GO Map

TODO: Desc

## Getting Started

[Download and install NodeJS](https://nodejs.org/en/download/current/)

Once downloaded, navigate to the directory and Shift + Right Click and select click 'Open command window here'.

Enter the following command to install node modules:

```npm install```

After node modules install, navigate to the config folder and save 'config-example.json' as 'config.json'. Now open the file and replace the information with your parameters.

Once you have installed the node dependencies and setup your config.json you can run the program by running the following command into the CMD window you had open before:

```node index.js```

Navigate to [127.0.0.1:3000](http://127.0.0.1:3000) on your web browser to see nearby Pokemon, Gyms, and Pokestops.

## Authors

+ Adam Eaton
+ Paul Gillis

## TODO:
 - Put found pokemon into database
 - Send pokemon in database to client on init
 - Fix countdown time calculation
 - Make client walk
 - Hide GMaps API
 - Create menus and user interface
 - Create database for settings
 - Autoscan clients location
 - Thats all for the moment
