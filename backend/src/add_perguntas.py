novas_perguntas = """
    {q:"Quantos livros tem a Biblia?",a:["66","72","80","39"],c:0},
    {q:"Quem construiu a arca?",a:["Abraao","Moises","Noe","Davi"],c:2},
    {q:"Quantos dias durou o diluvio?",a:["20","40","60","100"],c:1},
    {q:"Quem foi engolido por um peixe grande?",a:["Elias","Jonas","Daniel","Paulo"],c:1},
    {q:"Em qual cidade nasceu Jesus?",a:["Nazare","Jerusalem","Betania","Belem"],c:3},
    {q:"Quantos apostolos tinha Jesus?",a:["10","11","12","13"],c:2},
    {q:"Quem traiu Jesus por 30 moedas de prata?",a:["Pedro","Joao","Judas","Tomas"],c:2},
    {q:"Qual foi o primeiro milagre de Jesus?",a:["Ressuscitar Lazaro","Curar cego","Agua em vinho","Multiplicar paes"],c:2},
    {q:"Quantos dias Jesus ficou no deserto?",a:["20","30","40","50"],c:2},
    {q:"Quem escreveu a maioria dos Salmos?",a:["Salomao","Davi","Moises","Abraao"],c:1},
    {q:"Qual animal falou com Eva no jardim?",a:["Aguia","Leao","Serpente","Pomba"],c:2},
    {q:"Quem foi o rei mais sabio de Israel?",a:["Davi","Saul","Salomao","Josias"],c:2},
    {q:"Qual rio Jesus foi batizado?",a:["Nilo","Eufrates","Jordao","Tigre"],c:2},
    {q:"Quantas pedras Davi usou contra Golias?",a:["3","5","1","7"],c:2},
    {q:"Quem foi o primeiro rei de Israel?",a:["Davi","Salomao","Saul","Josue"],c:2},
    {q:"Em quantos dias Deus criou o mundo?",a:["5","6","7","8"],c:1},
    {q:"Qual tribo Jesus pertencia?",a:["Levi","Benjamim","Juda","Ruben"],c:2},
    {q:"Quem negou Jesus tres vezes?",a:["Joao","Judas","Tiago","Pedro"],c:3},
    {q:"Qual o ultimo livro da Biblia?",a:["Jude","Hebreus","Apocalipse","Atos"],c:2},
    {q:"Quem foi lancado na cova dos leoes?",a:["Elias","Daniel","Paulo","Ezequiel"],c:1},
    {q:"Quantos filhos Jaco teve?",a:["10","11","12","13"],c:2},
    {q:"Qual o primeiro livro da Biblia?",a:["Exodo","Genesis","Levitico","Numeros"],c:1},
    {q:"Quem separou o Mar Vermelho?",a:["Josue","Davi","Moises","Elias"],c:2},
    {q:"Em qual monte Moises recebeu os 10 mandamentos?",a:["Monte das Oliveiras","Monte Sinai","Monte Carmelo","Monte Nebo"],c:1},
    {q:"Quem foi o pai de Joao Batista?",a:["Zacarias","Jose","Eliseu","Ananias"],c:0},
"""

with open("server.js", "r", encoding="utf-8") as f:
    c = f.read()

old = '    {q:"Quem foi o primeiro homem?",a:["Noe","Adao","Abraao","Moises"],'
new = novas_perguntas + '    {q:"Quem foi o primeiro homem?",a:["Noe","Adao","Abraao","Moises"],'

if old in c:
    c = c.replace(old, new)
    print("OK: perguntas adicionadas")
else:
    print("ERRO: texto nao encontrado")

with open("server.js", "w", encoding="utf-8") as f:
    f.write(c)