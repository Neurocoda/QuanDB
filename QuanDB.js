/*
 * QuanDB.js
 * @Author: Neurocoda
 * @Description: Quantumult X Data Manager
 *
 * [API Endpoints]
 * GET  /db/ui              -> Dashboard
 * GET  /db/api/list        -> Get All Keys (Metadata only)
 * POST /db/api/get         -> Get Single Key Value (Real-time)
 * POST /db/api/watch       -> Watch Key
 * POST /db/api/unwatch     -> Unwatch Key
 * POST /db/api/update      -> Write Data
 * POST /db/api/delete      -> Delete Data
 *
 * [Quantumult X Config]
 * [http_backend]
 * QuanDB.js, tag=QX_DB_Manager, path=^/db/, enabled=true
 */

const WATCH_LIST_KEY = "QX_DB_WATCHLIST";
const DEFAULT_KEY = "TF_ID";
const $req = typeof $request !== "undefined" ? $request : null;

!(async () => {
    if (!$req) { $done({}); return; }

    try {
        const method = $req.method;
        const path = $req.path;

        if (method === "GET" && path.indexOf("/ui") !== -1) {
            $done({
                status: "HTTP/1.1 200 OK",
                headers: { "Content-Type": "text/html; charset=utf-8" },
                body: getDashboardHTML()
            });
            return;
        }

        if (method === "GET" && path.indexOf("/api/list") !== -1) {
            ensureWatchListIncludes(WATCH_LIST_KEY);
            const watchList = getWatchList();
            const result = watchList.map(key => ({
                key: key,
                value: $prefs.valueForKey(key) || "", 
                exists: $prefs.valueForKey(key) !== undefined && $prefs.valueForKey(key) !== null
            }));
            responseJSON(200, { data: result });
            return;
        }

        if (method === "POST" && path.indexOf("/api/get") !== -1) {
            const json = safeParse($req.body);
            if (!json.key) throw new Error("Key required");
            const val = $prefs.valueForKey(json.key);
            responseJSON(200, { 
                key: json.key, 
                value: val || "", 
                exists: val !== undefined && val !== null 
            });
            return;
        }

        if (method === "POST" && path.indexOf("/api/watch") !== -1) {
            const json = safeParse($req.body);
            if (json.key) addToWatchList(json.key);
            responseJSON(200, { message: "Watched" });
            return;
        }

        if (method === "POST" && path.indexOf("/api/unwatch") !== -1) {
            const json = safeParse($req.body);
            let list = getWatchList().filter(k => k !== json.key);
            saveWatchList(list);
            responseJSON(200, { message: "Unwatched" });
            return;
        }

        if (method === "POST" && path.indexOf("/api/update") !== -1) {
            const json = safeParse($req.body);
            if (!json.key) throw new Error("Key required");
            $prefs.setValueForKey(json.value, json.key);
            addToWatchList(json.key);
            responseJSON(200, { message: "Saved" });
            return;
        }

        if (method === "POST" && path.indexOf("/api/delete") !== -1) {
            const json = safeParse($req.body);
            $prefs.removeValueForKey(json.key);
            responseJSON(200, { message: "Deleted" });
            return;
        }

        responseJSON(404, { error: "Not Found" });

    } catch (err) {
        responseJSON(500, { error: err.message });
    }
})();

// --- Helpers ---

function responseJSON(code, data) {
    $done({
        status: code === 200 ? "HTTP/1.1 200 OK" : "HTTP/1.1 500 Error",
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(data)
    });
}

function safeParse(str) { try { return JSON.parse(str); } catch (e) { return {}; } }

function getWatchList() {
    const str = $prefs.valueForKey(WATCH_LIST_KEY);
    if (!str) return [WATCH_LIST_KEY, DEFAULT_KEY]; 
    try { return JSON.parse(str); } catch (e) { return [WATCH_LIST_KEY]; }
}

function ensureWatchListIncludes(key) {
    let list = getWatchList();
    if (!list.includes(key)) {
        list.unshift(key);
        saveWatchList(list);
    }
}

function addToWatchList(key) {
    let list = getWatchList();
    if (!list.includes(key)) {
        list.push(key);
        saveWatchList(list);
    }
}

function saveWatchList(list) {
    return $prefs.setValueForKey(JSON.stringify(list), WATCH_LIST_KEY);
}

