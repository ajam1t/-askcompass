/* Contact form: validates in the browser, then opens the visitor's own email
   app with the enquiry filled in. There is no server; nothing is sent until
   the visitor presses send in their email app. */
(function () {
  'use strict';
  var TO = 'amit01071994@gmail.com';
  var form = document.getElementById('contactForm');
  if (!form) return;
  var status = document.getElementById('formStatus');
  var topic = new URLSearchParams(location.search).get('topic');
  if (topic) {
    var sel = form.topic;
    var match = Array.prototype.some.call(sel.options, function (o) { return o.value === topic; });
    if (!match) sel.value = 'Product walkthrough';
    else sel.value = topic;
    if (!form.message.value) form.message.value = 'I’m interested in Ask Compass for ' + topic.toLowerCase() + '.\n\n';
  }
  var rules = {
    name: function (v) { return v.trim() ? '' : 'Enter your name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address like name@company.com.'; },
    topic: function (v) { return v ? '' : 'Choose what your enquiry is about.'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'Write a short message (at least 10 characters).'; }
  };
  var ids = { name: 'cName', email: 'cEmail', topic: 'cTopic', message: 'cMessage' };
  function check(field) {
    var el = form[field], msg = rules[field](el.value), err = document.getElementById(ids[field] + '-err');
    err.textContent = msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) el.setAttribute('aria-describedby', ids[field] + '-err'); else el.removeAttribute('aria-describedby');
    return !msg;
  }
  Object.keys(rules).forEach(function (f) { form[f].addEventListener('blur', function () { if (form[f].value) check(f); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status'; status.textContent = '';
    if (form.website.value) return;               // honeypot: bots fill hidden fields
    var bad = Object.keys(rules).filter(function (f) { return !check(f); });
    if (bad.length) {
      status.className = 'form-status is-error';
      status.textContent = 'Please fix the highlighted fields.';
      form[bad[0]].focus();
      return;
    }
    var body = form.message.value.trim() + '\n\n—\nName: ' + form.name.value.trim() + '\nEmail: ' + form.email.value.trim() +
      (form.company.value.trim() ? '\nCompany: ' + form.company.value.trim() : '');
    var href = 'mailto:' + TO + '?subject=' + encodeURIComponent('Ask Compass: ' + form.topic.value) + '&body=' + encodeURIComponent(body);
    window.location.href = href;
    status.textContent = 'Your email app should now open with the message ready to send. If nothing happened, email ' + TO + ' directly.';
  });
})();
