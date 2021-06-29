const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = require('./deploy-config');

ftpDeploy
    .deploy(config)
    .then(res => console.log('finished:', res))
    .catch(err => console.log(err));

ftpDeploy.on('upload-error', function(data) {
    console.log(data.err); // data will also include filename, relativePath, and other goodies
});
