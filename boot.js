const fetch = require("node-fetch")
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'bot discord',
  description: 'bot discord',
  script: __dirname + "/main.js"
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

// Listen for the "start" event and let us know when the
// process has actually started working.
svc.on('start',function(){
    console.log("started")
});

// Install the script as a service.
svc.install();


// var Service = require('node-windows').Service;

// // Create a new service object
// var svc = new Service({
//   name:'Hello World',
//   script: 'C:\\Users\\Eli\\Documents\\PROGRAMMATION\\JAVASCRIPT\\botdiscord\\saveServer\\server.js'//require('path').join(__dirname,'server.js')
// });

// // Listen for the "uninstall" event so we know when it's done.
// svc.on('uninstall',function(){
//   console.log('Uninstall complete.');
//   console.log('The service exists: ',svc.exists);
// });

// // Uninstall the service.
// svc.uninstall();