// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const NotificationCenter = require('node-notifier').NotificationCenter;

var notifier = new NotificationCenter({
  withFallback: true, // Use Growl Fallback if <= 10.8
});

$(function(){

  const title = "Emergency Alert";
  const message = "BALLISTIC MISSILE THREAT INBOUND TO HAWAII. SEEK IMMEDIATE SHELTER. THIS IS NOT A DRILL.";

  $('a').on('click', function(){

    setTimeout(()=>{
      notifier.notify({ subtitle:title, title, message, });
      alert(message,title);

    },1000)

  });
});
