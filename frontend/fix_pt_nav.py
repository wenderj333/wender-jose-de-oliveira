import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

# nav
data["nav"]["reflection"] = "Reflexao com Deus"
data["nav"]["help_life"] = "Ajude o Proximo"
data["nav"]["bible_ai"] = "IA Biblica"
data["nav"]["journeys"] = "Jornadas de Fe"
data["nav"]["tithe"] = "Dizimo"
data["nav"]["live_community"] = "Chat Evangelicos"

# footer
data["footer"] = "2026 Sigo com Fe - Tecnologia a servico do Reino"

# home
if "home" in data:
    data["home"]["subtitle"] = "Ore, conecte-se e fortaleça sua fe com milhares de irmaos ao redor do mundo."
    data["home"]["whyChoose"] = "Por Que Escolher Sigo com Fe?"
    data["home"]["global"] = "Comunidade Global"
    data["home"]["globalDesc"] = "Conecte-se com cristaos de todo o mundo"
    data["home"]["free"] = "Totalmente Gratis"

with open("src/i18n/pt.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Feito!")
