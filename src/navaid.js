// NOTE copy paste from navaid + slight customization
// TODO PR? at least cleanly install from GH

import convert from 'regexparam';

history._replaceState = history.replaceState

export default function Navaid(base, on404) {
	let rgx, routes=[], $={};

	const fmt = $.format = function (uri) {
		if (!uri) return uri;
		uri = '/' + uri.replace(/^\/|\/$/g, '');
		return rgx.test(uri) && uri.replace(rgx, '/');
	}

	base = '/' + (base || '').replace(/^\/|\/$/g, '');
	rgx = base == '/' ? /^\/+/ : new RegExp('^\\' + base + '(?=\\/|$)\\/?', 'i');

	$.route = function (uri, replace) {
		if (uri[0] == '/' && !rgx.test(uri)) uri = base + uri;
		history[(replace ? 'replace' : 'push') + 'State'](uri, null, uri);
	}

	$.on = function (pat, fn) {
		(pat = convert(pat)).fn = fn;
		routes.push(pat);
		return $;
	}

	$.run = function (uri, state) {
		let i=0, params={}, arr, obj;
		if (uri = fmt(uri || location.pathname)) {
			uri = uri.match(/[^\?#]*/)[0];
			for (; i < routes.length; i++) {
				if (arr = (obj=routes[i]).pattern.exec(uri)) {
					for (i=0; i < obj.keys.length;) {
						params[obj.keys[i]] = arr[++i] || null;
					}
					obj.fn(params, state); // todo loop?
					return $;
				}
			}
			if (on404) on404(uri);
		}
		return $;
	}

	$.listen = function (el) {
		wrap('push');
		wrap('replace');

		function run(e) {
			$.run(null, e.state);
		}

		function click(e) {
			const x = e.target.closest('a'), y = x && x.getAttribute('href');
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button || e.defaultPrevented) return;
			if (!y || x.target || x.host !== location.host) return;
			if (y[0] != '/' || rgx.test(y)) {
				if (y[0] === '#') return
				e.preventDefault();
				$.route(y);
			}
		}

		if (el) {
			el.addEventListener('click', click);
		} else {
			addEventListener('popstate', run);
			addEventListener('replacestate', run);
			addEventListener('pushstate', run);
			addEventListener('click', click);
		}

		$.unlisten = function () {
			if (el) {
				el.removeEventListener('click', click);
			} else {
				removeEventListener('popstate', run);
				removeEventListener('replacestate', run);
				removeEventListener('pushstate', run);
				removeEventListener('click', click);
			}
		}

		if (el) return $

		return $.run();
	}

	return $;
}

function wrap(type, fn) {
	if (history[type]) return;
	history[type] = type;
	fn = history[type += 'State'];
	history[type] = function (uri, ...args) {
		const ev = new Event(type.toLowerCase());
		ev.uri = uri;
		fn.call(this, { uri, scrollTop: document.body.scrollTop }, ...args);
		return dispatchEvent(ev);
	}
}
