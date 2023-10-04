const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

const hostname = '127.0.0.1';
const port = 3000;

const list = (files) => {
  let list;
  for(let i = 0; files.length > i; i++){
    if(files[i] === 'Welcome'){
      continue;
    }
    list += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`
  }
  list = list.split('undefined')[1];

  return list;
}

const temp = (title, list, phrase, crud) => {
  let template = `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <ul>
        ${list}
      </ul>
      ${crud}
      <h2>${title}</h2>
      ${phrase}
    </body>
    </html>  
  `;
  return template;
}

const server = http.createServer((req, res) => {
  let _url = req.url;
  let pathname = url.parse(_url, true).pathname;
  let queryData = url.parse(_url, true).query;
  let title = queryData.id;
  console.log(title);
  
  if(pathname === '/'){
    if(title === undefined){
      title = 'Welcome';
      fs.readdir('./data', (err, files) => {
        let _list = list(files);
        fs.readFile(`./data/${title}`, 'utf-8', (err, data) => {
          let _temp = temp(title, _list, data, `<a href="/create">create</a>`);
          res.writeHead(200);
          res.end(_temp);
        });
      });
    }
    else{
      fs.readdir('./data', (err, files) => {
        let _list = list(files);
        fs.readFile(`./data/${title}`, 'utf-8', (err, data) => {
          let _temp = temp(
            title, _list, data, 
            `
              <a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="delete_pro" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>
            `);
          res.writeHead(200);
          res.end(_temp);
        });
      });
    }
  }
  else if(pathname === '/create'){
    title = 'create';
    fs.readdir('./data', (err, files) => {
      let _list = list(files);
      let _temp = temp(title, _list, 
        `<form action="/create_pro" method="post">
          <p><input type="text" name="title" placeholder="title" /></p>
          <p><textarea name="desc" placeholder="description"></textarea></p>
          <p><input type="submit" /></p>
        </form>`
      );
      res.writeHead(200);
      res.end(_temp);
    });
  }
  else if(pathname === '/create_pro'){
    let body = ''
    req.on('data', (data) => body += data)
    req.on('end', () => {
      let post = qs.parse(body);
      title = post.title;
      let desc = post.desc;
      fs.writeFile(`./data/${title}`, desc, 'utf-8', err => {
        //파일 저장 끝나면 실행되는 콜백
        res.writeHead(302, {Location : `/?id=${title}`});
        res.end('succeed');
      })
    })
  }
  else if(pathname === '/update'){
    fs.readdir('./data', (err, files) => {
      let _list = list(files);
      fs.readFile(`./data/${title}`, 'utf-8', (err, data) => {
        // console.log(title, _list, data);
        let _temp = temp(
          title, _list,
          `
            <form action="/update_pro" method="post">
              <input type="hidden" name="id" value="${title}" />
              <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
              <p><textarea name="desc" placeholder="description">${data}</textarea></p>
              <p><input type="submit" /></p>
            </form>
          `,
          `
            <a href="/create">create</a>
            <a href="/update">update</a>
            <form action="delete_pro" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>
          `
        );
        res.writeHead(200);
        res.end(_temp)
      })
    })
  }
  else if(pathname === '/update_pro'){
    let body = '';
    req.on('data', (data) => body += data)
    req.on('end', () => {
      let post = qs.parse(body);
      let id = post.id;
      title = post.title;
      let desc = post.desc;
      fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
        fs.writeFile(`./data/${title}`, desc, 'utf-8', (err) => {
          res.writeHead(302, {Location : `/?id=${title}`});
          res.end('succeed');
        })
      })
    })
  }
  else if(pathname === '/delete_pro'){
    let body = '';
    req.on('data', (data) => body += data)
    req.on('end', () => {
      let post = qs.parse(body);
      title = post.id;
      fs.unlink(`./data/${title}`, (err) => {
        if(err){
          console.log('[Error!] ' + err);
          return
        }
        res.writeHead(302, {Location : '/'});
        res.end();
      })
    })
  }
  else{
    res.writeHead(404);
    res.end('Not Found');
  }

});
 
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 