// --- UI Template ---
function getDashboardHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>QX DATA MANAGER</title>

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">

    <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/Neurocoda/QuanDB/refs/heads/main/favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/Neurocoda/QuanDB/refs/heads/main/favicon/favicon.svg" />
    <link rel="shortcut icon" href="https://raw.githubusercontent.com/Neurocoda/QuanDB/refs/heads/main/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="https://raw.githubusercontent.com/Neurocoda/QuanDB/refs/heads/main/favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="QuanDB" />
    <link rel="manifest" href="https://raw.githubusercontent.com/Neurocoda/QuanDB/refs/heads/main/favicon/site.webmanifest" />

    <style>
        :root { 
            --bg: #fff; --text: #000; --border: #ccc; 
            --panel-bg: #f8f8f8; --code-bg: #fdfdfd;
            --btn-bg: #000; --btn-text: #fff;
            --danger: #d00; --accent: #007aff;
            --sh-key: #0000aa; --sh-str: #008800; --sh-num: #aa5500; --sh-bool: #aa0000;
        }
        @media (prefers-color-scheme: dark) {
            :root { 
                --bg: #000; --text: #fff; --border: #333; 
                --panel-bg: #111; --code-bg: #0a0a0a;
                --btn-bg: #333; --btn-text: #fff;
                --danger: #ff453a; --accent: #0a84ff;
                --sh-key: #569cd6; --sh-str: #ce9178; --sh-num: #b5cea8; --sh-bool: #569cd6; 
            }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
        
        body { 
            font-family: -apple-system, Menlo, monospace; 
            background: var(--bg); color: var(--text); 
            margin: 0; 
            /* [iOS] 左右安全距离，防止横屏贴边 */
            padding: 15px;
            padding-left: env(safe-area-inset-left, 15px);
            padding-right: env(safe-area-inset-right, 15px);
            font-size: 14px;
        }
        
        header { 
            text-align: center; border-bottom: 2px solid var(--text); 
            padding-bottom: 15px; margin-bottom: 20px; position: relative;
            /* [iOS] 顶部安全距离，防止内容被刘海遮挡 */
            padding-top: env(safe-area-inset-top, 20px);
        }

        h1 { margin: 0; font-size: 18px; letter-spacing: 2px; font-weight: 900; }
        
        /* 调整刷新按钮位置，适配刘海屏 padding */
        .reload { position: absolute; right: 0; top: env(safe-area-inset-top, 0); font-size: 20px; cursor: pointer; padding: 0 10px; }

        details.panel { border: 1px solid var(--border); margin-bottom: 30px; }
        summary.panel-head { 
            padding: 12px; font-weight: bold; cursor: pointer; list-style: none;
            display: flex; justify-content: center; background: var(--panel-bg);
            font-size: 12px; letter-spacing: 1px;
        }
        summary.panel-head::-webkit-details-marker { display: none; }
        summary.panel-head:after { content: ' +'; }
        details[open] summary.panel-head:after { content: ' -'; }
        
        .panel-body { padding: 15px; border-top: 1px solid var(--border); background: var(--bg); }
        
        input, textarea { 
            width: 100%; background: var(--bg); color: var(--text);
            border: 1px solid var(--border); padding: 10px; 
            font-family: inherit; font-size: 16px; margin-bottom: 10px; border-radius: 0;
        }
        
        .btn-group { display: flex; gap: 10px; }
        button { 
            flex: 1; padding: 12px; font-size: 13px; font-weight: bold; font-family: inherit;
            background: var(--btn-bg); color: var(--btn-text); border: none; cursor: pointer;
            text-transform: uppercase;
        }
        button:active { opacity: 0.6; }
        button.outline { background: transparent; border: 1px solid var(--text); color: var(--text); }
        button.danger { background: var(--danger); color: white; border: none; }

        details.list-item { border: 1px solid var(--border); margin-bottom: -1px; background: var(--bg); }
        summary.list-head { 
            padding: 15px; cursor: pointer; list-style: none; display: flex; 
            justify-content: space-between; align-items: center;
            background: var(--bg); position: relative;
        }
        summary.list-head::-webkit-details-marker { display: none; }
        summary.list-head:after { content: '+'; font-weight: bold; font-size: 16px; margin-left: 10px; }
        details[open] summary.list-head:after { content: '-'; }
        
        .key-name { font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
        .badges { display: flex; gap: 5px; font-size: 10px; margin-right: auto; margin-left: 10px; }
        .badge { padding: 2px 4px; border: 1px solid var(--text); border-radius: 2px; }
        .badge.null { color: var(--danger); border-color: var(--danger); }
        .badge.json { color: var(--accent); border-color: var(--accent); }
        
        .list-body { padding: 0; border-top: 1px solid var(--border); background: var(--code-bg); }

        .editor-container { padding: 15px; position: relative; min-height: 80px; }
        .editor { 
            width: 100%; min-height: 50px; 
            font-family: Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.5;
            white-space: pre-wrap; word-break: break-all;
            color: var(--text); outline: none;
        }
        
        .loading-overlay { 
            position: absolute; top:0; left:0; right:0; bottom:0; 
            background: var(--bg); opacity: 0.8; 
            display: flex; align-items: center; justify-content: center; z-index: 10;
        }

        .json-placeholder { text-align: center; padding: 20px; }
        
        .sh-key { color: var(--sh-key); font-weight: bold; }
        .sh-str { color: var(--sh-str); }
        .sh-num { color: var(--sh-num); }
        .sh-bool { color: var(--sh-bool); font-style: italic; }
        .sh-null { color: var(--danger); font-weight: bold; }

        .actions { display: flex; gap: 0; border-top: 1px solid var(--border); }
        .actions button { padding: 15px; font-size: 12px; border-right: 1px solid var(--border); background: var(--bg); color: var(--text); }
        .actions button:last-child { border-right: none; }
        .actions button.save-btn { background: var(--text); color: var(--bg); }
        .actions button.danger { background: var(--danger); color: white; }

    </style>
</head>
<body>
    <header>
        <h1>QX DATA MANAGER</h1>
        <div class="reload" onclick="load()">↻</div>
    </header>

    <details class="panel">
        <summary class="panel-head">ADD NEW KEY</summary>
        <div class="panel-body">
            <input type="text" id="inKey" placeholder="KEY NAME">
            <textarea id="inVal" placeholder="VALUE (Optional)" style="height:80px"></textarea>
            <div class="btn-group">
                <button class="outline" onclick="saveKey()">SAVE & WATCH</button>
                <button onclick="watchKey()">WATCH ONLY</button>
            </div>
        </div>
    </details>

    <div id="list">Loading...</div>

    <script>
        const API = "/db/api";

        async function load() {
            try {
                const listEl = document.getElementById('list');
                listEl.style.opacity = "0.5";
                const res = await fetch(API + "/list");
                const json = await res.json();
                render(json.data);
                listEl.style.opacity = "1";
            } catch(e) { document.getElementById('list').innerHTML = "<div style='text-align:center'>Connection Error</div>"; }
        }

        function render(data) {
            const listEl = document.getElementById('list');
            if(!data || !data.length) return listEl.innerHTML = "<div style='text-align:center'>No Data</div>";
            
            listEl.innerHTML = data.map(item => {
                let val = item.value || "";
                let isLikelyJson = (val.trim().startsWith('{') || val.trim().startsWith('['));
                let escapedVal = escapeHtml(val);

                return \`
                <details class="list-item" id="details-\${item.key}">
                    <summary class="list-head" onclick="handleToggle(event, '\${item.key}')">
                        <span class="key-name">\${item.key}</span>
                        <div class="badges">
                            \${isLikelyJson ? '<span class="badge json">JSON</span>' : ''}
                            \${!item.exists ? '<span class="badge null">NULL</span>' : ''}
                        </div>
                    </summary>
                    
                    <div class="list-body">
                        <div class="editor-container" id="container-\${item.key}">
                            <div class="loading-overlay" id="loader-\${item.key}" style="display:none">Updating...</div>
                            
                            <textarea id="raw-\${item.key}" style="display:none">\${escapedVal}</textarea>
                            
                            <div id="wrapper-\${item.key}">
                                \${isLikelyJson ? 
                                    \`<div id="placeholder-\${item.key}" class="json-placeholder">
                                        <button style="background:var(--accent);color:#fff;border:none;padding:8px 16px;border-radius:4px" onclick="lazyRender('\${item.key}')">Format JSON</button>
                                        <div style="font-size:10px;margin-top:10px;opacity:0.5">Click to parse</div>
                                    </div>
                                    <div id="editor-\${item.key}" class="editor" contenteditable="plaintext-only" style="display:none"></div>\`
                                : 
                                    \`<div id="editor-\${item.key}" class="editor" contenteditable="plaintext-only">\${escapedVal}</div>\`
                                }
                            </div>
                        </div>
                        <div class="actions">
                            <button class="save-btn" onclick="update('\${item.key}')">UPDATE</button>
                            <button class="danger" onclick="del('\${item.key}')">DEL</button>
                            <button onclick="unwatch('\${item.key}')">HIDE</button>
                        </div>
                    </div>
                </details>
            \`}).join('');
        }

        async function handleToggle(e, key) {
            e.preventDefault(); 
            
            const target = document.getElementById('details-' + key);
            const isOpen = target.hasAttribute('open');

            document.querySelectorAll('details.list-item').forEach(el => el.removeAttribute('open'));

            if (!isOpen) {
                target.setAttribute('open', '');
                await refreshSingleItem(key);
            }
        }

        async function refreshSingleItem(key) {
            const loader = document.getElementById('loader-' + key);
            const wrapper = document.getElementById('wrapper-' + key);
            if(loader) loader.style.display = "flex";

            try {
                const res = await fetch(API + "/get", { method: "POST", body: JSON.stringify({key}) });
                const json = await res.json();
                const newVal = json.value || "";

                const rawEl = document.getElementById('raw-' + key);
                if(rawEl) rawEl.value = newVal;

                const isLikelyJson = (newVal.trim().startsWith('{') || newVal.trim().startsWith('['));
                const escapedVal = escapeHtml(newVal);

                if (isLikelyJson) {
                    wrapper.innerHTML = \`
                        <div id="placeholder-\${key}" class="json-placeholder">
                            <button style="background:var(--accent);color:#fff;border:none;padding:8px 16px;border-radius:4px" onclick="lazyRender('\${key}')">Format JSON</button>
                            <div style="font-size:10px;margin-top:10px;opacity:0.5">Click to parse</div>
                        </div>
                        <div id="editor-\${key}" class="editor" contenteditable="plaintext-only" style="display:none"></div>
                    \`;
                } else {
                    wrapper.innerHTML = \`<div id="editor-\${key}" class="editor" contenteditable="plaintext-only">\${escapedVal}</div>\`;
                }

            } catch(e) {
                console.error(e);
            } finally {
                if(loader) loader.style.display = "none";
            }
        }

        function lazyRender(key) {
            const rawEl = document.getElementById('raw-' + key);
            const editorEl = document.getElementById('editor-' + key);
            const placeholderEl = document.getElementById('placeholder-' + key);
            
            if (!rawEl || !editorEl) return;
            
            let val = rawEl.value;
            let formattedHtml = "";
            
            try {
                const parsed = JSON.parse(val);
                const pretty = JSON.stringify(parsed, null, 2);
                formattedHtml = syntaxHighlight(pretty);
            } catch (e) {
                formattedHtml = escapeHtml(val) + " <br><span style='color:var(--danger);font-size:10px'>[Invalid JSON]</span>";
            }
            
            editorEl.innerHTML = formattedHtml;
            editorEl.style.display = "block";
            if (placeholderEl) placeholderEl.style.display = "none";
        }

        async function update(key) {
            const editor = document.getElementById('editor-'+key);
            const rawStore = document.getElementById('raw-'+key);
            let val = "";
            
            if (editor && editor.style.display !== 'none') {
                 val = editor.innerText;
                 try { val = JSON.stringify(JSON.parse(val)); } catch(e) {}
            } else if (rawStore) {
                 val = rawStore.value;
            }

            if(!confirm("Update ["+key+"]?")) return;
            await fetch(API + "/update", { method:"POST", body:JSON.stringify({key, value:val}) });
            await refreshSingleItem(key);
        }

        async function watchKey() {
            const key = document.getElementById('inKey').value.trim();
            if(!key) return alert("Key Required");
            await fetch(API + "/watch", { method:"POST", body:JSON.stringify({key}) });
            document.getElementById('inKey').value = "";
            load();
        }

        async function saveKey() {
            const key = document.getElementById('inKey').value.trim();
            const val = document.getElementById('inVal').value;
            if(!key) return alert("Key Required");
            await fetch(API + "/update", { method:"POST", body:JSON.stringify({key, value:val}) });
            document.getElementById('inKey').value = "";
            document.getElementById('inVal').value = "";
            load();
        }

        async function del(key) {
            if(!confirm("Delete ["+key+"]?")) return;
            await fetch(API + "/delete", { method:"POST", body:JSON.stringify({key}) });
            load();
        }

        async function unwatch(key) {
            await fetch(API + "/unwatch", { method:"POST", body:JSON.stringify({key}) });
            load();
        }

        function escapeHtml(text) {
            if (!text) return "";
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'sh-num';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) { cls = 'sh-key'; } else { cls = 'sh-str'; }
                } else if (/true|false/.test(match)) { cls = 'sh-bool'; } else if (/null/.test(match)) { cls = 'sh-null'; }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
        
        load();
    </script>
</body>
</html>`;
}
