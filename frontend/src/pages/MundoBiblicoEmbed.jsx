import React from 'react';

export default function MundoBiblicoEmbed() {
  return (
    <main style={{ minHeight: '100vh', background: '#eef3ff', padding: 12 }}>
      <iframe
        title="Mundo Bíblico"
        src="/mundo-biblico/index.html"
        style={{ display: 'block', width: '100%', minHeight: 'calc(100vh - 24px)', border: 0, borderRadius: 16, background: '#fff' }}
      />
    </main>
  );
}
