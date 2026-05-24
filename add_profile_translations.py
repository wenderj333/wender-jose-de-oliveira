import json
langs = {
    "pt": {"aboutMe":"Sobre mim","city":"Cidade","country":"Pais","profession":"Profissao","work":"Trabalho","birthdate":"Data de nascimento","maritalStatus":"Estado civil","married":"Casado(a)","single":"Solteiro(a)","divorced":"Divorciado(a)","widowed":"Viuvo(a)","favoriteVerse":"Versiculo favorito","testimony":"Testemunho","saveProfile":"Guardar perfil","editProfile":"Editar perfil"},
    "en": {"aboutMe":"About me","city":"City","country":"Country","profession":"Profession","work":"Work","birthdate":"Date of birth","maritalStatus":"Marital status","married":"Married","single":"Single","divorced":"Divorced","widowed":"Widowed","favoriteVerse":"Favourite verse","testimony":"Testimony","saveProfile":"Save profile","editProfile":"Edit profile"},
    "es": {"aboutMe":"Sobre mi","city":"Ciudad","country":"Pais","profession":"Profesion","work":"Trabajo","birthdate":"Fecha de nacimiento","maritalStatus":"Estado civil","married":"Casado(a)","single":"Soltero(a)","divorced":"Divorciado(a)","widowed":"Viudo(a)","favoriteVerse":"Versiculo favorito","testimony":"Testimonio","saveProfile":"Guardar perfil","editProfile":"Editar perfil"},
    "de": {"aboutMe":"Ueber mich","city":"Stadt","country":"Land","profession":"Beruf","work":"Arbeit","birthdate":"Geburtsdatum","maritalStatus":"Familienstand","married":"Verheiratet","single":"Ledig","divorced":"Geschieden","widowed":"Verwitwet","favoriteVerse":"Lieblingsvers","testimony":"Zeugnis","saveProfile":"Profil speichern","editProfile":"Profil bearbeiten"},
    "fr": {"aboutMe":"A propos de moi","city":"Ville","country":"Pays","profession":"Profession","work":"Travail","birthdate":"Date de naissance","maritalStatus":"Etat civil","married":"Marie(e)","single":"Celibataire","divorced":"Divorce(e)","widowed":"Veuf/Veuve","favoriteVerse":"Verset prefere","testimony":"Temoignage","saveProfile":"Sauvegarder profil","editProfile":"Modifier profil"},
    "ro": {"aboutMe":"Despre mine","city":"Oras","country":"Tara","profession":"Profesie","work":"Munca","birthdate":"Data nasterii","maritalStatus":"Stare civila","married":"Casatorit(a)","single":"Necasatorit(a)","divorced":"Divortat(a)","widowed":"Vaduv(a)","favoriteVerse":"Versetul preferat","testimony":"Marturie","saveProfile":"Salveaza profil","editProfile":"Editeaza profil"},
    "ru": {"aboutMe":"Obo mne","city":"Gorod","country":"Strana","profession":"Professiya","work":"Rabota","birthdate":"Data rozhdeniya","maritalStatus":"Semeynoe polozhenie","married":"Zhenat/Zamuzhem","single":"Holost","divorced":"Razveden(a)","widowed":"Vdovec/Vdova","favoriteVerse":"Lyubimyy stikh","testimony":"Svidetelstvo","saveProfile":"Sokhranit profil","editProfile":"Redaktirovat profil"},
}
for lang, vals in langs.items():
    fname = "frontend/src/i18n/" + lang + ".json"
    with open(fname, "rb") as f:
        data = json.loads(f.read().decode("utf-8"))
    if "profile" not in data:
        data["profile"] = {}
    for k, v in vals.items():
        data["profile"][k] = v
    with open(fname, "wb") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
    print(lang + " - OK")
