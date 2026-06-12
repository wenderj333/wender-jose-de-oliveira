with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'handleSave' not in c:
    c = c.replace(
        '  const [loading, setLoading] = useState(false);',
        '''  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://sigo-com-fe-api.onrender.com/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          full_name: form.full_name,
          bio: form.bio,
          city: form.city,
          country: form.country,
          profession: form.profession,
          marital_status: form.marital_status,
          church_name: form.church_name,
          denomination: form.denomination,
          christian_years: form.christian_years,
          favorite_verse: form.favorite_verse,
          testimony: form.testimony,
          avatar_url: form.avatar_url,
          cover_url: form.cover_url
        })
      });
      if (res.ok) {
        setMsg("Perfil atualizado com sucesso!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const err = await res.json();
        setMsg("Erro: " + (err.error || "servidor"));
      }
    } catch {
      setMsg("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  };'''
    )
    print('handleSave adicionado!')
else:
    print('handleSave ja existe')

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
