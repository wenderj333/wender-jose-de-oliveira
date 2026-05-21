code = open(r'src\pages\Profile.jsx', encoding='utf-8').read()
old = 'width:110, height:110'
new = 'width:150, height:150'
code = code.replace(old, new)
old2 = 'marginTop:-44'
new2 = 'marginTop:-60'
code = code.replace(old2, new2)
old3 = 'fontSize:36'
new3 = 'fontSize:48'
code = code.replace(old3, new3)
open(r'src\pages\Profile.jsx', 'w', encoding='utf-8').write(code)
print('Feito!')
