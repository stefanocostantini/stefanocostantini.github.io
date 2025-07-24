### To convert sketches to a smaller size

```
mkdir -p modified
for file in originals/*.JPG; do
    convert "$file" -resize 800x800\> -quality 85 "modified/$(basename "$file")"
done
```