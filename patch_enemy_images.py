#!/usr/bin/env python3
"""
Script to patch SpaceSnakeGame.jsx to replace particle enemies with images
"""
import re

def patch_create_enemy(content):
    """Update the createEnemy function to load images based on boss level"""
    old_create_enemy = r'''  // Create enemy particle system
  const createEnemy = \(canvasWidth, canvasHeight, currentLevel\) => \{
    const typeKeys = Object\.keys\(ENEMY_TYPES\);
    const typeKey = typeKeys\[Math\.floor\(Math\.random\(\) \* typeKeys\.length\)\];
    const type = ENEMY_TYPES\[typeKey\];
    
    const particles = \[\];
    const baseX = Math\.random\(\) \* \(canvasWidth - 100\) \+ 50;
    const baseY = -50;
    
    for \(let i = 0; i < type\.particleCount; i\+\+\) \{
      const angle = \(Math\.PI \* 2 / type\.particleCount\) \* i \+ Math\.random\(\) \* 0\.3;
      const radius = type\.size \* 0\.4 \+ Math\.random\(\) \* type\.size \* 0\.3;
      particles\.push\(\{
        offsetX: Math\.cos\(angle\) \* radius,
        offsetY: Math\.sin\(angle\) \* radius,
        size: type\.size \* 0\.3 \+ Math\.random\(\) \* type\.size \* 0\.2,
        originalSize: type\.size \* 0\.3 \+ Math\.random\(\) \* type\.size \* 0\.2
      \}\);
    \}
    
    return \{
      x: baseX,
      y: baseY,
      type,
      particles,
      hp: type\.hp \+ Math\.floor\(currentLevel / 3\),
      maxHp: type\.hp \+ Math\.floor\(currentLevel / 3\),
      dissolve: 0,
      time: 0,
      wobblePhase: Math\.random\(\) \* Math\.PI \* 2,
      lastShot: 0
    \};
  \};'''

    new_create_enemy = '''  // Create enemy with images based on boss level
  const createEnemy = (canvasWidth, canvasHeight, currentLevel) => {
    const typeKeys = Object.keys(ENEMY_TYPES);
    const typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const type = ENEMY_TYPES[typeKey];
    
    const baseX = Math.random() * (canvasWidth - 100) + 50;
    const baseY = -50;
    
    // Calculate boss stage to determine enemy image tier
    const bossStage = Math.floor(currentLevel / 2) + 1;
    
    // Select image based on enemy type (shooting vs non-shooting)
    let enemyImage;
    if (type.canShoot) {
      // Shooting enemies: higher boss = higher numbered image (1-5)
      const imageIndex = Math.min(bossStage - 1, SHOOTING_ENEMY_IMAGES.length - 1);
      enemyImage = new Image();
      enemyImage.src = SHOOTING_ENEMY_IMAGES[imageIndex];
    } else {
      // Non-shooting enemies: higher boss = higher numbered image (1-6)
      const imageIndex = Math.min(bossStage - 1, NONE_SHOOTING_ENEMY_IMAGES.length - 1);
      enemyImage = new Image();
      enemyImage.src = NONE_SHOOTING_ENEMY_IMAGES[imageIndex];
    }
    
    // Keep particles for dissolve effects
    const particles = [];
    for (let i = 0; i < type.particleCount; i++) {
      const angle = (Math.PI * 2 / type.particleCount) * i + Math.random() * 0.3;
      const radius = type.size * 0.4 + Math.random() * type.size * 0.3;
      particles.push({
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius,
        size: type.size * 0.3 + Math.random() * type.size * 0.2,
        originalSize: type.size * 0.3 + Math.random() * type.size * 0.2
      });
    }
    
    return {
      x: baseX,
      y: baseY,
      type,
      image: enemyImage,
      particles,
      hp: type.hp + Math.floor(currentLevel / 3),
      maxHp: type.hp + Math.floor(currentLevel / 3),
      dissolve: 0,
      time: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      lastShot: 0
    };
  };'''
    
    return re.sub(old_create_enemy, new_create_enemy, content)

