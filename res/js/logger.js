const chalk = require('chalk');

module.exports = {
    logError: function(desc) {
        console.log(chalk.red('[ERROR] | Description: ' + desc));
    },
    
    login: function(user) {
        console.log(chalk.green('[LOGIN] | Successful Login: ' + user));
    },
    
    loginError: function(user) {
        console.log(chalk.red('[LOGIN] | Failed Login: ' + user));
    }
}