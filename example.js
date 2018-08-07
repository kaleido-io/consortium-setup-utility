const KaleidoSetup = require('./KaleidoSetup');
const fs = require('fs');

const apiKey = ''; // SET API KEY HERE
const consortiumData = JSON.parse(fs.readFileSync('sample-consortium.json')); 
const kaleidoSetup = new KaleidoSetup(apiKey);

if(apiKey.length > 0) {

    console.log('\x1b[30m\x1b[43m%s\x1b[0m', '\n  Setting up consortium...  \n');

    kaleidoSetup.setup(consortiumData, false).then((result) => {
        console.log('\x1b[30m\x1b[42m%s\x1b[0m', '\n  Consortium successfully setup  \n');

        console.log(JSON.stringify(result, null, 2));

        let url1 = result.nodes[0][0].urls.rpc;
        let username1 = result.applicationCredentials[0][0].username;
        let password1 = result.applicationCredentials[0][0].password;

        console.log('\x1b[37m\x1b[44m%s\x1b[0m', '\n  Connection information (Jims\' node)  \n');

        console.log('URL: ' + url1);
        console.log('User: ' + username1);
        console.log('Password: ' + password1);

        let url2 = result.nodes[0][1].urls.rpc;
        let username2 = result.applicationCredentials[0][1].username;
        let password2 = result.applicationCredentials[0][1].password;

        console.log('\x1b[37m\x1b[44m%s\x1b[0m', '\n  Connection information (Peters\' node)  \n');

        console.log('URL: ' + url2);
        console.log('User: ' + username2);
        console.log('Password: ' + password2);

    }).catch((error) => {
        console.log('\x1b[37m\x1b[41m%s\x1b[0m', '\n  An error occurred while setting up the consortium  \n');
        console.log(error.message)
    });

} else {
    console.log('\x1b[37m\x1b[41m%s\x1b[0m', '\n  The API key has not been set  \n');
}