def patch_enemy_drawing(content):
    """Update the enemy drawing code to render images instead of particles"""
    old_drawing = r'''    // Draw enemies as particle systems
    enemiesRef\.current\.forEach\(enemy => \{
      const dissolveFactor = Math\.max\(0, 1 - enemy\.dissolve\);
      
      enemy\.particles\.forEach\(\(particle, i\) => \{
        const px = enemy\.x \+ particle\.offsetX;
        const py = enemy\.y \+ particle\.offsetY;
        const size = particle\.size \* dissolveFactor \* \(1 - enemy\.dissolve \* 0\.5\);
        
        if \(size > 0\.5\) \{
          ctx\.beginPath\(\);
          ctx\.arc\(px, py, size, 0, Math\.PI \* 2\);
          
          // Gradient for particle
          const gradient = ctx\.createRadialGradient\(px, py, 0, px, py, size\);
          gradient\.addColorStop\(0, 'rgba\(255, 255, 255, 0\.8\)'\);
          gradient\.addColorStop\(0\.3, enemy\.type\.color\);
          gradient\.addColorStop\(1, 'rgba\(0, 0, 50, 0\.3\)'\);
          
          ctx\.fillStyle = gradient;
          ctx\.globalAlpha = dissolveFactor \* 0\.8;
          ctx\.fill\(\);
          ctx\.globalAlpha = 1;
          
          // Glow effect
          ctx\.shadowBlur = 15;
          ctx\.shadowColor = enemy\.type\.color;
          ctx\.strokeStyle = 'rgba\(255, 255, 255, 0\.3\)'\;
          ctx\.lineWidth = 1;
          ctx\.stroke\(\);
          ctx\.shadowBlur = 0;
        \}
      \}\);'''

    new_drawing = '''    // Draw enemies as images
    enemiesRef.current.forEach(enemy => {
      const dissolveFactor = Math.max(0, 1 - enemy.dissolve);
      
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemy.type.color;
      
      // Draw enemy image if loaded
      if (enemy.image && enemy.image.complete) {
        const imageSize = enemy.type.size * 2.5;
        const scale = dissolveFactor;
        
        // Subtle floating animation
        const floatOffset = Math.sin(enemy.time * 0.003) * 3;
        
        ctx.save();
        ctx.globalAlpha = dissolveFactor * 0.9;
        ctx.translate(0, floatOffset);
        ctx.scale(scale, scale);
        
        // Draw centered image
        ctx.drawImage(
          enemy.image,
          -imageSize / 2,
          -imageSize / 2,
          imageSize,
          imageSize
        );
        
        ctx.restore();
      } else {
        // Fallback: draw particle system if image not loaded
        enemy.particles.forEach((particle, i) => {
          const px = particle.offsetX;
          const py = particle.offsetY;
          const size = particle.size * dissolveFactor * (1 - enemy.dissolve * 0.5);
          
          if (size > 0.5) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, enemy.type.color);
            gradient.addColorStop(1, 'rgba(0, 0, 50, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = dissolveFactor * 0.8;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }
      
      ctx.restore();'''
    
    return re.sub(old_drawing, new_drawing, content)

def add_image_constants(content):
    """Add image path constants after playerConfigs"""
    insert_point = content.find('};\n\n\n// Helper function to lighten a hex color')
    if insert_point == -1:
        return content
    
    image_constants = '''// Enemy image paths configuration
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

'''
    
    return content[:insert_point] + image_constants + content[insert_point:]

def main():
    input_file = 'C:/xampp/htdocs/react-project/space-snake/src/SpaceSnakeGame.jsx.backup'
    output_file = 'C:/xampp/htdocs/react-project/space-snake/src/SpaceSnakeGame.jsx'
    
    print(f"Reading from: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Adding image constants...")
    content = add_image_constants(content)
    
    print("Patching createEnemy function...")
    content = patch_create_enemy(content)
    
    print("Patching enemy drawing code...")
    content = patch_enemy_drawing(content)
    
    print(f"Writing to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done!")

if __name__ == '__main__':
    main()
