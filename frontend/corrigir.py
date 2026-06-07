import os
fixes={'FÃ©':'Fé','Ã³':'ó','Ã±':'ñ','Ã¡':'á','Ã©':'é','Ã£':'ã','Ã§':'ç','Ãµ':'õ','Ã­':'í','Ãº':'ú','Ã´':'ô','Ãª':'ê','NotificaÃ§Ãµes':'Notificações','OraÃ§Ãµes':'Orações','ReflexÃ£o':'Reflexão','ConsagraÃ§Ã£o':'Consagração','JÃ¡':'Já','PrÃ³ximos':'Próximos','PrÃ³ximo':'Próximo','PrÃ³xima':'Próxima','AleatÃ³rio':'Aleatório','GraÃ§a':'Graça','CristÃ£':'Cristã','faÃ§a':'faça','Ã‰':'É','obrigatÃ³rio':'obrigatório'}
fixed=[]
for root,dirs,files in os.walk('src'):
    dirs[:]=[d for d in dirs if 'backup' not in d]
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path=os.path.join(root,file)
            c=open(path,'r',encoding='utf-8').read()
            n=c
            for b,g in fixes.items(): n=n.replace(b,g)
            if n!=c:
                open(path,'w',encoding='utf-8').write(n)
                fixed.append(path)
print(f'Corrigidos: {len(fixed)}')
[print(' -',f) for f in fixed]
print('Concluido!')