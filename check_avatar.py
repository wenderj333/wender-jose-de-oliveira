content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
idx = content.find("authorInitials")
print(repr(content[idx-200:idx+50]))
