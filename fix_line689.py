file_path = r'C:\xampp\htdocs\react-project\space-snake\src\components\SpaceSnakeGameNew.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 689: closing tag for text info div should have 18 spaces
lines[688] = '                  </div>\n'  # line 689 (0-indexed 688)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Line 689 fixed - text info div closing tag properly aligned')
