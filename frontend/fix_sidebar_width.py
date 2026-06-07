css = open('src/sidebar.css', 'r', encoding='utf-8').read()
css = css.replace(
    '.sidebar-left {\n  width: 72px;\n  min-width: 72px;\n  max-width: 72px;',
    '.sidebar-left {\n  width: 220px;\n  min-width: 220px;\n  max-width: 220px;'
)
css = css.replace(
    '.sidebar-left .nav-text,\n.sidebar-left .menu-title,\n.sidebar-left p {\n  display: none;\n}',
    '.sidebar-left .nav-text,\n.sidebar-left .menu-title,\n.sidebar-left p {\n  display: inline;\n}'
)
open('src/sidebar.css', 'w', encoding='utf-8').write(css)
print('Feito!')
