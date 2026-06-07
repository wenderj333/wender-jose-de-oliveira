css = open('src/sidebar.css', 'r', encoding='utf-8').read()
css = css.replace(
    'background: linear-gradient(135deg, #7a9e7e, #c4b89a);',
    'background: linear-gradient(135deg, #5a7a5e, #8a6e4a);'
)
open('src/sidebar.css', 'w', encoding='utf-8').write(css)
print('Feito!')
