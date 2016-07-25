import os
import re

if not os.path.exists('bundled'):
    os.mkdir('bundled')

def sub_style(match):
    with open(match.group(2)) as f:
        contents = f.read()
    return '<style type="text/css">' + contents + '</style>'

def sub_script(match):
    with open(match.group(2)) as f:
        contents = f.read()
    return '<script type="text/javascript">' + contents + '</script>'

with open('index.html') as f:
    src = f.read()

out = src
out = re.sub(r'<link.*?href=([\'"])(.+?)\1.*?>', sub_style, out)
out = re.sub(r'<script.*?src=([\'"])(.+?)\1.*?></script>', sub_script, out)

with open('bundled/index.html', 'w') as f:
    f.write(out)
