const http = require('http')
const fs = require('fs')
const url = require('url')
const etag = require('etag')

http.createServer((req, res) => {
  console.log(req.method, req.url)

  const { pathname } = url.parse(req.url)
  if (pathname === '/') {
    const data = fs.readFileSync('./index.html')
    res.end(data)
  } else if (pathname === '/img/01.jpg') {
    const data = fs.readFileSync('./img/01.jpg')
    res.writeHead(200, {
      Expires: new Date('2023-4-17 10:12:59').toUTCString()
    })
    res.end(data)
  } else if (pathname === '/img/02.jpg') {
    const data = fs.readFileSync('./img/02.jpg')
    // 作为强制缓存
    res.writeHead(200, {
      'Cache-Control': 'max-age=5' // 滑动时间，单位是秒，重第一次请求到下一次请求持续的时间。
    })
    res.end(data)
    // 协商缓存
  } else if (pathname === '/img/03.jpg') {
    // 获取修改时间
    const { mtime } = fs.statSync('./img/03.jpg')

    const ifModifiedSince = req.headers['if-modified-since']

    if (ifModifiedSince === mtime.toUTCString()) {
      // 缓存生效
      res.statusCode = 304
      res.end()
      return
    }

    const data = fs.readFileSync('./img/03.jpg')
    // 需要配合cache-control才生效
    res.setHeader('last-modified', mtime.toUTCString())
    res.setHeader('Cache-Control', 'no-cache')
    res.end(data)
  } else if (pathname === '/img/04.jpg') {
    const data = fs.readFileSync('./img/04.jpg')
    const etagContent = etag(data)

    const ifNoneMatch = req.headers['if-none-match']

    if (ifNoneMatch === etagContent) {
      res.statusCode = 304
      res.end()
      return
    }

    res.setHeader('etag', etagContent)
    // res.setHeader('Cache-Control', 'no-cache')
    res.end(data)
  } else {
    res.statusCode = 404
    res.end()
  }
}).listen(3000, () => {
  console.log('http://localhost:3000')
})
