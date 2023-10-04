const folder = '../data';
const fs = require('fs');

fs.readdir(folder, (err, files) => {
    // if(err) throw err;
    // files.forEach(file => {
    //     console.log(file);
    // })
    console.log(files);
})