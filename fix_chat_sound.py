with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Chat.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Melhorar o som para ser mais audivel e adicionar som ao enviar
old_sound = """function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}"""

new_sound = """function playMessageSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === 'send') {
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    } else {
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
      g.gain.setValueAtTime(0.5, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    }
  } catch(e) {}
}"""

content = content.replace(old_sound, new_sound)

# Adicionar som ao enviar mensagem
old_send = """      if (res.ok) {
        setText('');"""
new_send = """      if (res.ok) {
        playMessageSound('send');
        setText('');"""

content = content.replace(old_send, new_send, 1)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Chat.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Som: ' + ('OK' if "type === 'send'" in content else 'FALHOU'))
print('Enviar som: ' + ('OK' if "playMessageSound('send')" in content else 'FALHOU'))
