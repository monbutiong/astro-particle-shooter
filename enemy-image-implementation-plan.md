# Enemy Image Implementation Plan

## Summary
Replace particle-based enemy rendering with actual enemy images from:
- `/src/assets/shooting-enemy/` - 5 images (enemy-1.fw.png to enemy-5.fw.png)
- `/src/assets/none-shooting-enemy/` - 6 images (steriods-1.fw.png to steriods-6.fw.png)

## Requirements
- Use lower numbered enemies for lower boss levels
- Use higher numbered enemies for higher boss levels
- Higher boss level = higher tier enemy image
- SHOOTER enemy type uses shooting-enemy images
- All other enemy types use none-shooting-enemy images

## Implementation Changes

### 1. Add Image Path Constants (After line 44 in SpaceSnakeGame.jsx)
```javascript
// Enemy image paths configuration
const SHOOTING_ENEMY_IMAGES = [
  '/src/assets/shooting-enemy/enemy-1.fw.png',
  '/src/assets/shooting-enemy/enemy-2.fw.png',
  '/src/assets/shooting-enemy/enemy-3.fw.png',
  '/src/assets/shooting-enemy/enemy-4.fw.png',
  '/src/assets/shooting-enemy/enemy-5.fw.png'
];

const NONE_SHOOTING_ENEMY_IMAGES = [
  '/src/assets/none-shooting-enemy/steriods-1.fw.png',
  '/src/assets/none-shooting-enemy/steriods-2.fw.png',
  '/src/assets/none-shooting-enemy/steriods-3.fw.png',
  '/src/assets/none-shooting-enemy/steriods-4.fw.png',
  '/src/assets/none-shooting-enemy/steriods-5.fw.png',
  '/src/assets/none-shooting-enemy/steriods-6.fw.png'
];
```

### 2. Update createEnemy Function
- Calculate boss stage: `bossStage = Math.floor(currentLevel / 2) + 1`
- For SHOOTER type: use SHOOTING_ENEMY_IMAGES[Math.min(bossStage - 1, 4)]
- For other types: use NONE_SHOOTING_ENEMY_IMAGES[Math.min(bossStage - 1, 5)]
- Add `image` property to enemy object
- Keep particles array for dissolve effects

### 3. Update Enemy Drawing (around line 1513 in draw function)
Replace particle drawing with image drawing:
- Check if enemy.image exists and is loaded
- Draw image with size based on enemy.type.size
- Add floating animation similar to boss
- Keep health bars for multi-HP enemies
- Keep dissolve effects

## Boss Level to Image Mapping

### Shooting Enemies (SHOOTER type)
- Boss 1-2: enemy-1.fw.png
- Boss 3-4: enemy-2.fw.png
- Boss 5-6: enemy-3.fw.png
- Boss 7-9: enemy-4.fw.png
- Boss 10+: enemy-5.fw.png

### Non-Shooting Enemies (NORMAL, TANK, SWARM, GHOST)
- Boss 1-2: steriods-1.fw.png
- Boss 3-4: steriods-2.fw.png
- Boss 5-6: steriods-3.fw.png
- Boss 7-9: steriods-4.fw.png
- Boss 10-11: steriods-5.fw.png
- Boss 12+: steriods-6.fw.png

## Files Modified
1. C:/xampp/htdocs/react-project/space-snake/src/SpaceSnakeGame.jsx

## Testing Checklist
- [ ] Enemies spawn with correct images based on level
- [ ] Images load and display correctly
- [ ] Higher boss levels show higher numbered enemies
- [ ] Shooting enemies use shooting-enemy images
- [ ] Non-shooting enemies use none-shooting-enemy images
- [ ] Health bars still display for multi-HP enemies
- [ ] Dissolve effects still work when hit
- [ ] Enemy behavior remains unchanged
