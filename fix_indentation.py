import re

file_path = r'C:\xampp\htdocs\react-project\space-snake\src\components\SpaceSnakeGameNew.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix 1: Lines 617-624 - outer div style properties (change 20 spaces to 18)
for i in range(616, 625):  # lines 617-624 (0-indexed)
    if lines[i].startswith('                    '):  # 20 spaces
        lines[i] = '                  ' + lines[i][20:]

# Fix 2: Lines 629-634 - absolute positioned div (fix indentation)
for i in range(628, 635):  # lines 629-634 (0-indexed)
    if lines[i].startswith('                      '):  # 22 spaces at start
        lines[i] = '                    ' + lines[i][22:]  # change to 20 spaces
    elif lines[i].startswith('                    '):  # 20 spaces for left/right/bottom
        lines[i] = '                    ' + lines[i][20:]  # keep 20 spaces

# Fix 3: Lines 637-651 - ship icon div (fix inconsistent indentation)
# Line 637: change from 20 spaces to 18
if lines[636].startswith('                    <div'):  # line 637
    lines[636] = '                  ' + lines[636][20:]

# Lines 638-650: properties should have 20 spaces
for i in range(637, 651):  # lines 638-650 (0-indexed)
    if i < len(lines) and lines[i].startswith('                      '):  # 22 spaces
        lines[i] = '                    ' + lines[i][22:]  # change to 20
    elif i < len(lines) and lines[i].startswith('                    '):  # 20 spaces
        if i != 636:  # skip the opening div
            lines[i] = '                    ' + lines[i][20:]

# Fix 4: Lines 679-688 - misaligned closing tags and properties
# Line 679: Ultimate closing div should have 18 spaces
if lines[678].startswith('                  </'):  # line 679
    lines[678] = '                  ' + lines[678][18:]

# Line 680-688: dots div should have proper nesting
for i in range(679, 688):  # lines 680-688 (0-indexed)
    if i < len(lines) and lines[i].startswith('                  '):  # 18 spaces
        lines[i] = '                    ' + lines[i][18:]  # change to 20 spaces
    elif i < len(lines) and lines[i].startswith('                 '):  # 17 spaces (line 688)
        lines[i] = '                  ' + lines[i][17:]  # change to 18 spaces

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('File updated successfully')
