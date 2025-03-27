curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/Users/leo/book/bookcast/page/index.html" \
  -F "owner=lizhijun" \
  -F "repo=pages" \
  -F "path=pages/index.html" \
  -F "message=Upload file" \
  http://localhost:3001/api/upload/github
