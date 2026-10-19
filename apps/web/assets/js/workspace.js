/* Workspace pages. Customer workspaces are not provisioned yet, so the list of
   active workspaces is empty. When tenants exist, resolution must happen on the
   server (see docs/ARCHITECTURE.md); this page only helps people find a URL. */
(function () {
  'use strict';
  var ACTIVE = [];   // provisioned workspace slugs; none yet
  var host = document.getElementById('wsHost');
  if (host) {
    var h = location.hostname;
    host.textContent = /\.askcompass\.in$/.test(h) && !/^(www|app|demo)\./.test(h) ? h : 'Workspace';
  }
  var form = document.getElementById('wsForm');
  if (!form) return;
  var input = document.getElementById('wsSlug'), err = document.getElementById('wsSlug-err'), status = document.getElementById('wsStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var slug = input.value.trim().toLowerCase().replace(/\.askcompass\.in$/, '');
    status.textContent = '';
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug) || ['www', 'app', 'demo'].indexOf(slug) !== -1) {
      err.textContent = 'Use letters, numbers and hyphens, for example your-company.';
      input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'wsSlug-err'); input.focus();
      return;
    }
    err.textContent = ''; input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
    if (ACTIVE.indexOf(slug) !== -1) { location.href = 'https://' + slug + '.askcompass.in/'; return; }
    status.innerHTML = 'There is no active workspace called <b></b> yet. Workspaces open later; you can <a href="/contact?topic=Workspace%20for%20my%20company">request one</a>.';
    status.querySelector('b').textContent = slug + '.askcompass.in';
  });
})();
