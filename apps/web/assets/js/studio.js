/* Ask Compass Studio: a browser-only prototype of the procedure workspace.
   Library with folders and step-level search, guided runs with linked
   procedures, a process map, a draft editor, side-by-side approval, version
   history, notifications, step feedback, usage insights and an audit log.
   Everything is stored in this browser (localStorage); nothing is sent to a
   server. Roles are a demo switcher, not real sign-in. */
(function () {
  'use strict';

  /* ───────── storage ───────── */
  var KEY = 'askcompass.studio.v2';   // v2: rupee sample data and the question-card run
  var mem = null;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* storage unavailable */ }
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* keep in memory */ } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function now() { return new Date().toISOString(); }
  function uid(p) { return (p || 'n') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function seed() {
    var t = new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString();
    return {
      role: 'editor',
      procedures: window.STUDIO_SAMPLES.map(function (s) {
        return {
          id: s.id, title: s.title, folder: s.folder, owner: s.owner, summary: s.summary,
          versions: [{ v: 1, start: s.start, nodes: clone(s.nodes), edges: clone(s.edges), at: t, by: 'Sample data', note: 'First published version' }],
          draft: null
        };
      }),
      audit: [{ at: t, who: 'Sample data', what: 'Loaded five sample procedures' }],
      notifications: [],
      feedback: [],
      usage: {},
      used: []
    };
  }
  var db = load() || seed();
  mem = db;

  /* ───────── roles ───────── */
  var ROLES = {
    viewer: { label: 'Viewer', can: ['run'] },
    editor: { label: 'Editor', can: ['run', 'edit'] },
    approver: { label: 'Approver', can: ['run', 'approve'] },
    admin: { label: 'Admin', can: ['run', 'edit', 'approve', 'admin'] }
  };
  function can(a) { return ROLES[db.role].can.indexOf(a) !== -1; }
  function who() { return ROLES[db.role].label + ' (you)'; }

  /* ───────── helpers ───────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function proc(id) { return db.procedures.filter(function (p) { return p.id === id; })[0]; }
  function live(p) { return p.versions[p.versions.length - 1]; }
  function nodeOf(f, id) { return f.nodes.filter(function (n) { return n.id === id; })[0]; }
  function outs(f, id) { return f.edges.filter(function (e) { return e.from === id; }); }
  function ago(iso) {
    var s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    var d = Math.round(s / 86400); return d + (d === 1 ? ' day ago' : ' days ago');
  }
  function log(what, procId) { db.audit.unshift({ at: now(), who: who(), what: what, proc: procId || null }); }
  function notify(text, procId) { db.notifications.unshift({ id: uid('m'), at: now(), text: text, proc: procId || null, read: false }); }
  function usage(id) { return db.usage[id] || (db.usage[id] = { views: 0, completions: 0, restarts: 0, steps: {}, exits: {} }); }
  var TYPE = {
    action: { label: 'Action' }, decision: { label: 'Decision' }, note: { label: 'Note' },
    link: { label: 'Linked procedure' }, end: { label: 'End' }
  };
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* Problems that would stop a flow being followed correctly. */
  function validate(f) {
    var issues = [];
    if (!nodeOf(f, f.start)) issues.push('Choose a first step.');
    f.nodes.forEach(function (n) {
      var k = outs(f, n.id).length;
      if (!n.title.trim()) issues.push('A step has no title.');
      if (n.type === 'end' && k) issues.push('“' + n.title + '” is an end step but has a next step.');
      if (n.type === 'decision' && k < 2) issues.push('“' + n.title + '” needs at least two answers.');
      if (n.type === 'decision' && outs(f, n.id).some(function (e) { return !e.label || !e.label.trim(); })) issues.push('Every answer on “' + n.title + '” needs a label.');
      if (['action', 'note', 'link'].indexOf(n.type) !== -1 && k !== 1) issues.push('“' + n.title + '” needs exactly one next step.');
      if (n.type === 'link' && !proc(n.linkTo)) issues.push('“' + n.title + '” needs a procedure to link to.');
    });
    var seen = {}, q = [f.start];
    while (q.length) { var id = q.shift(); if (seen[id]) continue; seen[id] = 1; outs(f, id).forEach(function (e) { q.push(e.to); }); }
    f.nodes.forEach(function (n) { if (!seen[n.id]) issues.push('“' + n.title + '” can’t be reached from the first step.'); });
    return issues.filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  /* ───────── routing ───────── */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('?')[0].split('/').filter(Boolean);
    var query = (h.split('?q=')[1] || '');
    return { name: parts[0] || 'library', id: parts[1], tab: parts[2], arg: parts[3], q: decodeURIComponent(query) };
  }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener('hashchange', function () {
    // Moving between tabs of the procedure being followed keeps the run going.
    if (run && route().id !== run.procId) leaveRun();
    render();
  });

  /* ───────── shell ───────── */
  function renderShell() {
    var unread = db.notifications.filter(function (n) { return !n.read; }).length;
    var pending = db.procedures.filter(function (p) { return p.draft && p.draft.status === 'submitted'; }).length;
    $('#roleSelect').value = db.role;
    $('#bellCount').textContent = unread; $('#bellCount').hidden = !unread;
    $('#navApprovals').hidden = !can('approve');
    $('#approvalCount').textContent = pending; $('#approvalCount').hidden = !pending;
    $('#resetData').hidden = !can('admin');

    var folders = {};
    db.procedures.forEach(function (p) { (folders[p.folder] = folders[p.folder] || []).push(p); });
    var r = route(), html = '';
    Object.keys(folders).sort().forEach(function (f) {
      html += '<p class="side-folder">' + esc(f) + '</p>';
      folders[f].forEach(function (p) {
        html += '<a class="side-proc' + (r.id === p.id ? ' is-active' : '') + '" href="#/p/' + p.id + '/run">' + esc(p.title) +
          (p.draft ? '<span class="dot-draft" title="Has a draft"></span>' : '') + '</a>';
      });
    });
    $('#sideProcs').innerHTML = html;
    document.querySelectorAll('.side-nav a').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#/' + r.name);
    });
  }

  function render() {
    var r = route(), main = $('#main');
    renderShell();
    closeDrawer();
    var view = {
      library: viewLibrary, search: viewSearch, p: viewProcedure, approvals: viewApprovals,
      review: viewReview, inbox: viewInbox, insights: viewInsights, audit: viewAudit
    }[r.name] || viewLibrary;
    main.innerHTML = view(r);
    afterRender(r);
    save();
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* ───────── library + search ───────── */
  function viewLibrary() {
    var folders = {};
    db.procedures.forEach(function (p) { (folders[p.folder] = folders[p.folder] || []).push(p); });
    var recent = db.audit.slice(0, 5);
    return '<header class="page-head"><div><p class="eyebrow">Library</p><h1>Procedures</h1></div>' +
      (can('edit') ? '<button class="btn btn-primary" data-act="new-proc">New procedure</button>' : '') + '</header>' +
      Object.keys(folders).sort().map(function (f) {
        return '<section class="folder"><h2 class="folder-title">' + esc(f) + '<span>' + folders[f].length + '</span></h2><div class="cards">' +
          folders[f].map(function (p) {
            var v = live(p);
            return '<a class="card" href="#/p/' + p.id + '/run"><span class="card-title">' + esc(p.title) + '</span>' +
              '<span class="card-sum">' + esc(p.summary) + '</span>' +
              '<span class="card-meta"><span>v' + v.v + '</span><span>' + v.nodes.length + ' steps</span><span>Owner: ' + esc(p.owner) + '</span>' +
              (p.draft ? '<span class="pill pill-amber">' + (p.draft.status === 'submitted' ? 'Awaiting approval' : 'Draft') + '</span>' : '') + '</span></a>';
          }).join('') + '</div></section>';
      }).join('') +
      '<section class="folder"><h2 class="folder-title">Recent changes</h2><ul class="feed">' + recent.map(feedItem).join('') + '</ul>' +
      '<a class="text-link" href="#/audit">See the full audit log →</a></section>';
  }

  function viewSearch(r) {
    var q = r.q.trim().toLowerCase(), res = [];
    if (q) {
      db.procedures.forEach(function (p) {
        var v = live(p);
        if ((p.title + ' ' + p.summary + ' ' + p.folder).toLowerCase().indexOf(q) !== -1) res.push({ p: p, n: null });
        v.nodes.forEach(function (n) {
          if ((n.title + ' ' + (n.body || '') + ' ' + (n.exception || '') + ' ' + (n.inputs || []).join(' ')).toLowerCase().indexOf(q) !== -1) res.push({ p: p, n: n });
        });
      });
    }
    return '<header class="page-head"><div><p class="eyebrow">Search</p><h1>' + (q ? 'Results for “' + esc(r.q) + '”' : 'Search') + '</h1></div></header>' +
      (!q ? '<p class="muted">Type in the search box to find procedures and individual steps.</p>' :
        !res.length ? '<p class="muted">No procedures or steps match “' + esc(r.q) + '”. Try a shorter word.</p>' :
          '<ul class="results">' + res.map(function (x) {
            return x.n
              ? '<li><a href="#/p/' + x.p.id + '/run/' + x.n.id + '"><span class="r-type">Step · ' + TYPE[x.n.type].label + '</span><b>' + hl(x.n.title, q) + '</b><span class="muted">in ' + esc(x.p.title) + ' · opens at this step</span></a></li>'
              : '<li><a href="#/p/' + x.p.id + '/run"><span class="r-type">Procedure</span><b>' + hl(x.p.title, q) + '</b><span class="muted">' + esc(x.p.summary) + '</span></a></li>';
          }).join('') + '</ul>');
  }
  function hl(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  /* ───────── procedure page ───────── */
  function viewProcedure(r) {
    var p = proc(r.id);
    if (!p) return '<p class="muted">This procedure no longer exists. <a class="text-link" href="#/library">Back to the library</a></p>';
    var v = live(p), tab = r.tab || 'run';
    if (!v.v && tab !== 'edit') {
      return '<header class="page-head"><div><p class="eyebrow">' + esc(p.folder) + '</p><h1>' + esc(p.draft ? p.draft.title : p.title) + '</h1></div></header>' +
        '<div class="empty"><h2>Not published yet</h2><p>This procedure exists only as a draft. Once an approver publishes it, people can follow it here.</p>' +
        (can('edit') ? '<a class="btn btn-primary" href="#/p/' + p.id + '/edit">Open the draft</a>' : '') + '</div>';
    }
    var tabs = [['run', 'Follow'], ['map', 'Process map'], ['edit', can('edit') ? 'Edit' : null], ['history', 'History'], ['insights', 'Insights']]
      .filter(function (t) { return t[1]; });
    var head = '<header class="page-head proc-head"><div><p class="eyebrow">' + esc(p.folder) + '</p><h1>' + esc(p.title) + '</h1>' +
      '<p class="proc-meta"><span>' + (v.v ? 'v' + v.v + ' · Approved' : 'Not published') + '</span><span>Owner: ' + esc(p.owner) + '</span><span>Updated ' + ago(v.at) + '</span>' +
      (p.draft ? '<span class="pill pill-amber">' + (p.draft.status === 'submitted' ? 'Change awaiting approval' : p.draft.status === 'rejected' ? 'Draft returned with comments' : 'Draft in progress') + '</span>' : '') + '</p></div></header>' +
      '<nav class="tabs" aria-label="Procedure views">' + tabs.map(function (t) {
        return '<a href="#/p/' + p.id + '/' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
      }).join('') + '</nav>';
    var body = { run: tabRun, map: tabMap, edit: tabEdit, history: tabHistory, insights: tabInsights }[tab] || tabRun;
    return head + body(p, r);
  }

  /* — follow (guided run) — */
  var run = null;   // { procId, path:[{id, choice}], stack:[{procId, path}], checks:{}, fromStep }
  function startRun(p, atNode) {
    var v = live(p);
    run = { procId: p.id, path: [{ id: atNode && nodeOf(v, atNode) ? atNode : v.start, choice: null }], stack: [], checks: {}, fromStep: !!atNode, startedAt: atNode || null, ended: false };
    usage(p.id).views++;
    if (db.used.indexOf(p.id) === -1) db.used.push(p.id);
    countStep();
  }
  function countStep() {
    var c = cur(); var u = usage(run.procId); u.steps[c.id] = (u.steps[c.id] || 0) + 1;
  }
  function cur() { return run.path[run.path.length - 1]; }
  function leaveRun() {
    // A run that stops before an end step counts as a drop-off at that step.
    if (run && !run.ended) { var u = usage(run.procId), id = cur().id; u.exits[id] = (u.exits[id] || 0) + 1; save(); }
    run = null;
  }

  function tabRun(p, r) {
    if (!run || run.procId !== p.id || (r.arg && r.arg !== run.startedAt)) { leaveRun(); startRun(p, r.arg); }
    var rp = proc(run.procId), v = live(rp), c = cur(), n = nodeOf(v, c.id);
    if (!n) { startRun(rp); c = cur(); n = nodeOf(v, c.id); }
    var options = outs(v, n.id).map(function (e) { return { e: e, n: nodeOf(v, e.to) }; }).filter(function (o) { return o.n; });
    var crumbs = run.path.map(function (s, i) {
      var sn = nodeOf(v, s.id), last = i === run.path.length - 1;
      return '<li>' + (s.choice ? '<span class="crumb-choice">' + esc(s.choice) + '</span>' : '') +
        (last ? '<b aria-current="step">' + esc(sn.title) + '</b>' : '<button type="button" data-act="jump" data-i="' + i + '">' + esc(sn.title) + '</button>') + '</li>';
    }).join('');
    var stackNote = run.stack.length ? '<p class="sub-flow">Inside <b>' + esc(rp.title) + '</b>, linked from <b>' + esc(proc(run.stack[run.stack.length - 1].procId).title) + '</b></p>' : '';
    var ready = !n.inputs || n.inputs.every(function (_, i) { return run.checks[n.id + ':' + i]; });
    var ICON = {
      book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
      link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>'
    };
    // One card per step: badge, the question or action, what it links to, then the answers.
    var chips = '';
    if (n.source) chips += '<span class="q-chip">' + ICON.link + esc(n.source) + '</span>';
    if (n.type === 'link' && proc(n.linkTo)) chips += '<span class="q-chip">' + ICON.link + esc(proc(n.linkTo).title) + '</span>';
    var answers = '', primary = '';
    if (n.type === 'end') {
      answers = run.stack.length
        ? '<div class="q-done"><span aria-hidden="true">✓</span><p>This linked procedure is complete.</p></div>'
        : '<div class="q-done"><span aria-hidden="true">✓</span><p>You’ve reached the end of this procedure.</p></div>';
      primary = run.stack.length
        ? '<button class="q-next" data-act="return">Return to ' + esc(proc(run.stack[run.stack.length - 1].procId).title) + ' →</button>'
        : '<button class="q-next" data-act="restart">Start again</button>';
    } else if (!options.length) {
      answers = '<p class="warn">This step isn’t connected to a next step. Flag it below so the owner can fix it.</p>';
    } else if (n.type === 'decision') {
      answers = '<p class="q-sel">Select one option</p><div class="q-opts">' + options.map(function (o, i) {
        return '<button class="q-opt choice" data-act="choose" data-i="' + i + '">' + esc(o.e.label || o.n.title) + '</button>';
      }).join('') + '</div>';
    } else {
      if (n.inputs && n.inputs.length) {
        answers = '<p class="q-sel">Complete before you continue</p><div class="q-opts">' + n.inputs.map(function (t, i) {
          var k = n.id + ':' + i;
          return '<label class="q-check' + (run.checks[k] ? ' is-on' : '') + '"><input type="checkbox" data-check="' + esc(k) + '"' + (run.checks[k] ? ' checked' : '') + '><span>' + esc(t) + '</span></label>';
        }).join('') + '</div>';
      }
      if (n.type === 'link') {
        var target = proc(n.linkTo);
        primary = (target ? '<button class="q-next" data-act="enter-link"' + (ready ? '' : ' disabled') + '>Open “' + esc(target.title) + '” →</button>' : '') +
          '<button class="q-btn" data-act="choose" data-i="0">Skip, already done</button>';
      } else {
        primary = '<button class="q-next" data-act="choose" data-i="0"' + (ready ? '' : ' disabled') + ' title="Next: ' + esc(options[0].n.title) + '">' + (n.type === 'note' ? 'Continue' : 'Next') + ' →</button>';
      }
    }
    var total = live(rp).nodes.length;
    return stackNote + (run.fromStep && run.path.length === 1 ? '<p class="sub-flow">Opened at this step from search. <button class="text-btn" data-act="restart">Start from the beginning</button></p>' : '') +
      '<div class="q-wrap">' +
      '<div class="q-progress"><span>Step ' + run.path.length + (n.type === 'end' ? ' · complete' : '') + '</span><i><b style="width:' + Math.min(100, Math.round((n.type === 'end' ? 1 : run.path.length / Math.max(total - 1, 1)) * 100)) + '%"></b></i></div>' +
      '<article class="qcard qcard-' + n.type + '" data-step="' + esc(n.id) + '">' +
      '<span class="q-badge q-' + n.type + '">' + TYPE[n.type].label + '</span>' +
      '<h2 class="q-title" tabindex="-1" id="stepTitle">' + esc(n.title) + '</h2>' +
      (n.body ? '<p class="q-body">' + esc(n.body) + '</p>' : '') +
      (chips ? '<div class="q-chips">' + chips + '</div>' : '') +
      (n.exception ? '<p class="exception"><b>Exception:</b> ' + esc(n.exception) + '</p>' : '') + answers +
      '<div class="q-foot">' + (run.path.length > 1 ? '<button class="q-btn" data-act="back">← Back</button>' : '') +
      '<button class="q-btn q-flow" data-act="flow-open">' + ICON.book + 'SOP</button>' + primary + '</div>' +
      '</article>' +
      '<details class="q-path"' + (run.path.length > 1 ? '' : ' hidden') + '><summary>Your path so far · ' + (run.path.length - 1) + ' answered</summary><ol class="crumbs" aria-label="Steps taken">' + crumbs + '</ol></details>' +
      '<div class="row run-controls"><button class="text-btn" data-act="restart"' + (run.path.length > 1 || run.stack.length ? '' : ' disabled') + '>↺ Restart</button>' +
      '<button class="text-btn flag-btn" data-act="flag-open">Flag this step</button>' +
      (n.source ? '<span class="muted small">' + esc(rp.title) + ' · v' + v.v + '</span>' : '') + '</div>' +
      '<form class="flag-form" id="flagForm" hidden><label for="flagText">What’s wrong with this step?</label><textarea id="flagText" rows="3" required placeholder="For example: the approval limit has changed"></textarea>' +
      '<div class="row"><button class="btn btn-primary" type="submit">Send to the owner</button><button class="btn btn-quiet" type="button" data-act="flag-cancel">Cancel</button></div></form>' +
      '</div>';
  }

  /* — SOP: the full map over the run, with the path so far highlighted — */
  var flowReturn = null;
  function openFlow() {
    if (!run) return;
    var rp = proc(run.procId), v = live(rp), mark = {};
    run.path.forEach(function (s) { mark[s.id] = 'done'; }); mark[cur().id] = 'current';
    closeFlow(true);
    flowReturn = document.activeElement;
    var el = document.createElement('div');
    el.className = 'flow-sheet'; el.id = 'flowSheet';
    el.innerHTML = '<div class="flow-card" role="dialog" aria-modal="true" aria-labelledby="flowTitle">' +
      '<header class="flow-head"><div><p class="eyebrow">SOP</p><h2 id="flowTitle">' + esc(rp.title) + '</h2>' +
      '<p class="muted small">Your path is highlighted. Select any step to continue from there.</p></div>' +
      '<button class="btn btn-quiet" data-act="flow-close">Close</button></header>' + mapSvg(v, { clickable: true, mark: mark }) +
      '<p class="legend"><span class="lg lg-cur">You are here</span><span class="lg lg-done">Done</span><span class="lg lg-action">Action</span><span class="lg lg-decision">Decision</span><span class="lg lg-end">End</span></p></div>';
    el.addEventListener('click', function (e) { if (e.target === el) closeFlow(); });
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-open'); });
    var c = el.querySelector('.is-current'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center', inline: 'center' });
    el.querySelector('[data-act="flow-close"]').focus();
  }
  function closeFlow(silent) {
    var el = $('#flowSheet'); if (!el) return;
    el.remove();
    if (!silent && flowReturn && flowReturn.focus) flowReturn.focus();
    flowReturn = null;
  }

  /* — process map — */
  function layout(f) {
    var depth = {}, order = [], q = [[f.start, 0]];
    while (q.length) {
      var it = q.shift(); if (depth[it[0]] !== undefined || !nodeOf(f, it[0])) continue;
      depth[it[0]] = it[1]; order.push(it[0]);
      outs(f, it[0]).forEach(function (e) { q.push([e.to, it[1] + 1]); });
    }
    var maxD = Math.max.apply(null, order.map(function (id) { return depth[id]; }).concat([0]));
    f.nodes.forEach(function (n) { if (depth[n.id] === undefined) { depth[n.id] = maxD + 1; order.push(n.id); } });
    var rows = {};
    order.forEach(function (id) { (rows[depth[id]] = rows[depth[id]] || []).push(id); });
    var W = 196, H = 52, GX = 28, GY = 70, widest = Math.max.apply(null, Object.keys(rows).map(function (k) { return rows[k].length; }));
    var width = Math.max(widest * (W + GX) + GX, 260), pos = {};
    Object.keys(rows).forEach(function (d) {
      var row = rows[d], span = row.length * W + (row.length - 1) * GX, x0 = (width - span) / 2;
      row.forEach(function (id, i) { pos[id] = { x: x0 + i * (W + GX), y: 24 + d * (H + GY) }; });
    });
    var depthCount = Object.keys(rows).length;
    return { pos: pos, W: W, H: H, width: width, height: 24 + depthCount * (H + GY) - GY + 24 };
  }
  function mapSvg(f, opts) {
    opts = opts || {};
    var L = layout(f), s = '';
    f.edges.forEach(function (e) {
      var a = L.pos[e.from], b = L.pos[e.to]; if (!a || !b) return;
      var x1 = a.x + L.W / 2, y1 = a.y + L.H, x2 = b.x + L.W / 2, y2 = b.y, back = y2 <= y1;
      var d = back ? 'M' + (a.x + L.W) + ' ' + (a.y + L.H / 2) + ' C' + (a.x + L.W + 60) + ' ' + (a.y + L.H / 2) + ' ' + (b.x + L.W + 60) + ' ' + (b.y + L.H / 2) + ' ' + (b.x + L.W) + ' ' + (b.y + L.H / 2)
        : 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + 34) + ' ' + x2 + ' ' + (y2 - 34) + ' ' + x2 + ' ' + (y2 - 6);
      s += '<path class="m-edge" d="' + d + '" marker-end="url(#arrow)"/>';
      if (e.label) {
        var lx = (x1 + x2) / 2, ly = (y1 + y2) / 2 + 4, short = e.label.length > 26 ? e.label.slice(0, 25) + '…' : e.label;
        s += '<g class="m-lbl"><rect x="' + (lx - short.length * 3.3 - 6) + '" y="' + (ly - 12) + '" width="' + (short.length * 6.6 + 12) + '" height="17" rx="4"/><text x="' + lx + '" y="' + ly + '" text-anchor="middle">' + esc(short) + '</text></g>';
      }
    });
    f.nodes.forEach(function (n) {
      var p = L.pos[n.id], cls = 'm-node m-' + n.type + (n.id === f.start ? ' is-start' : '') + (opts.mark && opts.mark[n.id] ? ' is-' + opts.mark[n.id] : '');
      var title = n.title.length > 28 ? n.title.slice(0, 27) + '…' : n.title;
      s += '<g class="' + cls + '" data-node="' + esc(n.id) + '"' + (opts.clickable ? ' tabindex="0" role="button" aria-label="' + esc(n.title) + '"' : '') + '>' +
        '<rect x="' + p.x + '" y="' + p.y + '" width="' + L.W + '" height="' + L.H + '" rx="' + (n.type === 'end' ? 26 : 10) + '"/>' +
        '<text class="m-kind" x="' + (p.x + 14) + '" y="' + (p.y + 19) + '">' + TYPE[n.type].label.toUpperCase() + '</text>' +
        '<text class="m-title" x="' + (p.x + 14) + '" y="' + (p.y + 38) + '">' + esc(title) + '</text></g>';
    });
    return '<div class="map-scroll"><svg class="map" viewBox="0 0 ' + L.width + ' ' + L.height + '" width="' + L.width + '" role="img" aria-label="Process map">' +
      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="m-arrow"/></marker></defs>' + s + '</svg></div>';
  }
  function tabMap(p) {
    var v = live(p);
    return '<p class="muted">The approved version (v' + v.v + '). Select a step to start following the procedure from there.</p>' + mapSvg(v, { clickable: true }) +
      '<p class="legend"><span class="lg lg-action">Action</span><span class="lg lg-decision">Decision</span><span class="lg lg-note">Note</span><span class="lg lg-link">Linked procedure</span><span class="lg lg-end">End</span></p>';
  }

  /* — editor (drafts) — */
  function tabEdit(p) {
    if (!can('edit')) return '<p class="muted">Switch to the Editor or Admin role to change procedures.</p>';
    if (!p.draft) {
      return '<div class="empty"><h2>Edits are saved as a draft</h2><p>Your changes stay private until an approver publishes them. People keep following v' + live(p).v + ' in the meantime.</p>' +
        '<button class="btn btn-primary" data-act="start-draft">Start a draft</button></div>';
    }
    var d = p.draft, issues = validate(d), others = db.procedures.filter(function (x) { return x.id !== p.id; });
    var stepOpts = function (sel, exclude) {
      return d.nodes.filter(function (n) { return n.id !== exclude; }).map(function (n) {
        return '<option value="' + esc(n.id) + '"' + (n.id === sel ? ' selected' : '') + '>' + esc(n.title || 'Untitled step') + '</option>';
      }).join('');
    };
    var status = d.status === 'submitted' ? '<p class="banner banner-amber">Submitted for approval ' + ago(d.submittedAt) + '. You can still change it; approvers see the latest draft.</p>'
      : d.status === 'rejected' ? '<p class="banner banner-red"><b>Returned by ' + esc(d.reviewBy) + ':</b> ' + esc(d.reviewComment) + '</p>' : '';
    return status +
      '<div class="edit-bar"><label>Procedure title <input id="fTitle" data-field="title" value="' + esc(d.title) + '"></label>' +
      '<label>Folder <input id="fFolder" data-field="folder" value="' + esc(d.folder) + '" list="folderList"></label>' +
      '<datalist id="folderList">' + uniqueFolders().map(function (f) { return '<option value="' + esc(f) + '">'; }).join('') + '</datalist>' +
      '<label>Owner <input id="fOwner" data-field="owner" value="' + esc(d.owner) + '"></label>' +
      '<label class="wide">Summary <input id="fSummary" data-field="summary" value="' + esc(d.summary) + '"></label>' +
      '<label>First step <select id="fStart" data-field="start">' + stepOpts(d.start) + '</select></label></div>' +
      '<div class="edit-grid"><div class="edit-steps">' + d.nodes.map(function (n, i) {
        var es = outs(d, n.id);
        var conn = n.type === 'end' ? '<p class="muted small">End steps finish the path.</p>'
          : n.type === 'decision'
            ? '<div class="answers"><p class="mini-label">Answers</p>' + es.map(function (e) {
              var ei = d.edges.indexOf(e);
              return '<div class="answer-row"><input aria-label="Answer label" placeholder="Answer, e.g. Yes" data-edge-label="' + ei + '" value="' + esc(e.label || '') + '">' +
                '<select aria-label="Goes to" data-edge-to="' + ei + '">' + stepOpts(e.to, n.id) + '</select>' +
                '<button class="icon-btn" title="Remove answer" aria-label="Remove answer" data-act="del-edge" data-ei="' + ei + '">×</button></div>';
            }).join('') + '<button class="text-btn" data-act="add-answer" data-id="' + esc(n.id) + '">+ Add an answer</button></div>'
            : '<label>Next step <select data-next="' + esc(n.id) + '"><option value="">Choose…</option>' + stepOpts(es[0] && es[0].to, n.id) + '</select></label>';
        return '<details class="ed-step ed-' + n.type + '"' + (i === edState.open || n.id === edState.openId ? ' open' : '') + ' data-id="' + esc(n.id) + '"><summary><span class="ed-kind">' + TYPE[n.type].label + '</span><span class="ed-title">' + esc(n.title || 'Untitled step') + '</span>' + (n.id === d.start ? '<span class="pill">First</span>' : '') + '</summary>' +
          '<div class="ed-body"><div class="ed-row"><label class="grow">Title <input data-node-field="title" data-id="' + esc(n.id) + '" value="' + esc(n.title) + '"></label>' +
          '<label>Type <select data-node-type="' + esc(n.id) + '">' + Object.keys(TYPE).map(function (t) { return '<option value="' + t + '"' + (t === n.type ? ' selected' : '') + '>' + TYPE[t].label + '</option>'; }).join('') + '</select></label></div>' +
          '<label>Instructions <textarea rows="3" data-node-field="body" data-id="' + esc(n.id) + '">' + esc(n.body || '') + '</textarea></label>' +
          (n.type === 'action' || n.type === 'link' ? '<label>Checklist before continuing <span class="muted small">(one per line)</span><textarea rows="2" data-node-field="inputs" data-id="' + esc(n.id) + '">' + esc((n.inputs || []).join('\n')) + '</textarea></label>' : '') +
          (n.type !== 'end' ? '<label>Exception <span class="muted small">(optional)</span><input data-node-field="exception" data-id="' + esc(n.id) + '" value="' + esc(n.exception || '') + '"></label>' : '') +
          '<label>Source reference <span class="muted small">(optional)</span><input data-node-field="source" data-id="' + esc(n.id) + '" value="' + esc(n.source || '') + '" placeholder="e.g. Policy §2.1"></label>' +
          (n.type === 'link' ? '<label>Linked procedure <select data-node-field="linkTo" data-id="' + esc(n.id) + '"><option value="">Choose…</option>' + others.map(function (o) { return '<option value="' + o.id + '"' + (o.id === n.linkTo ? ' selected' : '') + '>' + esc(o.title) + '</option>'; }).join('') + '</select></label>' : '') +
          conn + '<button class="text-btn danger" data-act="del-node" data-id="' + esc(n.id) + '">Delete step</button></div></details>';
      }).join('') + '<button class="btn btn-quiet" data-act="add-node">+ Add a step</button></div>' +
      '<aside class="edit-side"><div class="panel"><p class="mini-label">Checks</p>' + (issues.length ? '<ul class="issues">' + issues.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="ok">No problems found. The flow can be followed from start to end.</p>') + '</div>' +
      '<div class="panel"><p class="mini-label">Draft preview</p><div id="draftMap">' + mapSvg(d) + '</div></div>' +
      '<div class="panel"><label>Note for the approver<textarea id="draftNote" rows="2" placeholder="What changed and why">' + esc(d.note || '') + '</textarea></label>' +
      '<div class="row"><button class="btn btn-primary" data-act="submit-draft"' + (issues.length ? ' disabled title="Fix the problems first"' : '') + '>' + (d.status === 'submitted' ? 'Resubmit for approval' : 'Submit for approval') + '</button>' +
      '<button class="btn btn-quiet" data-act="discard-draft">Discard draft</button></div><p class="muted small">Saved automatically in this browser.</p></div></aside></div>';
  }
  var edState = { open: -1, openId: null };
  function uniqueFolders() { return db.procedures.map(function (p) { return p.folder; }).filter(function (v, i, a) { return a.indexOf(v) === i; }); }

  /* — history — */
  function tabHistory(p) {
    return '<ol class="versions">' + p.versions.filter(function (v) { return v.v > 0; }).reverse().map(function (v, i) {
      return '<li><div><b>v' + v.v + '</b>' + (i === 0 ? ' <span class="pill pill-green">Live</span>' : '') + '<p class="muted small">' + esc(v.note || '') + '</p><p class="muted small">Published ' + ago(v.at) + ' by ' + esc(v.by) + '</p></div>' +
        '<div class="row"><button class="btn btn-quiet" data-act="view-version" data-v="' + v.v + '">View map</button>' +
        (i > 0 && can('edit') ? '<button class="btn btn-quiet" data-act="restore" data-v="' + v.v + '">Restore as draft</button>' : '') + '</div></li>';
    }).join('') + '</ol><div id="versionView"></div>' +
      (can('edit') ? '' : '<p class="muted small">Editors can restore an older version. Restoring creates a draft that still needs approval.</p>');
  }

  /* — insights for one procedure — */
  function tabInsights(p) {
    var u = usage(p.id), v = live(p), fb = db.feedback.filter(function (f) { return f.proc === p.id; });
    var rate = u.views ? Math.round(u.completions / u.views * 100) : 0;
    var exits = Object.keys(u.exits).sort(function (a, b) { return u.exits[b] - u.exits[a]; }).slice(0, 5);
    var maxExit = exits.length ? u.exits[exits[0]] : 1;
    return '<div class="stats"><div><b>' + u.views + '</b><span>Times followed</span></div><div><b>' + u.completions + '</b><span>Completed</span></div><div><b>' + rate + '%</b><span>Completion rate</span></div><div><b>' + u.restarts + '</b><span>Restarts</span></div></div>' +
      '<section class="panel"><h2 class="h3">Where people stop</h2>' + (exits.length ? '<ul class="bars">' + exits.map(function (id) {
        var n = nodeOf(v, id); return '<li><span>' + esc(n ? n.title : 'Removed step') + '</span><span class="bar"><i style="width:' + (u.exits[id] / maxExit * 100) + '%"></i></span><b>' + u.exits[id] + '</b></li>';
      }).join('') + '</ul>' : '<p class="muted">No drop-offs recorded yet. Follow the procedure and leave part way through to see this fill in.</p>') + '</section>' +
      '<section class="panel"><h2 class="h3">Step feedback</h2>' + (fb.length ? '<ul class="feed">' + fb.map(function (f) {
        var n = nodeOf(v, f.node);
        return '<li><b>' + esc(n ? n.title : 'Removed step') + '</b><p>' + esc(f.text) + '</p><span class="muted small">' + esc(f.who) + ' · ' + ago(f.at) + '</span></li>';
      }).join('') + '</ul>' : '<p class="muted">No steps have been flagged.</p>') + '</section>' +
      '<p class="muted small">Usage is counted in this browser only.</p>';
  }

  /* ───────── approvals ───────── */
  function viewApprovals() {
    if (!can('approve')) return '<p class="muted">Switch to the Approver or Admin role to review changes.</p>';
    var list = db.procedures.filter(function (p) { return p.draft && p.draft.status === 'submitted'; });
    return '<header class="page-head"><div><p class="eyebrow">Approvals</p><h1>Changes waiting for review</h1></div></header>' +
      (list.length ? '<ul class="results">' + list.map(function (p) {
        return '<li><a href="#/review/' + p.id + '"><span class="r-type">' + esc(p.folder) + '</span><b>' + esc(p.draft.title) + '</b><span class="muted">Submitted ' + ago(p.draft.submittedAt) + ' by ' + esc(p.draft.by) + (p.draft.note ? ' · “' + esc(p.draft.note) + '”' : '') + '</span></a></li>';
      }).join('') + '</ul>' : '<div class="empty"><h2>Nothing to review</h2><p>When an editor submits a draft it appears here. To try it, switch to Editor, edit a procedure and submit it.</p></div>');
  }

  function diff(a, b) {
    var rows = [], fields = [['title', 'Title'], ['type', 'Type'], ['body', 'Instructions'], ['inputs', 'Checklist'], ['exception', 'Exception'], ['source', 'Source'], ['linkTo', 'Linked procedure']];
    var val = function (f, n, k) {
      if (k === 'inputs') return (n.inputs || []).join(', ');
      if (k === 'type') return TYPE[n.type].label;
      if (k === 'linkTo') return n.linkTo ? (proc(n.linkTo) || {}).title || n.linkTo : '';
      return n[k] || '';
    };
    // Compare arrows by target id, but describe them with step titles.
    var nextKey = function (f, id) { return outs(f, id).map(function (e) { return (e.label || '') + '>' + e.to; }).join('|'); };
    var nexts = function (f, id) { return outs(f, id).map(function (e) { var t = nodeOf(f, e.to); return (e.label ? e.label + ' → ' : '→ ') + (t ? t.title : '?'); }).join('; '); };
    b.nodes.forEach(function (n) {
      var o = nodeOf(a, n.id);
      if (!o) { rows.push({ kind: 'added', title: n.title, old: '', now: n.body || '' }); return; }
      var ch = [];
      fields.forEach(function (fd) { var x = val(a, o, fd[0]), y = val(b, n, fd[0]); if (x !== y) ch.push({ f: fd[1], old: x, now: y }); });
      if (nextKey(a, n.id) !== nextKey(b, n.id)) ch.push({ f: 'Next steps', old: nexts(a, n.id), now: nexts(b, n.id) });
      if (ch.length) rows.push({ kind: 'changed', title: n.title, changes: ch });
    });
    a.nodes.forEach(function (o) { if (!nodeOf(b, o.id)) rows.push({ kind: 'removed', title: o.title, old: o.body || '', now: '' }); });
    ['title', 'folder', 'owner', 'summary'].forEach(function (k) { if ((a[k] || '') !== (b[k] || '')) rows.unshift({ kind: 'changed', title: 'Procedure ' + k, changes: [{ f: k, old: a[k] || '', now: b[k] || '' }] }); });
    if (a.start !== b.start) rows.unshift({ kind: 'changed', title: 'First step', changes: [{ f: 'First step', old: (nodeOf(a, a.start) || {}).title, now: (nodeOf(b, b.start) || {}).title }] });
    return rows;
  }

  function viewReview(r) {
    var p = proc(r.id);
    if (!can('approve')) return '<p class="muted">Switch to the Approver or Admin role to review changes.</p>';
    if (!p || !p.draft || p.draft.status !== 'submitted') return '<p class="muted">There is no change waiting for review here. <a class="text-link" href="#/approvals">Back to approvals</a></p>';
    var v = live(p), d = p.draft, base = Object.assign({ title: p.title, folder: p.folder, owner: p.owner, summary: p.summary }, v), rows = diff(base, d);
    return '<header class="page-head"><div><p class="eyebrow">Review change</p><h1>' + esc(d.title) + '</h1><p class="proc-meta"><span>v' + v.v + ' → v' + (v.v + 1) + '</span><span>By ' + esc(d.by) + '</span><span>Submitted ' + ago(d.submittedAt) + '</span></p></div></header>' +
      (d.note ? '<p class="banner">Editor’s note: ' + esc(d.note) + '</p>' : '') +
      '<h2 class="h3">What changed</h2>' + (rows.length ? '<ul class="changes">' + rows.map(function (x) {
        if (x.kind !== 'changed') return '<li class="ch ch-' + x.kind + '"><span class="pill">' + (x.kind === 'added' ? 'Added' : 'Removed') + '</span><b>' + esc(x.title) + '</b>' + (x.old || x.now ? '<p class="muted small">' + esc(x.old || x.now) + '</p>' : '') + '</li>';
        return '<li class="ch ch-changed"><span class="pill">Changed</span><b>' + esc(x.title) + '</b>' + x.changes.map(function (c) {
          return '<div class="cmp"><span class="cmp-f">' + esc(c.f) + '</span><del>' + esc(c.old || '(empty)') + '</del><ins>' + esc(c.now || '(empty)') + '</ins></div>';
        }).join('') + '</li>';
      }).join('') + '</ul>' : '<p class="muted">The draft is identical to the live version.</p>') +
      '<div class="compare"><div><p class="mini-label">Live · v' + v.v + '</p>' + mapSvg(v) + '</div><div><p class="mini-label">Proposed · v' + (v.v + 1) + '</p>' + mapSvg(d) + '</div></div>' +
      '<form class="panel decide" id="decideForm"><label for="reviewComment">Comment</label><textarea id="reviewComment" rows="3" placeholder="Required when you reject. Shown to the editor."></textarea>' +
      '<div class="row"><button class="btn btn-primary" type="submit" data-decision="approve">Approve and publish v' + (v.v + 1) + '</button><button class="btn btn-danger" type="submit" data-decision="reject">Reject</button></div></form>';
  }

  /* ───────── inbox, insights, audit ───────── */
  function viewInbox() {
    var list = db.notifications;
    return '<header class="page-head"><div><p class="eyebrow">Notifications</p><h1>Updates to procedures you use</h1></div>' + (list.some(function (n) { return !n.read; }) ? '<button class="btn btn-quiet" data-act="read-all">Mark all as read</button>' : '') + '</header>' +
      (list.length ? '<ul class="feed">' + list.map(function (n) {
        return '<li class="' + (n.read ? '' : 'is-unread') + '">' + (n.proc && proc(n.proc) ? '<a href="#/p/' + n.proc + '/history" data-act="read" data-id="' + n.id + '">' + esc(n.text) + '</a>' : '<span>' + esc(n.text) + '</span>') + '<span class="muted small">' + ago(n.at) + '</span></li>';
      }).join('') + '</ul>' : '<div class="empty"><h2>No notifications yet</h2><p>When a procedure you have followed is updated, you’ll be told here. Owners also hear about flagged steps.</p></div>');
  }
  function viewInsights() {
    var rows = db.procedures.map(function (p) { var u = usage(p.id); return { p: p, u: u, open: db.feedback.filter(function (f) { return f.proc === p.id; }).length }; })
      .sort(function (a, b) { return b.u.views - a.u.views; });
    var max = Math.max(1, rows[0] ? rows[0].u.views : 1);
    return '<header class="page-head"><div><p class="eyebrow">Insights</p><h1>How procedures are used</h1></div></header>' +
      '<div class="table-scroll"><table class="table"><thead><tr><th>Procedure</th><th>Followed</th><th>Completed</th><th>Restarts</th><th>Most common stop</th><th>Flags</th></tr></thead><tbody>' + rows.map(function (x) {
        var top = Object.keys(x.u.exits).sort(function (a, b) { return x.u.exits[b] - x.u.exits[a]; })[0], n = top && nodeOf(live(x.p), top);
        return '<tr><td><a href="#/p/' + x.p.id + '/insights">' + esc(x.p.title) + '</a></td><td><span class="mini-bar"><i style="width:' + (x.u.views / max * 100) + '%"></i></span>' + x.u.views + '</td><td>' + x.u.completions + '</td><td>' + x.u.restarts + '</td><td>' + (n ? esc(n.title) : '—') + '</td><td>' + x.open + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<section class="folder"><h2 class="folder-title">Recent changes</h2><ul class="feed">' + db.audit.slice(0, 8).map(feedItem).join('') + '</ul></section>' +
      '<p class="muted small">Counts come from this browser only, so they start at zero for each visitor.</p>';
  }
  function viewAudit() {
    return '<header class="page-head"><div><p class="eyebrow">Audit log</p><h1>Every change, newest first</h1></div></header><ul class="feed">' + db.audit.map(feedItem).join('') + '</ul>';
  }
  function feedItem(a) {
    return '<li><span>' + esc(a.what) + '</span><span class="muted small">' + esc(a.who) + ' · ' + ago(a.at) + '</span></li>';
  }

  /* ───────── after render ───────── */
  function afterRender(r) {
    var t = document.getElementById('stepTitle');
    if (t && runMoved) { t.focus(); runMoved = false; }
    var s = $('#searchInput'); if (r.name === 'search' && document.activeElement !== s) s.value = r.q;
  }
  var runMoved = false;

  /* ───────── actions ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (b) handle(b.dataset.act, b, e);
    var g = e.target.closest('.map [data-node]');
    if (g && g.hasAttribute('tabindex')) openAt(g.dataset.node);
  });
  document.addEventListener('keydown', function (e) {
    var g = e.target.closest && e.target.closest('.map [data-node][tabindex]');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openAt(g.dataset.node); }
    if (e.key === 'Escape') { if ($('#flowSheet')) closeFlow(); else closeDrawer(); }
  });
  function openAt(nodeId) { var r = route(); closeFlow(true); leaveRun(); go('#/p/' + r.id + '/run/' + nodeId); }

  function handle(act, b, e) {
    var r = route(), p = r.id && proc(r.id);
    switch (act) {
      case 'choose': {
        var v = live(proc(run.procId)), options = outs(v, cur().id).filter(function (x) { return nodeOf(v, x.to); }), o = options[+b.dataset.i];
        if (!o) return;
        run.path.push({ id: o.to, choice: o.label || null }); countStep();
        if (nodeOf(v, o.to).type === 'end' && !run.stack.length) { usage(run.procId).completions++; run.ended = true; }
        moved(); break;
      }
      case 'back': run.path.pop(); run.ended = false; moved(); break;
      case 'jump': run.path = run.path.slice(0, +b.dataset.i + 1); run.ended = false; moved(); break;
      case 'restart': {
        if (!run.ended) { var u = usage(run.procId), id = cur().id; u.exits[id] = (u.exits[id] || 0) + 1; }
        usage(run.procId).restarts++;
        var root = run.stack.length ? run.stack[0].procId : run.procId;
        run = { procId: root, path: [{ id: live(proc(root)).start, choice: null }], stack: [], checks: {}, fromStep: false, ended: false };
        countStep(); moved(); if (root !== r.id) go('#/p/' + root + '/run'); break;
      }
      case 'enter-link': {
        var n = nodeOf(live(proc(run.procId)), cur().id), t = proc(n.linkTo);
        run.stack.push({ procId: run.procId, path: run.path });
        run.procId = t.id; run.path = [{ id: live(t).start, choice: null }];
        usage(t.id).views++; if (db.used.indexOf(t.id) === -1) db.used.push(t.id); countStep();
        runMoved = true; location.hash = '#/p/' + t.id + '/run'; break;
      }
      case 'return': {
        usage(run.procId).completions++;
        var back = run.stack.pop(); run.procId = back.procId; run.path = back.path;
        var pv = live(proc(back.procId)), o0 = outs(pv, cur().id)[0];
        if (o0) { run.path.push({ id: o0.to, choice: null }); countStep(); }
        runMoved = true; location.hash = '#/p/' + back.procId + '/run'; break;
      }
      case 'flow-open': openFlow(); break;
      case 'flow-close': closeFlow(); break;
      case 'flag-open': $('#flagForm').hidden = false; $('#flagText').focus(); break;
      case 'flag-cancel': $('#flagForm').hidden = true; break;

      case 'new-proc': {
        var id = uid('p'), first = { id: uid(), type: 'action', title: 'First step', body: '' }, end = { id: uid(), type: 'end', title: 'Done', body: '' };
        var np = { id: id, title: 'Untitled procedure', folder: 'General', owner: ROLES[db.role].label, summary: '', versions: [], draft: null };
        np.draft = { title: np.title, folder: np.folder, owner: np.owner, summary: '', start: first.id, nodes: [first, end], edges: [{ from: first.id, to: end.id }], status: 'draft', by: who(), at: now() };
        np.versions.push({ v: 0, start: first.id, nodes: [], edges: [], at: now(), by: who(), note: 'Not yet published' });
        db.procedures.push(np); log('Created a new procedure draft', id); edState.open = 0; go('#/p/' + id + '/edit'); break;
      }
      case 'start-draft': {
        var lv = live(p);
        p.draft = { title: p.title, folder: p.folder, owner: p.owner, summary: p.summary, start: lv.start, nodes: clone(lv.nodes), edges: clone(lv.edges), status: 'draft', by: who(), at: now() };
        log('Started a draft of “' + p.title + '”', p.id); render(); break;
      }
      case 'add-node': {
        var nn = { id: uid(), type: 'action', title: 'New step', body: '' };
        p.draft.nodes.push(nn); edState.openId = nn.id; edState.open = -1; saveDraft(p); render(); break;
      }
      case 'del-node': {
        var did = b.dataset.id, d = p.draft;
        d.nodes = d.nodes.filter(function (n) { return n.id !== did; });
        d.edges = d.edges.filter(function (x) { return x.from !== did && x.to !== did; });
        if (d.start === did && d.nodes[0]) d.start = d.nodes[0].id;
        saveDraft(p); render(); break;
      }
      case 'add-answer': {
        var dd = p.draft, from = b.dataset.id, target = dd.nodes.filter(function (n) { return n.id !== from; })[0];
        if (target) dd.edges.push({ from: from, to: target.id, label: '' });
        edState.openId = from; saveDraft(p); render(); break;
      }
      case 'del-edge': p.draft.edges.splice(+b.dataset.ei, 1); edState.openId = b.closest('details').dataset.id; saveDraft(p); render(); break;
      case 'submit-draft': {
        if (validate(p.draft).length) return;
        p.draft.status = 'submitted'; p.draft.submittedAt = now(); p.draft.by = who(); p.draft.note = $('#draftNote').value.trim();
        log('Submitted “' + p.draft.title + '” for approval', p.id); toast('Submitted for approval. Switch to the Approver role to review it.'); render(); break;
      }
      case 'discard-draft': {
        if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Click again to discard'; return; }
        if (!p.versions.some(function (v) { return v.v > 0; })) { db.procedures = db.procedures.filter(function (x) { return x !== p; }); log('Discarded a new procedure draft'); go('#/library'); return; }
        p.draft = null; log('Discarded the draft of “' + p.title + '”', p.id); render(); break;
      }
      case 'view-version': {
        var vv = p.versions.filter(function (x) { return x.v === +b.dataset.v; })[0];
        $('#versionView').innerHTML = '<div class="panel"><p class="mini-label">v' + vv.v + ' · ' + esc(vv.note || '') + '</p>' + mapSvg(vv) + '</div>';
        $('#versionView').scrollIntoView({ block: 'nearest' }); break;
      }
      case 'restore': {
        var rv = p.versions.filter(function (x) { return x.v === +b.dataset.v; })[0];
        p.draft = { title: p.title, folder: p.folder, owner: p.owner, summary: p.summary, start: rv.start, nodes: clone(rv.nodes), edges: clone(rv.edges), status: 'draft', by: who(), at: now(), note: 'Restore v' + rv.v };
        log('Restored v' + rv.v + ' of “' + p.title + '” as a draft', p.id); toast('v' + rv.v + ' is now a draft. Submit it for approval to publish.'); go('#/p/' + p.id + '/edit'); break;
      }
      case 'read': { var m = db.notifications.filter(function (x) { return x.id === b.dataset.id; })[0]; if (m) m.read = true; save(); break; }
      case 'read-all': db.notifications.forEach(function (x) { x.read = true; }); render(); break;
      case 'drawer': toggleDrawer(); break;
      case 'reset': {
        if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Click again to reset'; return; }
        db = seed(); run = null; save(); toast('Sample data restored.'); go('#/library'); break;
      }
    }
  }
  function moved() { runMoved = true; render(); }
  function saveDraft(p) { p.draft.at = now(); save(); }

  /* editor inputs: update the draft without re-rendering, so typing keeps focus */
  document.addEventListener('input', function (e) {
    var r = route(), p = r.id && proc(r.id), t = e.target;
    if (!p || !p.draft || r.tab !== 'edit') return;
    var d = p.draft;
    if (t.id === 'draftNote') { d.note = t.value; saveDraft(p); return; }
    if (t.dataset.field && t.tagName === 'INPUT') d[t.dataset.field] = t.value;
    else if (t.dataset.nodeField && t.tagName !== 'SELECT') {
      var n = nodeOf(d, t.dataset.id);
      n[t.dataset.nodeField] = t.dataset.nodeField === 'inputs' ? t.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : t.value;
      if (t.dataset.nodeField === 'title') t.closest('details').querySelector('.ed-title').textContent = t.value || 'Untitled step';
    } else if (t.dataset.edgeLabel !== undefined) d.edges[+t.dataset.edgeLabel].label = t.value;
    else return;
    saveDraft(p); refreshDraftSide(p);
  });
  document.addEventListener('change', function (e) {
    var t = e.target, r = route(), p = r.id && proc(r.id);
    if (t.dataset.check !== undefined && run) {
      run.checks[t.dataset.check] = t.checked;
      var row = t.closest('.q-check'); if (row) row.classList.toggle('is-on', t.checked);
      var btn = document.querySelector('.qcard [data-act="choose"].q-next, .qcard [data-act="enter-link"]');
      var n = nodeOf(live(proc(run.procId)), cur().id);
      if (btn) btn.disabled = !(n.inputs || []).every(function (_, i) { return run.checks[n.id + ':' + i]; });
      return;
    }
    if (!p || !p.draft || r.tab !== 'edit') return;
    var d = p.draft, keepOpen = t.closest('details') && t.closest('details').dataset.id;
    if (t.id === 'fStart') d.start = t.value;
    else if (t.dataset.nodeType) {
      var n2 = nodeOf(d, t.dataset.nodeType), was = n2.type; n2.type = t.value;
      var es = outs(d, n2.id);
      if (t.value === 'end') d.edges = d.edges.filter(function (x) { return x.from !== n2.id; });
      else if (t.value !== 'decision' && es.length > 1) { var keep = es[0]; d.edges = d.edges.filter(function (x) { return x.from !== n2.id || x === keep; }); keep.label = ''; }
      else if (t.value === 'decision' && was !== 'decision') es.forEach(function (x) { x.label = x.label || 'Yes'; });
    } else if (t.dataset.next) {
      d.edges = d.edges.filter(function (x) { return x.from !== t.dataset.next; });
      if (t.value) d.edges.push({ from: t.dataset.next, to: t.value });
    } else if (t.dataset.edgeTo !== undefined) d.edges[+t.dataset.edgeTo].to = t.value;
    else if (t.dataset.nodeField === 'linkTo') nodeOf(d, t.dataset.id).linkTo = t.value;
    else return;
    edState.openId = keepOpen; edState.open = -1;
    saveDraft(p); render();
  });
  function refreshDraftSide(p) {
    var m = $('#draftMap'); if (m) m.innerHTML = mapSvg(p.draft);
  }

  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, r = route(), p = r.id && proc(r.id);
    if (f.id === 'flagForm') {
      var text = $('#flagText').value.trim(); if (!text) return;
      db.feedback.unshift({ proc: run.procId, node: cur().id, text: text, who: who(), at: now() });
      var fp = proc(run.procId);
      notify('A step in “' + fp.title + '” was flagged: “' + text + '”', fp.id);
      log('Flagged a step in “' + fp.title + '”', fp.id);
      save(); f.hidden = true; toast('Thanks. The owner has been told about this step.'); renderShell(); return;
    }
    if (f.id === 'decideForm') {
      var decision = e.submitter && e.submitter.dataset.decision, comment = $('#reviewComment').value.trim();
      if (decision === 'reject') {
        if (!comment) { $('#reviewComment').focus(); toast('Add a comment so the editor knows what to change.'); return; }
        p.draft.status = 'rejected'; p.draft.reviewComment = comment; p.draft.reviewBy = who();
        log('Rejected the change to “' + p.draft.title + '”: ' + comment, p.id); toast('Returned to the editor.'); go('#/approvals'); return;
      }
      var d = p.draft, nv = (live(p).v || 0) + 1;
      p.versions.push({ v: nv, start: d.start, nodes: d.nodes, edges: d.edges, at: now(), by: who(), note: d.note || comment || 'Updated' });
      p.title = d.title; p.folder = d.folder; p.owner = d.owner; p.summary = d.summary; p.draft = null;
      log('Approved and published v' + nv + ' of “' + p.title + '”' + (comment ? ': ' + comment : ''), p.id);
      if (db.used.indexOf(p.id) !== -1 || nv > 1) notify('“' + p.title + '” was updated to v' + nv + (d.note ? ': ' + d.note : ''), p.id);
      toast('Published v' + nv + '. People following it now see the new version.'); go('#/p/' + p.id + '/history');
    }
  });

  /* ───────── chrome: role, search, drawer ───────── */
  $('#roleSelect').addEventListener('change', function (e) {
    db.role = e.target.value; log('Switched role to ' + ROLES[db.role].label); save();
    var r = route(); if ((r.name === 'review' || r.name === 'approvals') && !can('approve')) go('#/library'); else render();
  });
  $('#searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); var q = $('#searchInput').value.trim(); go('#/search?q=' + encodeURIComponent(q));
  });
  function toggleDrawer() { document.body.classList.toggle('drawer-open'); $('#drawerBtn').setAttribute('aria-expanded', String(document.body.classList.contains('drawer-open'))); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); var b = $('#drawerBtn'); if (b) b.setAttribute('aria-expanded', 'false'); }

  window.addEventListener('pagehide', function () { leaveRun(); save(); });
  render();
})();
