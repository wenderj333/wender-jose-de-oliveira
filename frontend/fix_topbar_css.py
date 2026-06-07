css = open('src/sidebar.css', 'r', encoding='utf-8').read()
css += """
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 54px;
  background: linear-gradient(135deg, #7a9e7e, #c4b89a);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.nav-item:hover {
  background: rgba(255,255,255,0.2);
}
.nav-item.active {
  background: rgba(255,255,255,0.25);
  font-weight: 600;
}
"""
open('src/sidebar.css', 'w', encoding='utf-8').write(css)
print('Feito!')
