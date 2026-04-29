$body = @{
  sourceType = 'url'
  url = 'https://www.reuters.com/world/'
} | ConvertTo-Json -Compress

try {
  Invoke-RestMethod -Uri 'http://localhost:3000/api/analyze' -Method Post -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 8
} catch {
  $_.Exception.Response.GetResponseStream() | ForEach-Object {
    $reader = New-Object System.IO.StreamReader($_)
    $reader.ReadToEnd()
  }
}
