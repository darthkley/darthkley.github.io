/* Giz & Gabarito no navegador: só entra no site (o montar_web.py põe este arquivo no <head> da página). O app Android
   não usa nada daqui.

   1. Service worker (sw.js): guarda a página e as questões já abertas, para o treino abrir mais rápido e sem internet.

   2. Conta (login com Google), só quando window.GIZ_FIREBASE existe (a configuração do app da Web no Firebase, em
      ferramentas-mulder/web/firebase-web.json). Sem ela, a conta nem aparece, como no app sem o google-services.json.
      Este adaptador (window.GizWeb) responde pelos mesmos nomes da ponte do Android (contaDisponivel, contaEstado,
      contaEntrar, contaSair, contaSalvar, contaLer, contaApagar), e os avisos voltam para a página em window.gizConta,
      no mesmo formato do Conta.java: {"evento": entrou | saiu | nuvem | salvou | apagou | erro, "entrou", "nome",
      "email", e "dados" ou "motivo"}. O progresso fica no Firestore, em progresso/{uid}, nos campos "dados" (o JSON
      que o app guarda) e "atualizado" (hora do servidor), igual ao Android: quem entra com a mesma conta no celular e
      no computador vê o mesmo progresso. Privacidade (regra do dono): só o nome e o e-mail são usados, para mostrar
      com qual conta a pessoa entrou; a foto não é lida nem guardada em lugar nenhum nosso. */
(function () {
  'use strict';

  // ---------------- 1. service worker
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem cache offline; o resto funciona igual */ });
    });
  }

  // ---------------- 2. conta
  var cfg = window.GIZ_FIREBASE, fb = window.firebase;
  if (!cfg || !fb || !fb.initializeApp) return;
  var app, auth, db;
  try {
    app = fb.initializeApp(cfg);
    auth = fb.auth(app);
    db = fb.firestore(app);
  } catch (e) { return; }

  function usuario() { return auth.currentUser; }
  function estado() {
    var u = usuario();
    return u ? { entrou: true, nome: u.displayName || '', email: u.email || '' } : { entrou: false };
  }
  function avisar(evento, extra) {
    var e = estado();
    e.evento = evento;
    if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k]; });
    var texto = JSON.stringify(e);
    // como no Android, a resposta chega depois da chamada
    setTimeout(function () { if (window.gizConta) window.gizConta(texto); }, 0);
  }
  function motivo(erro) {
    var c = (erro && erro.code) || '';
    if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request' || c === 'auth/user-cancelled') return 'cancelado';
    if (c === 'auth/popup-blocked') return 'bloqueado';
    if (c === 'auth/network-request-failed' || c === 'unavailable') return 'rede';
    return 'outro';
  }
  function documento() {
    var u = usuario();
    return u ? db.collection('progresso').doc(u.uid) : null;
  }
  function provedor() {
    var p = new fb.auth.GoogleAuthProvider();
    // a conta escolhida a cada vez, para quem usa mais de uma conta Google no computador
    p.setCustomParameters({ prompt: 'select_account' });
    return p;
  }

  // a sessão do Firebase volta sozinha quando a página abre: a página fica sabendo como se a pessoa tivesse acabado de
  // entrar, e então lê e junta o progresso da nuvem. Só avisa quando a conta muda, para não juntar duas vezes.
  var uidAvisado = null;
  auth.onAuthStateChanged(function (u) {
    var uid = u ? u.uid : null;
    if (uid && uid !== uidAvisado) avisar('entrou');
    uidAvisado = uid;
  });

  window.GizWeb = {
    contaDisponivel: function () { return true; },
    contaEstado: function () { return JSON.stringify(estado()); },
    contaEntrar: function () {
      auth.signInWithPopup(provedor()).catch(function (e) { avisar('erro', { motivo: motivo(e) }); });
      // a entrada avisa pelo onAuthStateChanged
    },
    contaSair: function () {
      auth.signOut().then(function () { uidAvisado = null; avisar('saiu'); }, function (e) { avisar('erro', { motivo: motivo(e) }); });
    },
    contaSalvar: function (dados) {
      var doc = documento();
      if (!doc || dados == null) { avisar('erro', { motivo: 'outro' }); return; }
      doc.set({ dados: String(dados), atualizado: fb.firestore.FieldValue.serverTimestamp() })
        .then(function () { avisar('salvou'); }, function (e) { avisar('erro', { motivo: motivo(e) }); });
    },
    contaLer: function () {
      var doc = documento();
      if (!doc) { avisar('erro', { motivo: 'outro' }); return; }
      doc.get().then(function (s) {
        var d = s.exists ? s.data() : null;
        avisar('nuvem', { dados: d && typeof d.dados === 'string' ? d.dados : '' });
      }, function (e) { avisar('erro', { motivo: motivo(e) }); });
    },
    // apaga o progresso da nuvem e a conta no Firebase; se o Google pedir um login recente, pede de novo e repete
    contaApagar: function () {
      var u = usuario(), doc = documento();
      if (!u || !doc) { avisar('erro', { motivo: 'outro' }); return; }
      doc.delete().then(function () {
        return u.delete().catch(function (e) {
          if (e && e.code === 'auth/requires-recent-login') return u.reauthenticateWithPopup(provedor()).then(function () { return u.delete(); });
          throw e;
        });
      }).then(function () { uidAvisado = null; avisar('apagou'); }, function (e) { avisar('erro', { motivo: motivo(e) }); });
    }
  };
})();
