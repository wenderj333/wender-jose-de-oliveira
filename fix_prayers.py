content = open("frontend/src/App.jsx", "rb").read().decode("utf-8")

old = "  const [pendingRequests, setPendingRequests] = useState(0);"
new = """  const [pendingRequests, setPendingRequests] = useState(0);
  const [prayerRequests, setPrayerRequests] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch((import.meta.env ? import.meta.env.VITE_API_URL : '') + '/api/pedidos-ajuda' || '/api/pedidos-ajuda', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).then(d => {
      const list = d.requests || d.posts || d || [];
      setPrayerRequests(Array.isArray(list) ? list.slice(0, 3) : []);
    }).catch(() => {});
  }, [token]);"""

if old in content:
    content = content.replace(old, new)
    open("frontend/src/App.jsx", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Texto nao encontrado")
