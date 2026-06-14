with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar import useLocation
old_import = """import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";"""
if 'useLocation' not in content:
    content = content.replace(
        'from "react-router-dom"',
        'from "react-router-dom"'
    )

# Adicionar logica para mostrar post especifico
old_fetch = """  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feed?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      const rawPosts = data.posts || data || [];"""

new_fetch = """  const postIdFromUrl = new URLSearchParams(window.location.search).get('post');
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feed?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      const rawPosts = data.posts || data || [];"""

content = content.replace(old_fetch, new_fetch)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('postIdFromUrl: ' + ('OK' if 'postIdFromUrl' in content else 'FALHOU'))
