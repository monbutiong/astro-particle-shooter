file_path = r'C:\xampp\htdocs\react-project\space-snake\src\components\SpaceSnakeGameNew.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 625: closing brace should have 18 spaces
lines[624] = '                  }}>\n'  # line 625 (0-indexed 624)

# Fix lines 626-635: absolute positioned div should be indented at 18 spaces
lines[625] = '                  <div style={{\n'  # line 626
lines[626] = '                    position: \'absolute\',\n'  # line 627
lines[627] = '                    top: 0,\n'  # line 628
lines[628] = '                    left: 0,\n'  # line 629
lines[629] = '                    right: 0,\n'  # line 630
lines[630] = '                    bottom: 0,\n'  # line 631
lines[631] = '                    background: \'linear-gradient(90deg, transparent, rgba(255, 68, 255, 0.2), transparent)\',\n'  # line 632
lines[632] = '                    animation: \'level3Glow 2s ease-in-out infinite\',\n'  # line 633
lines[633] = '                    pointerEvents: \'none\'\n'  # line 634
lines[634] = '                  }} />\n'  # line 635

# Fix line 636: empty line
lines[635] = '\n'  # line 636

# Fix lines 637-651: ship icon div
lines[636] = '                  <div style={{\n'  # line 637
lines[637] = '                    width: \'50px\',\n'  # line 638
lines[638] = '                    height: \'50px\',\n'  # line 639
lines[639] = '                    borderRadius: \'10px\',\n'  # line 640
lines[640] = '                    background: \'rgba(255, 68, 255, 0.2)\',\n'  # line 641
lines[641] = '                    border: \'3px solid #ff44ff\',\n'  # line 642
lines[642] = '                    boxShadow: \'0 0 25px rgba(255, 68, 255, 0.8)\',\n'  # line 643
lines[643] = '                    display: \'flex\',\n'  # line 644
lines[644] = '                    alignItems: \'center\',\n'  # line 645
lines[645] = '                    justifyContent: \'center\',\n'  # line 646
lines[646] = '                    overflow: \'hidden\',\n'  # line 647
lines[647] = '                    flexShrink: 0,\n'  # line 648
lines[648] = '                    position: \'relative\',\n'  # line 649
lines[649] = '                    animation: \'level3Pulse 1.5s ease-in-out infinite\'\n'  # line 650
lines[650] = '                  }}>\n'  # line 651

# Fix lines 652-661: img tag and closing div
lines[651] = '                    <img\n'  # line 652
lines[652] = '                      src={`/assets/player/${characterType}-level-3.fw.png`}\n'  # line 653
lines[653] = '                      alt="Ultimate Ship"\n'  # line 654
lines[654] = '                      style={{\n'  # line 655
lines[655] = '                        width: \'100%\',\n'  # line 656
lines[656] = '                        height: \'100%\',\n'  # line 657
lines[657] = '                        objectFit: \'contain\'\n'  # line 658
lines[658] = '                      }}\n'  # line 659
lines[659] = '                    />\n'  # line 660
lines[660] = '                  </div>\n'  # line 661

# Fix lines 679-688: Ultimate text and dots div
lines[678] = '                    </div>\n'  # line 679 - Ultimate closing
lines[679] = '                    <div style={{\n'  # line 680 - dots div opening
lines[680] = '                      fontSize: \'18px\',\n'  # line 681
lines[681] = '                      color: \'#ff4444\',\n'  # line 682
lines[682] = '                      animation: \'pulse 1s ease-in-out infinite\',\n'  # line 683
lines[683] = '                      lineHeight: \'1.2\'\n'  # line 684
lines[684] = '                    }}>\n'  # line 685
lines[685] = '                      <div>ðŸ"´ðŸ"´</div>\n'  # line 686
lines[686] = '                      <div>ðŸ"´ðŸ"´</div>\n'  # line 687
lines[687] = '                    </div>\n'  # line 688

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('File updated successfully with precise fixes')
