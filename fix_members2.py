content = open("frontend/src/pages/Members.jsx", "rb").read().decode("utf-8")
lines = content.split(chr(10))

new_func = """    async function fetchMembers() {
      try {
        const t = token || localStorage.getItem("token");
        const [membersRes, friendsRes, requestsRes] = await Promise.all([
          fetch(`${API}/members`, { headers: { Authorization: "Bearer " + t } }),
          fetch(`${API}/friends`, { headers: { Authorization: "Bearer " + t } }),
          fetch(`${API}/friends/requests`, { headers: { Authorization: "Bearer " + t } })
        ]);
        if (!membersRes.ok) { setLoading(false); return; }
        const data = await membersRes.json();
        const userList = Array.isArray(data) ? data : (data.members || data.users || []);
        setUsers(userList);
        const statusMap = {};
        if (friendsRes.ok) {
          const fd = await friendsRes.json();
          (fd.friends || []).forEach(f => { statusMap[f.id] = "accepted"; });
        }
        if (requestsRes.ok) {
          const rd = await requestsRes.json();
          (rd.requests || []).forEach(r => { statusMap[r.id] = "pending"; });
        }
        setFriendStatus(statusMap);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();"""

new_lines = lines[:16] + new_func.split(chr(10)) + lines[32:]
open("frontend/src/pages/Members.jsx", "wb").write(chr(10).join(new_lines).encode("utf-8"))
print("Feito!")
