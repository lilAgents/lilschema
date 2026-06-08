// lilSchema — build clean JSON-LD from a form, live, fully client-side.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  type: 'localbusiness',
  d: {
    localbusiness: {
      name: '', url: '', telephone: '', image: '', priceRange: '',
      streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '', addressCountry: '',
    },
    organization: {
      name: '', url: '', logo: '', telephone: '', email: '', contactType: 'customer service',
      sameAs: [''],
    },
    faq: { items: [{ q: '', a: '' }] },
    article: {
      headline: '', url: '', image: '', author: '', publisher: '', publisherLogo: '',
      datePublished: '', dateModified: '', description: '',
    },
  },
};

const FIELDS = {
  localbusiness: [
    { k: 'name', label: 'Business name', ph: 'Acme Coffee Co.' },
    { k: 'url', label: 'Website URL', ph: 'https://acme.coffee' },
    { k: 'telephone', label: 'Phone', ph: '+1-555-123-4567' },
    { k: 'image', label: 'Image URL', ph: 'https://acme.coffee/photo.jpg' },
    { k: 'priceRange', label: 'Price range', ph: '$$' },
    { k: 'streetAddress', label: 'Street address', ph: '123 Bean St' },
    { k: 'addressLocality', label: 'City', ph: 'San Jose' },
    { k: 'addressRegion', label: 'State / region', ph: 'CA' },
    { k: 'postalCode', label: 'Postal code', ph: '95113' },
    { k: 'addressCountry', label: 'Country code', ph: 'US' },
  ],
  organization: [
    { k: 'name', label: 'Organization name', ph: 'Acme Coffee Co.' },
    { k: 'url', label: 'Website URL', ph: 'https://acme.coffee' },
    { k: 'logo', label: 'Logo URL', ph: 'https://acme.coffee/logo.png' },
    { k: 'telephone', label: 'Phone', ph: '+1-555-123-4567' },
    { k: 'email', label: 'Email', kind: 'email', ph: 'hello@acme.coffee' },
    { k: 'contactType', label: 'Contact type', ph: 'customer service' },
  ],
  article: [
    { k: 'headline', label: 'Headline', ph: 'How to roast coffee at home' },
    { k: 'url', label: 'Page URL', ph: 'https://acme.coffee/blog/roasting' },
    { k: 'image', label: 'Image URL', ph: 'https://acme.coffee/cover.jpg' },
    { k: 'author', label: 'Author name', ph: 'Jane Doe' },
    { k: 'publisher', label: 'Publisher name', ph: 'Acme Coffee Co.' },
    { k: 'publisherLogo', label: 'Publisher logo URL', ph: 'https://acme.coffee/logo.png' },
    { k: 'datePublished', label: 'Date published', kind: 'date' },
    { k: 'dateModified', label: 'Date modified', kind: 'date' },
    { k: 'description', label: 'Description', kind: 'textarea', ph: 'A short summary of the article.' },
  ],
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fieldHTML(f, val) {
  if (f.kind === 'textarea') {
    return `<label class="field"><span class="field__label">${f.label}</span>` +
      `<textarea data-k="${f.k}" rows="3" placeholder="${esc(f.ph || '')}">${esc(val)}</textarea></label>`;
  }
  return `<label class="field"><span class="field__label">${f.label}</span>` +
    `<input type="${f.kind || 'text'}" data-k="${f.k}" value="${esc(val)}" placeholder="${esc(f.ph || '')}"/></label>`;
}

function faqRow(it, i) {
  return `<div class="repeat">
    <div class="repeat__head"><span>Question ${i + 1}</span>` +
    `<button class="icon-btn" type="button" data-rm="faq" data-i="${i}" aria-label="Remove">&times;</button></div>
    <input type="text" data-faq="q" data-i="${i}" value="${esc(it.q)}" placeholder="Question"/>
    <textarea data-faq="a" data-i="${i}" rows="2" placeholder="Answer">${esc(it.a)}</textarea>
  </div>`;
}

function sameRow(u, i) {
  return `<div class="same-row"><input type="text" data-same="${i}" value="${esc(u)}" placeholder="https://twitter.com/acme"/>` +
    `<button class="icon-btn" type="button" data-rm="same" data-i="${i}" aria-label="Remove">&times;</button></div>`;
}

function renderFields() {
  const host = $('#fields');
  const t = state.type;
  if (t === 'faq') {
    host.innerHTML =
      `<p class="hint">Add the questions and answers you want eligible for FAQ rich results.</p>` +
      `<div>${state.d.faq.items.map((it, i) => faqRow(it, i)).join('')}</div>` +
      `<button class="btn btn--ghost" type="button" data-add="faq">+ Add question</button>`;
  } else if (t === 'organization') {
    host.innerHTML =
      FIELDS.organization.map((f) => fieldHTML(f, state.d.organization[f.k])).join('') +
      `<div class="field"><span class="field__label">Social / profile URLs (sameAs)</span>` +
      `<div>${state.d.organization.sameAs.map((u, i) => sameRow(u, i)).join('')}</div>` +
      `<button class="btn btn--ghost" type="button" data-add="same">+ Add profile URL</button></div>`;
  } else {
    host.innerHTML = FIELDS[t].map((f) => fieldHTML(f, state.d[t][f.k])).join('');
  }
  wireFields();
}

function wireFields() {
  $$('#fields [data-k]').forEach((el) =>
    el.addEventListener('input', () => { state.d[state.type][el.dataset.k] = el.value; render(); }));
  $$('#fields [data-faq]').forEach((el) =>
    el.addEventListener('input', () => { state.d.faq.items[+el.dataset.i][el.dataset.faq] = el.value; render(); }));
  $$('#fields [data-same]').forEach((el) =>
    el.addEventListener('input', () => { state.d.organization.sameAs[+el.dataset.same] = el.value; render(); }));
  $$('#fields [data-add]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.add === 'faq') state.d.faq.items.push({ q: '', a: '' });
      if (b.dataset.add === 'same') state.d.organization.sameAs.push('');
      renderFields(); render();
    }));
  $$('#fields [data-rm]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = +b.dataset.i;
      if (b.dataset.rm === 'faq') {
        state.d.faq.items.splice(i, 1);
        if (!state.d.faq.items.length) state.d.faq.items.push({ q: '', a: '' });
      }
      if (b.dataset.rm === 'same') {
        state.d.organization.sameAs.splice(i, 1);
        if (!state.d.organization.sameAs.length) state.d.organization.sameAs.push('');
      }
      renderFields(); render();
    }));
}

