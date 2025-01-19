### To convert sketches to a smaller size

```
for i in *.jpg; do convert "$i" -resize 800px -quality 85 "web-$i"; done