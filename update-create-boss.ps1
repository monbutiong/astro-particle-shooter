$filePath = "C:\xampp\htdocs\react-project\space-snake\src\SpaceSnakeGame.jsx"

# Read file
$content = Get-Content $filePath -Raw

# Define old createBoss function
$oldFunction = '(?s)  const createBoss = \(canvasWidth, stageNumber\) => \{.*?\n  \};\n\n  // Create dissolving effect'

# Define new createBoss function with image loading and cycle logic
$newFunction = @'
  const createBoss = (canvasWidth, stageNumber) => {
    const stageIndex = Math.min(stageNumber - 1, BOSS_STAGES.length - 1);
    const stage = BOSS_STAGES[stageIndex];
    const defeatCount = bossDefeatCountRef.current[stageNumber] || 0;
    const isSecondAppearance = defeatCount === 1;
    
    // Calculate cycle number (each cycle is 13 bosses)
    const cycleNumber = Math.floor((stageNumber - 1) / 13);
    
    // Calculate size with 30% increase per cycle after the first
    const baseSize = stage.size;
    const sizeMultiplier = 1 + (cycleNumber * 0.3);
    const actualSize = baseSize * sizeMultiplier;
    
    // Calculate HP with 20% increase per boss within cycle
    const hpMultiplier = Math.pow(1.2, (stageIndex % 13));
    const actualHp = Math.round(stage.hp * hpMultiplier);
    
    // Load boss image
    const bossImage = new Image();
    bossImage.src = stage.image;
    
    return {
      x: canvasWidth / 2,
      y: -150,
      stage: stage,
      currentStage: stageNumber,
      image: bossImage,
      hp: actualHp,
      maxHp: actualHp,
      size: actualSize,
      targetY: 80,
      lastShot: 0,
      attackAngle: 0,
      time: 0,
      entering: true,
      phase: 1,
      escaping: false,
      escapeAngle: null,
      isSecondAppearance: isSecondAppearance,
      defeatCount: defeatCount,
      cycleNumber: cycleNumber,
      hasFled: defeatCount === 0 && cycleNumber === Math.floor((bossDefeatCountRef.current[stageNumber] || 0) / 2)
    };
  };

  // Create dissolving effect
'@

# Replace
$newContent = $content -replace $oldFunction, $newFunction

# Write back
Set-Content $filePath $newContent -NoNewline

Write-Host "createBoss function updated successfully"
