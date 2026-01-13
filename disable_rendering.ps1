$filePath = "C:\xampp\htdocs\react-project\space-snake\src\SpaceSnakeGame.jsx"
$content = Get-Content $filePath -Raw

# Disable player drawing
$content = $content -replace '(?s)(// Draw player\s+const player = playerRef\.current;\s+)if \(player\) \{', '$1if (false && player) {'

# Disable enemy drawing  
$content = $content -replace '(?s)(// Draw enemies as particle systems\s+)enemiesRef\.current\.forEach\(enemy => \{', '$1if (false) { enemiesRef.current.forEach(enemy => {'

# Add closing brace for enemy forEach
$content = $content -replace '(?s)(enemiesRef\.current\.forEach\(enemy => \{[^}]+?return enemy\.hp > 0;\s+\}\);)\s+', '$1`n    }'

$content | Set-Content $filePath -NoNewline
Write-Host "Player and enemy rendering disabled"
