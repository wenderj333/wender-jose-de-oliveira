content = open("frontend/src/pages/Members.jsx", "rb").read().decode("utf-8")

old = """    async function fetchMembers() {
      try {
        const t = token || localStorage.getItem(""token"");
        const res = await fetch(`${API}/members`, {
          headers: { Authorization: ""Bearer "" + t }
        });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const userList = Array.isArray(data) ? data : (data.members || data.users || []);
        setUsers(userList);
      } catch (err) {
        console.error(""Erro:"", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();"""

print("Encontrado:", old in content)
lines = content.split(chr(10))
for i, line in enumerate(lines):
    if "async function fetchMembers" in line:
        print("Linha:", i, line[:60])

