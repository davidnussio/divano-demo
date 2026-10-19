// Renders openapi.json (the same spec as openapi.yaml) as an API reference in #api.
(function () {
  var target = document.getElementById('api');
  if (!target) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  // The little Markdown the spec uses: paragraphs, "- " lists, `code`, **bold**, *em*.
  function md(text) {
    if (!text) return '';
    var inline = function (s) {
      return esc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    };
    return text.trim().split(/\n\s*\n/).map(function (block) {
      var out = [], list = null;
      block.split('\n').forEach(function (l) {
        if (/^\s*- /.test(l)) { list = list || []; list.push(l.replace(/^\s*- /, '')); }
        else if (list && /^\s{2,}\S/.test(l)) { list[list.length - 1] += ' ' + l.trim(); }
        else { if (list) { out.push({ list: list }); list = null; } out.push(l.trim()); }
      });
      if (list) out.push({ list: list });
      var html = '', para = [];
      var flush = function () { if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
      out.forEach(function (o) {
        if (typeof o === 'string') para.push(o);
        else { flush(); html += '<ul>' + o.list.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>'; }
      });
      flush();
      return html;
    }).join('');
  }

  fetch('openapi.json').then(function (r) { return r.json(); }).then(render).catch(function () {
    target.innerHTML = '<p class="muted">The reference could not be loaded: read <a href="openapi.yaml">openapi.yaml</a>.</p>';
  });

  function render(spec) {
    var schemas = (spec.components && spec.components.schemas) || {};
    var resolve = function (ref) {
      var parts = ref.replace(/^#\//, '').split('/');
      var node = spec;
      parts.forEach(function (p) { node = node && node[p]; });
      return node;
    };
    var refName = function (ref) { return ref.split('/').pop(); };
    var refLink = function (ref) { var n = refName(ref); return '<a class="ref" href="#schema-' + n + '">' + n + '</a>'; };

    function typeOf(s) {
      if (!s) return '';
      if (s.$ref) return refLink(s.$ref);
      if (s.allOf && s.allOf.length === 1) return typeOf(s.allOf[0]);
      if (s.oneOf) return s.oneOf.map(typeOf).join(' | ');
      if (s.const !== undefined) return '<code>' + esc(JSON.stringify(s.const)) + '</code>';
      if (s.enum) return s.enum.map(function (v) { return '<code>' + esc(JSON.stringify(v)) + '</code>'; }).join(' ');
      if (s.type === 'array') return typeOf(s.items) + '[ ]';
      var t = Array.isArray(s.type) ? s.type.join(' | ') : (s.type || 'object');
      return esc(t) + (s.format ? ' <span class="muted">(' + esc(s.format) + ')</span>' : '');
    }
    function constraints(s) {
      var c = [];
      if (s.allOf && s.allOf.length === 1 && s.allOf[0].$ref) s = Object.assign({}, resolve(s.allOf[0].$ref), s);
      if (s.minimum !== undefined) c.push('min ' + s.minimum);
      if (s.maximum !== undefined) c.push('max ' + s.maximum);
      if (s.minItems !== undefined) c.push('min items ' + s.minItems);
      if (s.maxLength !== undefined) c.push('max length ' + s.maxLength);
      if (s.default !== undefined) c.push('default ' + JSON.stringify(s.default));
      if (s.pattern) c.push('pattern <code>' + esc(s.pattern) + '</code>');
      return c.length ? '<div class="muted small">' + c.join(' · ') + '</div>' : '';
    }
    function propsTable(s) {
      var req = s.required || [];
      var rows = Object.keys(s.properties).map(function (name) {
        var p = s.properties[name];
        var nested = !p.$ref && p.type === 'object' && p.properties ? propsTable(p) :
          (p.type === 'array' && p.items && !p.items.$ref && p.items.properties ? propsTable(p.items) : '');
        return '<tr><td><code>' + esc(name) + '</code>' + (req.indexOf(name) >= 0 ? ' <span class="req">required</span>' : '') +
          '</td><td>' + typeOf(p) + constraints(p) + '</td><td>' + md(p.description) + nested + '</td></tr>';
      }).join('');
      return '<div class="table"><table><thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    }
    function schemaBlock(s) {
      if (!s) return '';
      if (s.$ref) return '<p>' + refLink(s.$ref) + '</p>';
      if (s.oneOf) {
        return '<p class="muted small">One of' + (s.discriminator ? ', by <code>' + esc(s.discriminator.propertyName) + '</code>' : '') + ':</p>' +
          s.oneOf.map(schemaBlock).join('');
      }
      if (s.properties) return propsTable(s);
      return '<p>' + typeOf(s) + '</p>' + constraints(s);
    }

    var ops = [];
    Object.keys(spec.paths).forEach(function (path) {
      var item = spec.paths[path];
      ['get', 'post', 'put', 'patch', 'delete'].forEach(function (m) {
        if (item[m]) ops.push({ path: path, method: m, op: item[m], shared: item.parameters || [] });
      });
    });

    function security(op) {
      var sec = op.security !== undefined ? op.security : spec.security;
      if (!sec || !sec.length) return '<span class="auth none">No authentication</span>';
      return sec.map(function (s) {
        var name = Object.keys(s)[0];
        return name === 'deviceToken' ? '<span class="auth">Bearer device token</span>' : '<span class="auth">X-Pairing-Token</span>';
      }).join(' ');
    }

    var html = '';
    (spec.tags || []).forEach(function (tag) {
      var mine = ops.filter(function (o) { return (o.op.tags || []).indexOf(tag.name) >= 0; });
      if (!mine.length) return;
      html += '<h3 class="api-tag" id="tag-' + tag.name + '">' + esc(tag.name) + '</h3><p class="muted">' + esc(tag.description || '') + '</p>';
      mine.forEach(function (o) {
        var op = o.op;
        var params = o.shared.concat(op.parameters || []).map(function (p) { return p.$ref ? resolve(p.$ref) : p; });
        html += '<details class="op" id="op-' + op.operationId + '"><summary><span class="method ' + o.method + '">' + o.method.toUpperCase() + '</span>' +
          '<code class="path">' + esc(o.path) + '</code><span class="sum">' + esc(op.summary || '') + '</span></summary><div class="op-body">' +
          '<p>' + security(op) + ' <span class="muted small">operationId <code>' + esc(op.operationId) + '</code></span></p>' + md(op.description);
        if (params.length) {
          html += '<h4>Parameters</h4><div class="table"><table><thead><tr><th>Name</th><th>In</th><th>Type</th><th>Description</th></tr></thead><tbody>' +
            params.map(function (p) {
              return '<tr><td><code>' + esc(p.name) + '</code>' + (p.required ? ' <span class="req">required</span>' : '') + '</td><td>' + esc(p.in) +
                '</td><td>' + typeOf(p.schema) + constraints(p.schema || {}) + '</td><td>' + md(p.description || (p.schema && p.schema.$ref && resolve(p.schema.$ref).description) || '') + '</td></tr>';
            }).join('') + '</tbody></table></div>';
        }
        if (op.requestBody) {
          var body = op.requestBody.content['application/json'];
          html += '<h4>Request body <span class="muted small">application/json</span></h4>' + schemaBlock(body && body.schema);
        }
        html += '<h4>Responses</h4><ul class="responses">';
        Object.keys(op.responses).forEach(function (code) {
          var r = op.responses[code];
          if (r.$ref) r = resolve(r.$ref);
          var content = r.content && (r.content['application/json'] || r.content['application/problem+json']);
          var kind = code[0] === '2' ? 'ok' : 'err';
          html += '<li><span class="status ' + kind + '">' + code + '</span> ' + esc(r.description || '') +
            (content && content.schema ? ' → ' + (content.schema.$ref ? refLink(content.schema.$ref) : '') : '') +
            (r.headers ? ' <span class="muted small">headers: ' + Object.keys(r.headers).map(esc).join(', ') + '</span>' : '') + '</li>';
          if (content && content.schema && !content.schema.$ref) html += '<li class="inline-schema">' + schemaBlock(content.schema) + '</li>';
        });
        html += '</ul></div></details>';
      });
    });

    html += '<h3 class="api-tag" id="schemas">Schemas</h3>';
    Object.keys(schemas).forEach(function (name) {
      var s = schemas[name];
      html += '<details class="op schema" id="schema-' + name + '"><summary><span class="method schema">SCHEMA</span><code class="path">' + esc(name) +
        '</code></summary><div class="op-body">' + md(s.description) + schemaBlock(s) + '</div></details>';
    });

    var sec = spec.components.securitySchemes || {};
    html += '<h3 class="api-tag" id="auth">Authentication</h3><div class="table"><table><thead><tr><th>Scheme</th><th>How</th><th>Description</th></tr></thead><tbody>' +
      Object.keys(sec).map(function (k) {
        var s = sec[k];
        var how = s.type === 'http' ? 'Authorization: Bearer …' : s.name + ' header';
        return '<tr><td><code>' + esc(k) + '</code></td><td><code>' + esc(how) + '</code></td><td>' + md(s.description) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    target.innerHTML = html;
    // A link to #schema-X opens that schema.
    function openHash() {
      var el = location.hash && document.getElementById(location.hash.slice(1));
      if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView(); }
    }
    window.addEventListener('hashchange', openHash);
    openHash();
  }
})();
