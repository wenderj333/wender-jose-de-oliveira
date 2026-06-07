css = open('src/styles/ModernTheme.css', 'r', encoding='utf-8').read()
css += """
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  width: 100%;
}
.gallery-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f0f0f0;
  cursor: pointer;
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.gallery-item:hover img {
  transform: scale(1.05);
}
"""
open('src/styles/ModernTheme.css', 'w', encoding='utf-8').write(css)
print('Feito!')
