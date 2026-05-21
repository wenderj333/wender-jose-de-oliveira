import json, sys
code = open("frontend/src/pages/Friends.jsx", "rb").read().decode("utf-8")

old = """  useEffect(() => {
    setLoading(true);
    fetch(`${API}/friends`, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => {
      // Ajuste para pegar a lista correta dependendo de como o backend envia
      setFriends(data.friends || data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao carregar amigos:", err);
      setLoading(false);
    });
  }, [token]);"""

new = """  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fr, rq] = await Promise.all([
        fetch(`${API}/friends`, { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
        fetch(`${API}/friends/requests`, { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
      ]);
      setFriends(fr.friends || fr || []);
      setRequests(rq.requests || rq || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [token]);

  const acceptRequest = async (friendshipId) => {
    try {
      await fetch(`${API}/friends/accept/${friendshipId}`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token }
      });
      await loadData();
      alert("Amizade aceite!");
    } catch(e) { console.error(e); }
  };"""

if old in code:
    code = code.replace(old, new)
    open("frontend/src/pages/Friends.jsx", "wb").write(code.encode("utf-8"))
    print("Feito!")
else:
    print("Texto nao encontrado")
