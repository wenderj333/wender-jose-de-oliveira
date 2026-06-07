with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

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
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg("Perfil atualizado com sucesso!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMsg("Erro ao salvar dados no servidor.");
      }
    } catch {
      setMsg("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  };'''
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK: ' + str(c.count('handleSave')))