// Recursively drop empty strings / arrays / objects so the output stays clean.
function clean(o) {
  if (Array.isArray(o)) {
    const a = o.map(clean).filter((v) => v !== undefined);
    return a.length ? a : undefined;
  }
  if (o && typeof o === 'object') {
    const e = {};
    for (const [k, v] of Object.entries(o)) {
      const c = clean(v);
      if (c !== undefined) e[k] = c;
    }
    // keep an object only if it has more than just its @type
    const keys = Object.keys(e).filter((k) => k !== '@type');
    return keys.length ? e : undefined;
  }
  if (typeof o === 'string') {
    const t = o.trim();
    return t ? t : undefined;
  }
  return o;
}

function build() {
  const d = state.d;
  if (state.type === 'localbusiness') {
    const b = d.localbusiness;
    return clean({
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      name: b.name, image: b.image, url: b.url, telephone: b.telephone, priceRange: b.priceRange,
      address: {
        '@type': 'PostalAddress', streetAddress: b.streetAddress, addressLocality: b.addressLocality,
        addressRegion: b.addressRegion, postalCode: b.postalCode, addressCountry: b.addressCountry,
      },
    });
  }
  if (state.type === 'organization') {
    const o = d.organization;
    return clean({
      '@context': 'https://schema.org', '@type': 'Organization',
      name: o.name, url: o.url, logo: o.logo, sameAs: o.sameAs,
      contactPoint: { '@type': 'ContactPoint', telephone: o.telephone, email: o.email, contactType: o.contactType },
    });
  }
  if (state.type === 'faq') {
    return clean({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: d.faq.items.map((it) => ({
        '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    });
  }
  const a = d.article;
  return clean({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.headline, image: a.image ? [a.image] : undefined,
    datePublished: a.datePublished, dateModified: a.dateModified,
    author: { '@type': 'Person', name: a.author },
    publisher: { '@type': 'Organization', name: a.publisher, logo: { '@type': 'ImageObject', url: a.publisherLogo } },
    description: a.description,
    mainEntityOfPage: a.url ? { '@type': 'WebPage', '@id': a.url } : undefined,
  });
}

const OPEN = '<script type="application/ld+json">';
const CLOSE = '<' + '/script>';
let lastScript = '';

function render() {
  const obj = build() || { '@context': 'https://schema.org' };
  const json = JSON.stringify(obj, null, 2);
  lastScript = OPEN + '\n' + json + '\n' + CLOSE;
  $('#out-code').textContent = lastScript;
}

const MOON_SVG = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
const SUN_SVG = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4l1.4-1.4M18 6l1.4-1.4"/></g></svg>';

function setThemeIcon(btn, theme) {
  // Show the icon for the mode the button switches TO.
  if (theme === 'dark') {
    btn.innerHTML = SUN_SVG;
    btn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    btn.innerHTML = MOON_SVG;
    btn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

function initTheme() {
  const btn = $('#ui-theme-btn');
  // The inline head script already set data-theme from a saved choice or the OS preference.
  const current = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  setThemeIcon(btn, current());
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('lilschema-theme', next); } catch (e) { /* storage may be unavailable; safe to ignore */ }
    setThemeIcon(btn, next);
  });
}

function initCopy() {
  const btn = $('#copy-btn');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lastScript);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = lastScript;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1400);
  });
}

function initTypes() {
  $$('[data-type]').forEach((b) =>
    b.addEventListener('click', () => {
      state.type = b.dataset.type;
      $$('[data-type]').forEach((x) => x.classList.toggle('is-active', x === b));
      renderFields();
      render();
    }));
}

export function initSchema() {
  initTheme();
  initCopy();
  initTypes();
  renderFields();
  render();
}
