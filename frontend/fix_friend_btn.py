with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar estado de amizade
old = "  const [following, setFollowing] = useState(false);\n  const [followCount, setFollowCount] = useState(0);"
new = """  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [friendStatus, setFriendStatus] = useState(null); // null, pending, accepted

  useEffect(() => {
    if (!token || !userId || userId === currentUser?.id) return;
    fetch((import.meta.env.VITE_API_URL || "") + "/api/friends", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
      const friends = data.friends || [];
      const isFriend = friends.find(f => f.id === userId);
      if (isFriend) setFriendStatus("accepted");
    })
    .catch(() => {});
  }, [token, userId]);

  const handleFollow = async () => {
    if (!token) return;
    if (friendStatus === "accepted") return;
    try {
      await fetch((import.meta.env.VITE_API_URL || "") + "/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ addresseeId: userId })
      });
      setFriendStatus("pending");
    } catch(e) {}
  };"""

content = content.replace(old, new)

# Substituir botao seguir
content = content.replace(
    '{userId && userId !== currentUser?.id && (\n              <button onClick={() => setFollowing(!following)} style={{ background: following ? "#6C3FA0" : "transparent", color: following ? "white" : "#6C3FA0", border: "1px solid #6C3FA0", borderRadius: "20px", padding: "4px 14px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>{following ? "✓ irmaos" : t("profile.followers","segui um irmao")}</button>\n            )}',
    '{userId && userId !== currentUser?.id && (\n              <button onClick={handleFollow} disabled={friendStatus !== null} style={{ background: friendStatus === "accepted" ? "#6C3FA0" : friendStatus === "pending" ? "#ccc" : "transparent", color: friendStatus ? "white" : "#6C3FA0", border: "1px solid #6C3FA0", borderRadius: "20px", padding: "4px 14px", fontWeight: "600", fontSize: "13px", cursor: friendStatus ? "default" : "pointer" }}>{friendStatus === "accepted" ? "✓ irmaos" : friendStatus === "pending" ? "pedido enviado" : t("profile.followers","segui um irmao")}</button>\n            )}'
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
