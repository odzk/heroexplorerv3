#!/usr/bin/env node

var SimpleDeployment = require("codedeploy-scripts").SimpleDeployment;
var deployment = new SimpleDeployment({
    appName: "hapi",
    nodePort: "3000",
    serverScript: "server.js",
    domains: "54.87.248.31",
    // files in these folders will be served from nginx without calling the node server
    buildFolder: "build",
    staticFolder: "static",        
    // files in s3 my-secret-bucket/deploytest will be copied to /apps/deploytest; suitable for ssh keys and
    // config files which can't be part of the code deployment
    secretBucket: "my-secret-bucket",
    // if true, nginx will be set to serve https using /apps/deploytest/deploytest.[crt|key]
    useSSL: false
});
deployment.run();