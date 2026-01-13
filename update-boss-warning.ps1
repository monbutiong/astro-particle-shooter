$filePath = "C:/xampp/htdocs/react-project/space-snake/src/SpaceSnakeGame.jsx"
$content = Get-Content $filePath -Raw
$content = $content -replace 'absolute inset-0 flex items-center justify-center pointer-events-none">', 'absolute top-1/4 left-0 right-0 flex items-center justify-center pointer-events-none">'
$content | Set-Content $filePath
Write-Host "Boss warning position updated!"
