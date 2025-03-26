curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@taibaijinxinyoudianfan.html" \
  -F "owner=lizhijun" \
  -F "repo=pages" \
  -F "path=pages/taibaijinxinyoudianfan.html" \
  -F "message=Upload file" \
  http://localhost:3001/api/upload/github
