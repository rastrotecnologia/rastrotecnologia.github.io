// ============ Rastro Sistemas e Tecnologias ============

(function () {
  'use strict';

  // COLE AQUI O ID DA SUA PLANILHA (o que fica entre /d/ e /edit no link)
  // Ex.: docs.google.com/spreadsheets/d/ABC123xyz/edit -> ID = ABC123xyz
  var SHEET_ID = '1uDbYrUrtrGHD_hgJj6Cko2L4H0sgFrLA';

  // ============ Navbar: sombra ao rolar ============
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // ============ Menu mobile ============
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a[data-close]') || e.target.closest('.m-link')) {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============ Link ativo conforme a página ============
  var page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('[data-page]').forEach(function (link) {
    var href = (link.getAttribute('href') || '').split('#')[0].split('/').pop() || 'index.html';
    if (href === page) link.classList.add('active');
  });

  // ============ Animações de entrada ============
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ============ Abas da tabela de preços ============
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('.tab-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });

  // ============ Sub-abas da aba Rastreamento ============
  var subTabBtns = document.querySelectorAll('.sub-tab-btn');
  subTabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-sub');
      subTabBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('.sub-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });

  // ============ Planilha ao vivo (Google Sheets) ============
  // Carrega a tabela de mão de obra técnica veicular publicada e reescreve a
  // sub-aba "Mão de Obra Técnica Veicular". Se falhar, mantém os dados locais.
  function parseGviz(text) {
    var cleaned = text.replace(/^\/\*O_o\*\/\s*/, '').trim();
    var m = cleaned.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
    var raw = m ? m[1] : cleaned;
    return JSON.parse(raw);
  }

  function loadLaborSheet() {
    if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID') {
      hideSheetStatus();
      return;
    }
    var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json';
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var data = parseGviz(text);
        if (!data || !data.table || !data.table.rows) return;
        var tbody = document.getElementById('maoObraTbody');
        if (!tbody) return;
        var html = '';
        data.table.rows.forEach(function (r) {
          var cells = r.c || [];
          var get = function (i) {
            return cells[i] && cells[i].v !== null && cells[i].v !== undefined ? cells[i].v : '';
          };
          var cat = String(get(0));
          var serv = String(get(1));
          if (!cat && !serv) return;
          if (/m[ée]dias/i.test(cat)) {
            html += '<tr class="avg-row"><td colspan="3"><strong>Média geral da tabela:</strong> ' + escapeHtml(String(get(2))) + '</td></tr>';
            return;
          }
          html += '<tr class="cat-row"><td colspan="3">' + escapeHtml(cat) + '</td></tr>';
          var rawVal = get(2);
          var val;
          if (typeof rawVal === 'number') {
            val = rawVal === 0 ? 'Sem custo' : 'R$ ' + rawVal.toFixed(2).replace('.', ',');
          } else {
            val = rawVal ? String(rawVal) : 'Sob consulta';
          }
          html += '<tr><td>' + escapeHtml(serv) + '</td><td>' + escapeHtml(val) + '</td><td>' + escapeHtml(String(get(3))) + '</td></tr>';
        });
        tbody.innerHTML = html;

        var status = document.getElementById('sheetStatus');
        if (status) {
          status.classList.add('ok');
          status.innerHTML = '<span class="dot"></span> Tabela de mão de obra técnica atualizada ao vivo pela planilha do Google';
        }
      })
      .catch(function () { hideSheetStatus(); });
  }

  function hideSheetStatus() {
    var status = document.getElementById('sheetStatus');
    if (status) status.style.display = 'none';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (document.getElementById('maoObraTbody')) {
    loadLaborSheet();
  }

  // ============ Formulário de contato -> WhatsApp ============
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('nome').value.trim();
      var telefone = document.getElementById('telefone').value.trim();
      var empresa = document.getElementById('empresa').value.trim();
      var mensagem = document.getElementById('mensagem').value.trim();

      var texto =
        'Olá, Rastro Sistemas e Tecnologias!%0A' +
        '%0A' + 'Nome: ' + encodeURIComponent(nome) +
        '%0A' + 'Telefone: ' + encodeURIComponent(telefone) +
        (empresa ? '%0A' + 'Empresa: ' + encodeURIComponent(empresa) : '') +
        '%0A' + 'Mensagem: ' + encodeURIComponent(mensagem);

      window.open('https://wa.me/5531985074136?text=' + texto, '_blank');
      status.textContent = 'Enviado! Abrimos seu WhatsApp para concluir o contato.';
      status.className = 'form-status success';
      form.reset();
    });
  }

  // ============ Ano no rodapé ============
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
