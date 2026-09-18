(() => {
  'use strict';

  const TRIAL_MS = 3 * 60 * 1000;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const gameId = path.split('/').filter(Boolean).pop() || 'jogo';
  const storageKey = `sigo-com-fe:teste:${gameId}:iniciado-em`;

  const hasAccount = () => {
    try {
      return Boolean(window.localStorage.getItem('token') && window.localStorage.getItem('user'));
    } catch {
      return false;
    }
  };

  if (hasAccount()) return;

  let startedAt = Number(window.localStorage.getItem(storageKey));
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    startedAt = Date.now();
    window.localStorage.setItem(storageKey, String(startedAt));
  }

  const goTo = (route) => {
    const destination = `${route}?next=${encodeURIComponent(path)}`;
    try {
      window.top.location.assign(destination);
    } catch {
      window.location.assign(destination);
    }
  };

  const mountStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      #sigo-trial-clock{position:fixed;top:14px;right:14px;z-index:2147483646;display:flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(183,135,57,.46);border-radius:999px;background:rgba(20,47,55,.92);color:#fff8e7;font:700 12px/1.1 Arial,sans-serif;box-shadow:0 7px 18px rgba(0,0,0,.22);backdrop-filter:blur(8px)}
      #sigo-trial-clock strong{color:#ffe28a;font-variant-numeric:tabular-nums}
      #sigo-trial-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:20px;background:rgba(6,19,37,.78);backdrop-filter:blur(7px)}
      #sigo-trial-overlay[hidden]{display:none}
      .sigo-trial-card{box-sizing:border-box;width:min(460px,100%);padding:32px 28px;border:1px solid rgba(255,224,135,.7);border-radius:24px;background:linear-gradient(145deg,#fffdf4,#f7edcb);color:#18384a;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.36)}
      .sigo-trial-icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 14px;border-radius:18px;background:#fff2bf;color:#a86d10;font-size:29px}
      .sigo-trial-card h1{margin:0;color:#174b43;font:800 clamp(24px,5vw,32px)/1.15 Georgia,serif}
      .sigo-trial-card p{margin:13px auto 0;max-width:35ch;color:#54616c;font:16px/1.55 Arial,sans-serif}
      .sigo-trial-actions{display:grid;gap:10px;margin-top:23px}
      .sigo-trial-actions button{min-height:48px;border:0;border-radius:13px;padding:11px 18px;cursor:pointer;font:800 15px/1.2 Arial,sans-serif}
      .sigo-trial-register{background:linear-gradient(135deg,#e5ae2c,#c98513);color:#172b40;box-shadow:0 8px 16px rgba(185,122,21,.24)}
      .sigo-trial-login{background:#e7f0eb;color:#185247;border:1px solid #b5d3c4!important}
      @media(max-width:520px){#sigo-trial-clock{top:9px;right:9px;padding:8px 10px;font-size:11px}.sigo-trial-card{padding:27px 20px;border-radius:20px}}
    `;
    document.head.appendChild(style);
  };

  const mountUi = () => {
    mountStyles();
    const clock = document.createElement('div');
    clock.id = 'sigo-trial-clock';
    clock.innerHTML = '<span>🎁 Teste grátis</span><strong aria-live="polite"></strong>';
    document.body.appendChild(clock);

    const overlay = document.createElement('section');
    overlay.id = 'sigo-trial-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'sigo-trial-title');
    overlay.innerHTML = `
      <div class="sigo-trial-card">
        <div class="sigo-trial-icon" aria-hidden="true">✨</div>
        <h1 id="sigo-trial-title">O seu teste terminou</h1>
        <p>Crie a sua conta gratuita para continuar a jogar, guardar o seu progresso e aproveitar todos os jogos do Sigo com Fé.</p>
        <div class="sigo-trial-actions">
          <button class="sigo-trial-register" type="button">Criar conta gratuita</button>
          <button class="sigo-trial-login" type="button">Já tenho conta — Entrar</button>
        </div>
      </div>`;
    overlay.querySelector('.sigo-trial-register').addEventListener('click', () => goTo('/register'));
    overlay.querySelector('.sigo-trial-login').addEventListener('click', () => goTo('/login'));
    document.body.appendChild(overlay);

    const update = () => {
      if (hasAccount()) {
        clock.remove();
        overlay.remove();
        return true;
      }
      const remaining = Math.max(0, TRIAL_MS - (Date.now() - startedAt));
      const seconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const rest = String(seconds % 60).padStart(2, '0');
      clock.querySelector('strong').textContent = `${minutes}:${rest}`;
      if (remaining <= 0) {
        clock.hidden = true;
        overlay.hidden = false;
        return true;
      }
      return false;
    };

    if (update()) return;
    const timer = window.setInterval(() => {
      if (update()) window.clearInterval(timer);
    }, 1000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountUi, { once: true });
  else mountUi();
})();
