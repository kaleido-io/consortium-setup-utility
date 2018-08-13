# Consortium setup utility

## Usage:
- Create a new instance of **KaleidoSetup**, passing the API key to the constructor
- Create a JSON object with the description of the consortium to setup
- Invoke the **setup** method passing the consortium description and a boolean indicating whether application credentials should be recreated

The **setup** method will check that each item in the consortium description exists and create those that are missing. It returns a promise that will resolve when the environment is ready (all nodes are live) and reject if the verification or creation of any of the items in the consortium fails.


```
const kaleidoSetup = new KaleidoSetup('YOUR API KEY');
const consortiumData = {...}
const dontRecreateApplicationCredentials = false;

kaleidoSetup.setup(consortiumData, dontRecreateApplicationCredentials).then((result) => {

    // consortium information contained in result

}).catch((error) => {

});
```

## Recreating application credentials
The **setup** method will only create consortium items that are missing. In the case of application credentials, their passwords are only returned on creation. It is for this reason that an option to re-create application credentilas has been added. If set to true, it ensures that the promise returned by the setup utility will contain the password values.

## Regions
The **KaleidoSetup** object provides a **retrieveRegions** method to obtain the list of regions. With that information, a call to the setApiHost method can be made in order to setup the consortium in a region different than the default (https://console.kaleido.io).

## Example
The file **example.js** showcases how the setup utility can be used. It parses the consortium description in **sample-consortium.json** and outputs the creation result to the console.
