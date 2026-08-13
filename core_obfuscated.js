
(function(_0x5c84, _0x3e1f) {
    const _0x2b3d = function(_0x4e12) {
        while (--_0x4e12) {
            _0x5c84['push'](_0x5c84['shift']());
        }
    };
    _0x2b3d(++_0x3e1f);
}(['1019685wBqXhX', 'div', 'remove', 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(16px); z-index:2147483647; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Inter\',system-ui,sans-serif; color:#fff;', 'background:rgba(10,10,10,0.95); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 0 30px rgba(0,0,0,0.9); text-align:center; max-width:400px; width:100%;', 'https://i.postimg.cc/G4WTXqWM/lelya.png', 'width:75px; height:75px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); object-fit:cover; margin-bottom:15px;', 'Леля Доярочка', 'margin-top:0; color:#ffffff; font-size:16px; font-weight:800; letter-spacing:3px; margin-bottom:5px;', 'LELYA HACK CLIENT', 'font-size:12px; color:#888; margin-bottom:8px;', 'Твой постоянный HWID:', 'background:rgba(5,5,5,0.9); padding:10px; border:1px dashed rgba(255,255,255,0.2); border-radius:8px; font-family:monospace; font-size:14px; color:#fff; margin-bottom:10px; user-select:text;', 'font-size:11px; color:#aaa; margin-bottom:15px;', 'Discord создателя: ', 'vtmin7', ' Введи ключ активации...', 'width:100%; padding:11px; background:rgba(15,15,15,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:13px; margin-bottom:12px; outline:none; box-sizing:border-box; user-select:text;', 'АКТИВИРОВАТЬ', 'width:100%; padding:11px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:#fff; font-weight:600; cursor:pointer; font-size:13px; transition:0.2s;', 'width:100%; margin-top:8px; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#ccc; cursor:pointer; font-size:12px; font-weight:500;', '🛒 ЗАПРОСИТЬ КЛЮЧ У БОТА', 'click', 'open', 'GET', 'success', 'true', '_0x_auth_div', '_0x_tinp', 'Введи ключ!', 'Ошибка: ', 'Ошибка обработки ответа сервера!', 'Ошибка соединения с сервером активации!', '_0x_root', 'Space', 'keydown', 'keyup', 'blur', 'open', 'close', 'error', 'F2', 'mousemove', 'mousedown', 'mouseup', 'contextmenu', 'KeyF', 'F4', 'Insert'], 0xb3));

const _0x27f2 = function(_0x39a1, _0x2195) {
    _0x39a1 = _0x39a1 - 0x0;
    let _0x4d5f = ['lelya-bot.onrender.com', 'lelya_hwid_auth_status', 'lelya_client_config_v4', 'getItem', 'parse', 'getItem', 'stringify', 'setItem', 'querySelectorAll', 'checked', 'id', 'value', 'value', 'value', 'value', 'getItem', 'setIte', 'GM_getValue', 'HWID-', 'random', 'toString', 'substring', 'toUpperCase', 'GM_setValue', 'addEventListener', 'DOMContentLoaded', 'body', 'load', 'getElementById', 'createElement'];
    return _0x4d5f[_0x39a1];
};

(function(){
    'use strict';

    const BOT_URL = 'https://lelya-bot.onrender.com';
    const STORAGE_KEY = 'lelya_hwid_auth_status';
    const CONFIG_KEY = 'lelya_client_config_v4';

    let savedConfig = {};
    try {
        savedConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    } catch(e) {}

    function saveConfig() {
        const config = {};
        document.querySelectorAll('#_0x_root input[type="checkbox"]').forEach(chk => {
            config[chk.id] = chk.checked;
        });
        const slider = document.getElementById('flood_speed_slider');
        if (slider) config['flood_speed_slider'] = slider.value;
        const colorPicker = document.getElementById('v_color_picker');
        if (colorPicker) config['v_color_picker'] = colorPicker.value;
        const themeSelect = document.getElementById('v_theme_select');
        if (themeSelect) config['v_theme_select'] = themeSelect.value;
        const langSelect = document.getElementById('_0x_lang');
        if (langSelect) config['client_lang'] = window._0x_lang_code || 'ru';
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    let _0x_hwid = GM_getValue('lelya_user_hwid');
    if (!_0x_hwid) {
        _0x_hwid = 'HWID-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        GM_setValue('lelya_user_hwid', _0x_hwid);
    }

    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        window.addEventListener('DOMContentLoaded', _0x_showAuth);
        if (document.body) _0x_showAuth();
        else window.addEventListener('load', _0x_showAuth);
        return;
    } else {
        window.addEventListener('DOMContentLoaded', _0x_init);
        if (document.body) _0x_init();
    }

    function _0x_showAuth() {
        if (document.getElementById('_0x_auth_div')) return;
        const _0x_div = document.createElement('div');
        _0x_div.id = '_0x_auth_div';
        _0x_div.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(16px); z-index:2147483647; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Inter',system-ui,sans-serif; color:#fff;";
        _0x_div.innerHTML = `
            <div style="background:rgba(10,10,10,0.95); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 0 30px rgba(0,0,0,0.9); text-align:center; max-width:400px; width:100%;">
                <img src="https://i.postimg.cc/G4WTXqWM/lelya.png" style="width:75px; height:75px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); object-fit:cover; margin-bottom:15px;" alt="Леля Доярочка"/>
                <h2 style="margin-top:0; color:#ffffff; font-size:16px; font-weight:800; letter-spacing:3px; margin-bottom:5px;">LELYA HACK CLIENT</h2>
                <p style="font-size:12px; color:#888; margin-bottom:8px;">Твой постоянный HWID:</p>
                <div style="background:rgba(5,5,5,0.9); padding:10px; border:1px dashed rgba(255,255,255,0.2); border-radius:8px; font-family:monospace; font-size:14px; color:#fff; margin-bottom:10px; user-select:text;">${_0x_hwid}</div>
                <p style="font-size:11px; color:#aaa; margin-bottom:15px;">Discord создателя: <b style="color:#fff;">vtmin7</b></p>
                <input type="text" id="_0x_tinp" placeholder="Введи ключ активации..." style="width:100%; padding:11px; background:rgba(15,15,15,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:13px; margin-bottom:12px; outline:none; box-sizing:border-box; user-select:text;">
                <button id="_0x_abtn" style="width:100%; padding:11px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:#fff; font-weight:600; cursor:pointer; font-size:13px; transition:0.2s;">АКТИВИРОВАТЬ</button>
                <button id="_0x_botbtn" style="width:100%; margin-top:8px; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#ccc; cursor:pointer; font-size:12px; font-weight:500;">🛒 ЗАПРОСИТЬ КЛЮЧ У БОТА</button>
            </div>
        `;
        document.body.appendChild(_0x_div);

        document.getElementById('_0x_botbtn').addEventListener('click', () => {
            window.open(`${BOT_URL}/start?hwid=${_0x_hwid}`, '_blank');
        });

        document.getElementById('_0x_abtn').addEventListener('click', () => {
            const _0x_val = document.getElementById('_0x_tinp').value.trim();
            if (!_0x_val) { alert('Введи ключ!'); return; }

            GM_xmlhttpRequest({
                method: "GET",
                url: `${BOT_URL}/verify?hwid=${_0x_hwid}&key=${_0x_val}`,
                onload: function(response) {
                    try {
                        let data = JSON.parse(response.responseText);
                        if (data.status === 'success') {
                            localStorage.setItem(STORAGE_KEY, 'true');
                            _0x_div.remove();
                            _0x_init();
                        } else { alert('Ошибка: ' + data.message); }
                    } catch (e) { alert('Ошибка обработки ответа сервера!'); }
                },
                onerror: function() { alert('Ошибка соединения с сервером активации!'); }
            });
        });
    }

    function showBrowserPrompt(titleText, defaultVal, callback) {
        const result = prompt(titleText, defaultVal);
        if (result !== null) {
            callback(result);
        }
    }

    function _0x_init() {
        if (document.getElementById('_0x_root')) return;

        const _0x_arr = ['Space', 'keydown', 'keyup', 'blur', 'open', 'close', 'error', 'F2', 'mousemove', 'mousedown', 'mouseup', 'contextmenu', 'KeyF', 'F4', 'Insert'];
        let _0x_k = _0x_arr[0], _0x_m = 3, _0x_c = 5, _0x_b = 20, _0x_s = !1, _0x_te = 0, _0x_p = performance.now(), _0x_date = Date.now(), _0x_o1 = performance.now, _0x_o2 = Date.now, _0x_o3 = setTimeout, _0x_o4 = setInterval, _0x_o5 = requestAnimationFrame;

        performance.now = function(){let _0x_a = _0x_o1.call(this);if(_0x_s){_0x_te+=(_0x_a-_0x_p)*(_0x_m-1);_0x_p=_0x_a;return _0x_a+_0x_te}_0x_p=_0x_a;return _0x_a};
        Date.now = function(){let _0x_a = _0x_o2.call(this);if(_0x_s){_0x_te+=(_0x_a-_0x_date)*(_0x_m-1);_0x_date=_0x_a;return Math.floor(_0x_a+_0x_te)}_0x_date=_0x_a;return _0x_a};
        setTimeout = function(_0x_a,_0x_b,_0x_c){if(_0x_s&&_0x_b>0)_0x_b=Math.max(0,Math.floor(_0x_b/_0x_m));return _0x_o3.call(this,_0x_a,_0x_b,_0x_c)};
        setInterval = function(_0x_a,_0x_b,_0x_c){if(_0x_s&&_0x_b>0)_0x_b=Math.max(1,Math.floor(_0x_b/_0x_m));return _0x_o4.call(this,_0x_a,_0x_b,_0x_c)};
        requestAnimationFrame = function(_0x_a){if(_0x_s)return _0x_o3.call(this,()=>{_0x_a(performance.now())},0x3E8/(0x3C*_0x_m));return _0x_o5.call(this,_0x_a)};

        let _0x_sa = false;
        let _0x_si = null;
        let _0x_f = function(){window.dispatchEvent(new KeyboardEvent(_0x_arr[1],{key:'e',code:'KeyE',bubbles:!0}));window.dispatchEvent(new KeyboardEvent(_0x_arr[2],{key:'e',code:'KeyE',bubbles:!0}))};
        let _0x_j = function(){for(let _0x_idx=0;_0x_idx<_0x_c;_0x_idx++)_0x_f()};

        function _0x_teToggle(_0x_st) {
            _0x_sa = _0x_st !== undefined ? _0x_st : !_0x_sa;
            _0x_s = _0x_sa;
            if(_0x_sa) {
                if(!_0x_si) {
                    const _0x_spdSlider = document.getElementById('auto_e_speed_slider');
                    const _0x_intervalMs = _0x_spdSlider ? parseInt(_0x_spdSlider.value, 10) : _0x_b;
                    let _0x_i = Math.max(1, _0x_intervalMs);
                    _0x_si = setInterval(_0x_j, _0x_i);
                }
            } else {
                if(_0x_si) { clearInterval(_0x_si); _0x_si = null; }
            }
        }

        window.addEventListener('keydown', (_0x_e)=>{ if(_0x_e.code===_0x_k && !_0x_e.repeat) { _0x_teToggle(true); } });
        window.addEventListener('keyup', (_0x_e)=>{ if(_0x_e.code===_0x_k) { _0x_teToggle(false); } });
        window.addEventListener('blur', ()=>{ _0x_teToggle(false); });

        let _0x_lang = savedConfig.client_lang || 'ru';
        window._0x_lang_code = _0x_lang;

        const _0x_ld = {
            en: {
                title: "LELYA HACK CLIENT",
                tab_general: "General",
                tab_visuals: "Visuals",
                tab_misc: "Misc",
                tab_lely: "Lelyas",
                tab_flooder: "Flooder ⚙",
                lang_btn: "🌐 ENG",
                lbl_vzoom: "Zoom Hack (+ / -)",
                lbl_mantiafk: "Anti-AFK (R)",
                lbl_cgh: "Auto GH (F) [EN]",
                lbl_ckmn: "Auto RPS",
                lbl_cpkm: "Building Helper",
                lbl_cswap: "Auto Swap",
                lbl_vtrail: "Neon Cursor Trail",
                lbl_vhitfx: "Click Sparkles",
                lbl_vwasd: "WASD Visualizer",
                lbl_vcolor: "Visual Color Theme",
                lbl_vtheme: "Interface Theme",
                lbl_mflooder: "Toggle Flooder (F4)",
                lbl_cpress8: "Press F = Type 8",
                lbl_cpress0: "Press J = Type 0",
                lbl_floodez: "Spam /ez",
                lbl_floodnum: "Spam Numbers (1-10000)",
                lbl_floodcustom: "Custom Text",
                btn_flood_prompt: "💬 Set Flooder Text",
                lbl_fspd: "Flooder Delay (ms):",
                lelya_doya: "Lely Dairyperson",
                lelya_evil: "Evil Lelya",
                lelya_potuzna: "Powerful Lelya",
                lelya_sleep: "Sleeping Lelya",
                lelya_watch: "Watching Lelya",
                milk_btn: "🥛 Milk!"
            },
            ru: {
                title: "LELYA HACK CLIENT",
                tab_general: "Главная",
                tab_visuals: "Визуал",
                tab_misc: "Разное",
                tab_lely: "Лели",
                tab_flooder: "Флудер ⚙",
                lang_btn: "🌐 РУС",
                lbl_vzoom: "Зумхак (+ / -)",
                lbl_mantiafk: "Анти-АФК (R)",
                lbl_cgh: "Авто GH (F) [EN]",
                lbl_ckmn: "Авто КМН",
                lbl_cpkm: "Building Helper",
                lbl_cswap: "Автосвап",
                lbl_vtrail: "Неоновый след курсора",
                lbl_vhitfx: "Искры при кликах",
                lbl_vwasd: "WASD Визуалер",
                lbl_vcolor: "Цвет визуалов",
                lbl_vtheme: "Тема интерфейса",
                lbl_mflooder: "Вкл/Выкл флудер (F4)",
                lbl_cpress8: "Нажимать F = Писать 8",
                lbl_cpress0: "Нажимать J = Писать 0",
                lbl_floodez: "Спамить /ez",
                lbl_floodnum: "Спамить цифры (1-10000)",
                lbl_floodcustom: "Свой текст",
                btn_flood_prompt: "💬 Настроить текст флудера",
                lbl_fspd: "Задержка флудера (мс):",
                lelya_doya: "Леля Доярочка",
                lelya_evil: "Злая Леля",
                lelya_potuzna: "Потужная Леля",
                lelya_sleep: "Спящая Леля (Пырнули)",
                lelya_watch: "Смотрящая Леля",
                milk_btn: "🥛 Доить!"
            }
        };

        function _0x_tr(_0x_k2) { return _0x_ld[_0x_lang][_0x_k2] || _0x_k2; }

        let _0x_wstate = {
            doya: { enabled: false, elem: null },
            evil: { enabled: false, elem: null },
            potuzna: { enabled: false, elem: null },
            sleep: { enabled: false, elem: null },
            watch: { enabled: false, elem: null }
        };

        let _0x_fly = [];
        let _0x_milks = [];

        const _0x_img1 = "https://i.postimg.cc/G4WTXqWM/lelya.png";
        const _0x_img2 = "https://i.postimg.cc/4y7tpPPZ/zlaa-lela.jpg";
        const _0x_img3 = "https://i.postimg.cc/x12YmPys/potuznaa-lela.jpg";
        const _0x_img4 = "https://i.postimg.cc/xdsSWVDY/lelu-pyrnuli.png";
        const _0x_img5 = "https://i.postimg.cc/3NG54yy2/lela-smotrit.png";

        function _0x_drag(_0x_el){
            let _0x_sx, _0x_sy, _0x_ox, _0x_oy;
            _0x_el.addEventListener('mousedown', (_0x_e) => {
                if (_0x_e.button !== 0) return;
                _0x_e.preventDefault();
                const _0x_rc = _0x_el.getBoundingClientRect();
                _0x_sx = _0x_e.clientX; _0x_sy = _0x_e.clientY;
                _0x_ox = _0x_rc.left; _0x_oy = _0x_rc.top;
                _0x_el.style.top = _0x_oy + 'px'; _0x_el.style.left = _0x_ox + 'px';
                _0x_el.style.bottom = 'auto'; _0x_el.style.right = 'auto';

                function _0x_mv(_0x_me){
                    _0x_el.style.left = (_0x_ox + (_0x_me.clientX - _0x_sx)) + 'px';
                    _0x_el.style.top = (_0x_oy + (_0x_me.clientY - _0x_sy)) + 'px';
                }
                function _0x_up(){
                    window.removeEventListener('mousemove', _0x_mv);
                    window.removeEventListener('mouseup', _0x_up);
                }
                window.addEventListener('mousemove', _0x_mv);
                window.addEventListener('mouseup', _0x_up);
            });
        }

        function _0x_rain(_0x_x, _0x_y, _0x_url) {
            for (let _0x_i2 = 0; _0x_i2 < 25; _0x_i2++) {
                const _0x_ang = Math.random() * Math.PI * 2;
                const _0x_spd = Math.random() * 8 + 2;
                _0x_milks.push({ x: _0x_x, y: _0x_y, vx: Math.cos(_0x_ang) * _0x_spd, vy: Math.sin(_0x_ang) * _0x_spd - 3, alpha: 1.0, size: Math.random() * 5 + 3 });
            }
            for (let _0x_i3 = 0; _0x_i3 < 8; _0x_i3++) {
                const _0x_ang = (Math.PI * 2 / 8) * _0x_i3 + (Math.random() - 0.5) * 0.5;
                const _0x_spd = Math.random() * 7 + 4;
                const _0x_im = new Image();
                _0x_im.src = _0x_url;
                _0x_fly.push({ img: _0x_im, x: _0x_x, y: _0x_y, vx: Math.cos(_0x_ang) * _0x_spd, vy: Math.sin(_0x_ang) * _0x_spd - 4, rot: Math.random() * Math.PI, vRot: (Math.random() - 0.5) * 0.2, alpha: 1.0, size: 45 });
            }
        }

        function _0x_scoreUp(_0x_sid) {
            const _0x_sel = document.getElementById(_0x_sid);
            if (!_0x_sel) return;
            let _0x_tot = parseInt(_0x_sel.getAttribute('data-score') || '0', 10) + 5;
            _0x_sel.setAttribute('data-score', _0x_tot);
            _0x_sel.innerHTML = `🥛 Удой: <b>${_0x_tot} л</b> (+5 л!)`;
        }

        function _0x_togW(_0x_wk, _0x_wtitle, _0x_wurl, _0x_wpos) {
            let _0x_w = _0x_wstate[_0x_wk];
            _0x_w.enabled = !_0x_w.enabled;
            if (_0x_w.enabled) {
                if (!_0x_w.elem) {
                    _0x_w.elem = document.createElement('div');
                    _0x_w.elem.style.cssText = `position:fixed; ${_0x_wpos}; z-index:99999; background:rgba(0,0,0,0.85); padding:12px; border-radius:14px; color:#fff; font-weight:bold; font-size:14px; box-shadow:0 0 20px rgba(255,255,255,0.15); user-select:none; border:1px solid rgba(255,255,255,0.15); backdrop-filter:blur(6px); text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:grab;`;
                    _0x_w.elem.innerHTML = `
                        <div style="color:#fff; font-size:15px;">${_0x_wtitle}</div>
                        <img src="${_0x_wurl}" style="max-width:160px; max-height:200px; border-radius:10px; border:1px solid #333; object-fit:cover; pointer-events:none;" alt="${_0x_wtitle}"/>
                        <div id="score_${_0x_wk}" data-score="0" style="font-size:12px; color:#aaa;">🥛 Удой: <b>0 л</b></div>
                        <button id="milk_btn_${_0x_wk}" style="background:rgba(20,20,20,0.8); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:8px 14px; font-weight:bold; border-radius:8px; cursor:pointer;">${_0x_tr('milk_btn')}</button>
                    `;
                    _0x_drag(_0x_w.elem);
                    document.body.appendChild(_0x_w.elem);
                    document.getElementById(`milk_btn_${_0x_wk}`).addEventListener('click', (_0x_e) => {
                        const _0x_rc = _0x_e.target.getBoundingClientRect();
                        _0x_rain(_0x_rc.left + _0x_rc.width / 2, _0x_rc.top, _0x_wurl);
                        _0x_scoreUp(`score_${_0x_wk}`);
                    });
                } else {
                    _0x_w.elem.style.display = 'flex';
                }
            } else {
                if (_0x_w.elem) _0x_w.elem.style.display = 'none';
            }
        }

        let _0x_aafk = { active: false, interval: null, currentKey: null, index: 0, keys: ['w', 'd', 's', 'a'] };
        function _0x_kd(_0x_kstr){ document.dispatchEvent(new KeyboardEvent('keydown', {key:_0x_kstr, code:'Key'+_0x_kstr.toUpperCase(), bubbles:!0})); }
        function _0x_ku(_0x_kstr){ document.dispatchEvent(new KeyboardEvent('keyup', {key:_0x_kstr, code:'Key'+_0x_kstr.toUpperCase(), bubbles:!0})); }
        function _0x_nextAfk(){
            if(_0x_aafk.currentKey) _0x_ku(_0x_aafk.currentKey);
            const _0x_key = _0x_aafk.keys[_0x_aafk.index % _0x_aafk.keys.length];
            _0x_kd(_0x_key);
            _0x_aafk.currentKey = _0x_key;
            _0x_aafk.index++;
        }
        function _0x_togAfk() {
            _0x_aafk.active = !_0x_aafk.active;
            if(_0x_aafk.active) {
                _0x_aafk.index = 0; _0x_aafk.currentKey = null;
                _0x_aafk.interval = setInterval(_0x_nextAfk, 400);
            } else {
                if(_0x_aafk.interval) { clearInterval(_0x_aafk.interval); _0x_aafk.interval = null; }
                if(_0x_aafk.currentKey) { _0x_ku(_0x_aafk.currentKey); _0x_aafk.currentKey = null; }
            }
        }
        window.addEventListener('keydown', (_0x_e)=>{
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };
            if((_0x_e.key === 'r' || _0x_e.key === 'R') && _0x_chk('m_antiafk')) {
                const _0x_act = document.activeElement;
                if(_0x_act && (_0x_act.tagName === 'INPUT' || _0x_act.tagName === 'TEXTAREA')) return;
                _0x_e.preventDefault();
                _0x_togAfk();
            }
        });

        let _0x_mx = 0, _0x_my = 0;
        window.addEventListener('mousemove', (_0x_e) => { _0x_mx = _0x_e.clientX; _0x_my = _0x_e.clientY; });

        const _0x_wait = _0x_ms => new Promise(_0x_r => setTimeout(_0x_r, _0x_ms));

        function _0x_pressKey(_0x_kchar, _0x_kcode, _0x_knum) {
            const _0x_act = document.activeElement || document.body;
            const _0x_obj = { key: _0x_kchar, code: _0x_kcode, keyCode: _0x_knum, which: _0x_knum, charCode: _0x_kchar.length === 1 ? _0x_kchar.charCodeAt(0) : 0, bubbles: !0, cancelable: !0, composed: !0 };
            _0x_act.dispatchEvent(new KeyboardEvent('keydown', _0x_obj));
            if(_0x_kchar.length === 1) _0x_act.dispatchEvent(new KeyboardEvent('keypress', _0x_obj));
            _0x_act.dispatchEvent(new KeyboardEvent('keyup', _0x_obj));
        }

        async function _0x_clickCoords() {
            const _0x_el = document.elementFromPoint(_0x_mx, _0x_my);
            if (!_0x_el) return;
            const _0x_me = { bubbles: !0, cancelable: !0, button: 0, clientX: _0x_mx, clientY: _0x_my };
            _0x_el.dispatchEvent(new MouseEvent('mousedown', _0x_me));
            await _0x_wait(54);
            _0x_el.dispatchEvent(new MouseEvent('mouseup', _0x_me));
        }

        window._0x_sendChat = function(_0x_str) {
            _0x_pressKey('Enter', 'Enter', 13);
            setTimeout(() => {
                for(let _0x_n = 0; _0x_n < _0x_str.length; _0x_n++) {
                    const _0x_ch = _0x_str[_0x_n];
                    setTimeout(() => {
                        let _0x_cd = 'Key' + _0x_ch.toUpperCase();
                        let _0x_kn = _0x_ch.toUpperCase().charCodeAt(0);
                        if(_0x_ch === '/') { _0x_cd = 'Slash'; _0x_kn = 191; }
                        else if(_0x_ch === ' ') { _0x_cd = 'Space'; _0x_kn = 32; }
                        _0x_pressKey(_0x_ch, _0x_cd, _0x_kn);
                    }, _0x_n * 15);
                }
                setTimeout(() => { _0x_pressKey('Enter', 'Enter', 13); }, _0x_str.length * 15 + 40);
            }, 30);
        }

        window.addEventListener('keydown', (_0x_e) => {
            const _0x_act = document.activeElement;
            if (_0x_act && (_0x_act.tagName === 'INPUT' || _0x_act.tagName === 'TEXTAREA')) return;
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };

            if (_0x_e.code === 'KeyF' || _0x_e.key === 'f' || _0x_e.key === 'F') {
                if (_0x_chk('c_press8')) { _0x_e.preventDefault(); _0x_pressKey('8', 'Digit8', 56); return; }
                if (_0x_chk('c_gh')) { _0x_e.preventDefault(); (async()=>{ _0x_pressKey('9', 'Digit9', 57); await _0x_wait(56); await _0x_clickCoords(); _0x_pressKey('1', 'Digit1', 49); })(); }
            }
            if ((_0x_e.code === 'KeyJ' || _0x_e.key === 'j') && _0x_chk('c_press0')) { _0x_e.preventDefault(); _0x_pressKey('0', 'Digit0', 48); return; }
            if (_0x_chk('c_autokmn')) {
                let _0x_chc = null;
                if (_0x_e.code === 'Digit1' || _0x_e.code === 'Numpad1') _0x_chc = _0x_lang === 'ru' ? 'Камень' : 'Rock';
                else if (_0x_e.code === 'Digit2' || _0x_e.code === 'Numpad2') _0x_chc = _0x_lang === 'ru' ? 'Ножницы' : 'Scissors';
                else if (_0x_e.code === 'Digit3' || _0x_e.code === 'Numpad3') _0x_chc = _0x_lang === 'ru' ? 'Бумага' : 'Paper';
                if (_0x_chc) { _0x_e.preventDefault(); window._0x_sendChat(_0x_chc); }
            }
        });

        let _0x_swRun = false, _0x_pkmRun = false;
        async function _0x_swapCycle() {
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };
            if (!_0x_chk('c_swap')) return;
            _0x_pressKey('8', 'Digit8', 56); await _0x_wait(80); await _0x_clickCoords(); _0x_pressKey('7', 'Digit7', 55); await _0x_wait(200);
        }

        window.addEventListener('mousedown', async (_0x_e) => {
            const _0x_act = document.activeElement;
            if (_0x_act && (_0x_act.tagName === 'INPUT' || _0x_act.tagName === 'TEXTAREA')) return;
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };

            if (_0x_e.button === 2 && _0x_chk('c_pkmshift')) {
                _0x_e.preventDefault();
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, bubbles: true }));
                if (!_0x_pkmRun) {
                    _0x_pkmRun = true;
                    while (_0x_pkmRun && _0x_chk('c_pkmshift')) {
                        const _0x_el = document.elementFromPoint(_0x_mx, _0x_my) || document.body;
                        _0x_el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, clientX: _0x_mx, clientY: _0x_my }));
                        await _0x_wait(30);
                        _0x_el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0, clientX: _0x_mx, clientY: _0x_my }));
                        await _0x_wait(50);
                    }
                }
                return;
            }
            if (_0x_e.button === 2 && _0x_chk('c_swap')) {
                _0x_e.preventDefault();
                if (!_0x_swRun) {
                    _0x_swRun = true;
                    while (_0x_swRun && _0x_chk('c_swap')) { await _0x_swapCycle(); }
                }
            }
        });

        window.addEventListener('mouseup', (_0x_e) => {
            if (_0x_e.button === 2) {
                if (_0x_pkmRun) {
                    _0x_pkmRun = false;
                    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, bubbles: true }));
                }
                _0x_swRun = false;
            }
        });

        window.addEventListener('contextmenu', (_0x_e) => {
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };
            if (_0x_chk('c_swap') || _0x_chk('c_pkmshift')) {
                const _0x_act = document.activeElement;
                if (_0x_act && (_0x_act.tagName === 'INPUT' || _0x_act.tagName === 'TEXTAREA')) return;
                _0x_e.preventDefault();
            }
        });

        let _0x_fTimer = null, _0x_fIdx = 0;
        let _0x_orgConf = window.confirm;
        let customPhrases = ["/ez"];

        function _0x_getPhrases() {
            const _0x_ez = document.getElementById('flood_ez_check');
            const _0x_num = document.getElementById('flood_num_check');
            const _0x_cus = document.getElementById('flood_custom_check');
            let _0x_res = [];
            if (_0x_ez && _0x_ez.checked) _0x_res.push('/ez');
            if (_0x_num && _0x_num.checked) { for (let _0x_i5 = 1; _0x_i5 <= 10000; _0x_i5++) _0x_res.push(`${_0x_i5}`); }
            if (_0x_cus && _0x_cus.checked) {
                customPhrases.forEach(p => _0x_res.push(p));
            }
            if (_0x_res.length === 0) _0x_res.push('/ez');
            return _0x_res;
        }

        function _0x_fLoop() {
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };
            if (!_0x_chk('m_flooder')) return;
            const _0x_ph = _0x_getPhrases();
            window._0x_sendChat(_0x_ph[_0x_fIdx % _0x_ph.length]);
            _0x_fIdx++;
            const _0x_spd = document.getElementById('flood_speed_slider');
            _0x_fTimer = setTimeout(_0x_fLoop, _0x_spd ? parseInt(_0x_spd.value, 10) : 300);
        }

        function updateFlooderState(active) {
            if (active) {
                window.confirm = () => !0;
                _0x_fIdx = 0;
                if (_0x_fTimer) clearTimeout(_0x_fTimer);
                _0x_fLoop();
            } else {
                if (_0x_fTimer) { clearTimeout(_0x_fTimer); _0x_fTimer = null; }
                window.confirm = _0x_orgConf;
            }
        }

        window.addEventListener('keydown', (_0x_e) => {
            const _0x_chk = _0x_id => { const _0x_el = document.getElementById(_0x_id); return _0x_el && _0x_el.checked; };
            if (_0x_e.key === 'F4') {
                const _0x_act = document.activeElement;
                if (_0x_act && (_0x_act.tagName === 'INPUT' || _0x_act.tagName === 'TEXTAREA')) return;
                const flChk = document.getElementById('m_flooder');
                if (flChk) {
                    _0x_e.preventDefault();
                    flChk.checked = !flChk.checked;
                    flChk.dispatchEvent(new Event('change'));
                }
            }
        });

        // Zoom Hack
        let zoomState = { enabled: false, scale: 1.0, minScale: 0.35 };
        let zoomStyleElem = null;

        function ensureZoomStyle() {
            if (zoomStyleElem) return;
            zoomStyleElem = document.createElement('style');
            zoomStyleElem.textContent = 'html.browser-squeezed{background:#2d2d2d!important;display:flex!important;justify-content:center!important;align-items:center!important;min-height:100vh!important;overflow-x:hidden!important}html.browser-squeezed body{transform-origin:center center!important;width:100%!important;margin:0!important;background:white!important;box-shadow:0 0 30px rgba(0,0,0,0.5)!important;transition:transform 0.2s ease!important}html.browser-squeezed{overflow-y:auto!important}html.browser-squeezed body::-webkit-scrollbar{width:12px}';
            document.head.appendChild(zoomStyleElem);
        }

        function applyZoomScale(s) {
            zoomState.scale = s;
            if (s === 1) {
                document.documentElement.classList.remove('browser-squeezed');
                document.body.style.transform = '';
            } else {
                ensureZoomStyle();
                document.documentElement.classList.add('browser-squeezed');
                document.body.style.transform = `scale(1, ${s})`;
            }
        }

        function toggleZoom(state) {
            const chk = document.getElementById('v_zoom');
            const newState = state !== undefined ? state : (chk ? chk.checked : !zoomState.enabled);
            zoomState.enabled = newState;
            if (chk) chk.checked = newState;
            if (newState) {
                applyZoomScale(zoomState.minScale);
            } else {
                applyZoomScale(1.0);
            }
        }

        window.addEventListener('keydown', function(e) {
            const chk = document.getElementById('v_zoom');
            if (!chk || !chk.checked) return;
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
            if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
                e.preventDefault();
                applyZoomScale(zoomState.minScale);
            } else if (e.key === '-' || e.code === 'NumpadSubtract') {
                e.preventDefault();
                applyZoomScale(1.0);
            }
        });

        function getVisualColor() {
            const cp = document.getElementById('v_color_picker');
            return cp ? cp.value : '#8a6dee';
        }

     
        let trailState = { enabled: false, canvas: null, ctx: null, points: [], anim: null };
        function updateTrailCanvas() {
            if (trailState.canvas) {
                trailState.canvas.width = window.innerWidth;
                trailState.canvas.height = window.innerHeight;
            }
        }
        function drawTrailLoop() {
            if (!trailState.ctx || !trailState.enabled) return;
            trailState.ctx.clearRect(0, 0, trailState.canvas.width, trailState.canvas.height);
            const col = getVisualColor();
            for (let p of trailState.points) {
                trailState.ctx.beginPath();
                trailState.ctx.arc(p.x, p.y, p.z * p.l, 0, Math.PI * 2);
                trailState.ctx.fillStyle = col;
                trailState.ctx.globalAlpha = p.l * 0.6;
                trailState.ctx.shadowBlur = 12;
                trailState.ctx.shadowColor = col;
                trailState.ctx.fill();
                p.l -= 0.035;
            }
            trailState.ctx.globalAlpha = 1.0;
            trailState.points = trailState.points.filter(p => p.l > 0.05);
            trailState.anim = requestAnimationFrame(drawTrailLoop);
        }
        function toggleTrail(state) {
            const chk = document.getElementById('v_trail');
            const newState = state !== undefined ? state : (chk ? chk.checked : !trailState.enabled);
            trailState.enabled = newState;
            if (chk) chk.checked = newState;
            if (newState) {
                if (!trailState.canvas) {
                    trailState.canvas = document.createElement('canvas');
                    trailState.canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:99998';
                    document.body.appendChild(trailState.canvas);
                    trailState.ctx = trailState.canvas.getContext('2d');
                    updateTrailCanvas();
                    window.addEventListener('resize', updateTrailCanvas);
                }
                trailState.canvas.style.display = 'block';
                if (!trailState.anim) drawTrailLoop();
            } else {
                if (trailState.canvas) trailState.canvas.style.display = 'none';
                if (trailState.anim) { cancelAnimationFrame(trailState.anim); trailState.anim = null; }
                trailState.points = [];
            }
        }
        window.addEventListener('mousemove', (e) => {
            if (!trailState.enabled) return;
            trailState.points.push({ x: e.clientX, y: e.clientY, z: Math.random() * 4 + 3, l: 1.0 });
        });

       
        let clickFx = { enabled: false, canvas: null, ctx: null, particles: [], animId: null };
        function createClickFxCanvas() {
            if (clickFx.canvas) return;
            clickFx.canvas = document.createElement('canvas');
            clickFx.canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:999999';
            document.body.appendChild(clickFx.canvas);
            clickFx.ctx = clickFx.canvas.getContext('2d');
            window.addEventListener('resize', ()=>{
                if (clickFx.canvas) {
                    clickFx.canvas.width = window.innerWidth;
                    clickFx.canvas.height = window.innerHeight;
                }
            });
        }
        function startClickFxLoop() {
            if (!clickFx.ctx || clickFx.animId) return;
            function frame() {
                if (!clickFx.ctx || !clickFx.canvas) return;
                const w = window.innerWidth, h = window.innerHeight;
                if (clickFx.canvas.width !== w || clickFx.canvas.height !== h) {
                    clickFx.canvas.width = w; clickFx.canvas.height = h;
                }
                clickFx.ctx.clearRect(0, 0, w, h);
                const col = getVisualColor();
                for (let i = clickFx.particles.length - 1; i >= 0; i--) {
                    let p = clickFx.particles[i];
                    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.alpha -= 0.025;
                    if (p.alpha <= 0) { clickFx.particles.splice(i, 1); continue; }
                    clickFx.ctx.fillStyle = col;
                    clickFx.ctx.globalAlpha = p.alpha;
                    clickFx.ctx.shadowBlur = 10;
                    clickFx.ctx.shadowColor = col;
                    try {
                        clickFx.ctx.beginPath();
                        clickFx.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        clickFx.ctx.fill();
                    } catch(err) {}
                }
                clickFx.ctx.globalAlpha = 1.0;
                if (clickFx.particles.length > 0) clickFx.animId = requestAnimationFrame(frame);
                else clickFx.animId = null;
            }
            clickFx.animId = requestAnimationFrame(frame);
        }
        function addHitParticles(x, y) {
            const chk = document.getElementById('v_hitfx');
            if (!chk || !chk.checked) return;
            createClickFxCanvas();
            for (let i = 0; i < 18; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = Math.random() * 7 + 2;
                clickFx.particles.push({ x: x, y: y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, alpha: 1.0, size: Math.random() * 4 + 2 });
            }
            startClickFxLoop();
        }
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) addHitParticles(e.clientX, e.clientY);
        });

       
        let wasdElem = null;
        function updateWasdKeys(code, isDown) {
            if (!wasdElem) return;
            const map = { KeyW: '_wasd_w', KeyA: '_wasd_a', KeyS: '_wasd_s', KeyD: '_wasd_d' };
            const id = map[code];
            if (id) {
                const el = document.getElementById(id);
                if (el) {
                    if (isDown) el.style.background = getVisualColor();
                    else el.style.background = 'rgba(25, 25, 32, 0.8)';
                }
            }
        }
        function toggleWasdVisualizer(state) {
            const chk = document.getElementById('v_wasd');
            const newState = state !== undefined ? state : (chk ? chk.checked : (wasdElem !== null));
            if (chk) chk.checked = newState;
            if (newState) {
                if (!wasdElem) {
                    wasdElem = document.createElement('div');
                    wasdElem.style.cssText = 'position:fixed; bottom:30px; left:30px; z-index:99998; width:110px; height:75px; pointer-events:none; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(2, 1fr); gap:5px;';
                    wasdElem.innerHTML = `
                        <div></div>
                        <div id="_wasd_w" style="background:rgba(25, 25, 32, 0.8); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:12px; transition:0.1s;">W</div>
                        <div></div>
                        <div id="_wasd_a" style="background:rgba(25, 25, 32, 0.8); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:12px; transition:0.1s;">A</div>
                        <div id="_wasd_s" style="background:rgba(25, 25, 32, 0.8); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:12px; transition:0.1s;">S</div>
                        <div id="_wasd_d" style="background:rgba(25, 25, 32, 0.8); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:12px; transition:0.1s;">D</div>
                    `;
                    document.body.appendChild(wasdElem);
                }
                wasdElem.style.display = 'grid';
            } else {
                if (wasdElem) wasdElem.style.display = 'none';
            }
        }
        window.addEventListener('keydown', (e) => {
            const act = document.activeElement;
            if (!act || (act.tagName !== 'INPUT' && act.tagName !== 'TEXTAREA')) {
                updateWasdKeys(e.code, true);
            }
        });
        window.addEventListener('keyup', (e) => {
            updateWasdKeys(e.code, false);
        });

        const getThemeCss = (theme) => {
            if (theme === 'light') {
                return `
                    #_0x_root { background: rgba(245, 245, 250, 0.98) !important; color: #111111 !important; border: 1px solid rgba(0, 0, 0, 0.2) !important; }
                    #_0x_head { background: rgba(230, 230, 235, 0.95) !important; border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important; }
                    #_0x_tlab { color: #111111 !important; }
                    #_0x_side { background: rgba(235, 235, 240, 0.95) !important; border-right: 1px solid rgba(0, 0, 0, 0.1) !important; }
                    ._0x_tab { color: #555555 !important; }
                    ._0x_tab.active { color: #111111 !important; background: rgba(0, 0, 0, 0.08) !important; border-left-color: #111111 !important; }
                    ._0x_ctrl { background: rgba(255, 255, 255, 0.9) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; }
                    ._0x_ctrl span { color: #222222 !important; }
                    ._0x_sld { background-color: rgba(200, 200, 205, 0.9) !important; border: 1px solid rgba(0, 0, 0, 0.15) !important; }
                    ._0x_sld:before { background-color: #222222 !important; }
                `;
            } else {
                return `
                    #_0x_root { background: rgba(12, 12, 16, 0.98) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; }
                    #_0x_head { background: rgba(20, 20, 25, 0.95) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }
                    #_0x_tlab { color: #ffffff !important; }
                    #_0x_side { background: rgba(16, 16, 20, 0.95) !important; border-right: 1px solid rgba(255, 255, 255, 0.1) !important; }
                    ._0x_tab { color: #888888 !important; }
                    ._0x_tab.active { color: #ffffff !important; background: rgba(255, 255, 255, 0.08) !important; border-left-color: #ffffff !important; }
                    ._0x_ctrl { background: rgba(25, 25, 32, 0.8) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
                    ._0x_ctrl span { color: #dddddd !important; }
                    ._0x_sld { background-color: rgba(45, 45, 55, 0.9) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; }
                    ._0x_sld:before { background-color: #ffffff !important; }
                `;
            }
        };

        const _0x_css = `
            #_0x_root { position: fixed; top: 50px; left: 50px; width: 740px; height: 540px; border-radius: 12px; z-index: 2147483647; font-family: 'Inter', system-ui, sans-serif; display: block; overflow: hidden; user-select: none; box-shadow: 0 10px 40px rgba(0,0,0,0.8); pointer-events: auto !important; }
            #_0x_root *, #_0x_root *:before, #_0x_root *:after { pointer-events: auto !important; }
            #_0x_root textarea, #_0x_root input { user-select: text !important; -webkit-user-select: text !important; cursor: pointer !important; }
            #_0x_head { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; cursor: move; }
            #_0x_tlab { font-size: 13px; font-weight: 800; letter-spacing: 3px; cursor: move; }
            #_0x_body { display: flex; height: calc(100% - 52px); }
            #_0x_side { width: 180px; padding: 16px 0; display: flex; flex-direction: column; gap: 4px; box-sizing: border-box; }
            ._0x_tab { padding: 14px 22px; font-size: 13px; font-weight: 600; cursor: pointer; border-left: 3px solid transparent; }
            ._0x_tab:hover { background: rgba(255,255,255,0.04); }
            #_0x_cont { flex: 1; padding: 24px; overflow-y: auto; max-height: 488px; box-sizing: border-box; }
            ._0x_pane { display: none; grid-template-columns: 1fr 1fr; gap: 14px; }
            ._0x_pane.active { display: grid; }
            ._0x_pane#_0x_pflood { grid-template-columns: 1fr; }
            ._0x_ctrl { padding: 12px 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; height: 58px; box-sizing: border-box; width: 100%; }
            ._0x_ctrl span { font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 12px; }
            ._0x_ctrl span img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.2); }
            ._0x_sw { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; cursor: pointer; }
            ._0x_sw input { opacity: 0; width: 0; height: 0; cursor: pointer; }
            ._0x_sld { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: 0.3s; border-radius: 24px; }
            ._0x_sld:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; transition: 0.3s; border-radius: 50%; }
            input:checked + ._0x_sld { background-color: var(--accent-color, #8a6dee) !important; border-color: rgba(138, 109, 238, 0.6); box-shadow: 0 0 10px var(--accent-glow, rgba(138, 109, 238, 0.5)); }
            input:checked + ._0x_sld:before { transform: translateX(20px); background-color: #ffffff; }
        `;

        const _0x_snode = document.createElement('style');
        _0x_snode.id = '_0x_dynamic_style';
        _0x_snode.innerHTML = _0x_css + getThemeCss(savedConfig.v_theme_select || 'dark');
        document.head.appendChild(_0x_snode);

        const _0x_root = document.createElement('div');
        _0x_root.id = '_0x_root';
        _0x_root.innerHTML = `
            <div id="_0x_head">
                <span id="_0x_tlab">LELYA HACK CLIENT</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button id="_0x_lang" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:600;">${_0x_tr('lang_btn')}</button>
                    <button id="_0x_close" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center;">×</button>
                </div>
            </div>
            <div id="_0x_body">
                <div id="_0x_side">
                    <div class="_0x_tab active" data-t="_0x_pgen" id="_0x_t_gen">${_0x_tr('tab_general')}</div>
                    <div class="_0x_tab" data-t="_0x_pvis" id="_0x_t_vis">${_0x_tr('tab_visuals')}</div>
                    <div class="_0x_tab" data-t="_0x_pmisc" id="_0x_t_misc">${_0x_tr('tab_misc')}</div>
                    <div class="_0x_tab" data-t="_0x_plely" id="_0x_t_lely">${_0x_tr('tab_lely')}</div>
                    <div class="_0x_tab" data-t="_0x_pflood" id="_0x_t_flood">${_0x_tr('tab_flooder')}</div>
                </div>
                <div id="_0x_cont">
                    <!-- ГЛАВНАЯ -->
                    <div class="_0x_pane active" id="_0x_pgen">
                        <div class="_0x_ctrl"><span id="lbl_vzoom">${_0x_tr('lbl_vzoom')}</span><label class="_0x_sw"><input type="checkbox" id="v_zoom"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_mantiafk">${_0x_tr('lbl_mantiafk')}</span><label class="_0x_sw"><input type="checkbox" id="m_antiafk"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_cgh">${_0x_tr('lbl_cgh')}</span><label class="_0x_sw"><input type="checkbox" id="c_gh"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_ckmn">${_0x_tr('lbl_ckmn')}</span><label class="_0x_sw"><input type="checkbox" id="c_autokmn"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_cpkm">${_0x_tr('lbl_cpkm')}</span><label class="_0x_sw"><input type="checkbox" id="c_pkmshift"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_cswap">${_0x_tr('lbl_cswap')}</span><label class="_0x_sw"><input type="checkbox" id="c_swap"><span class="_0x_sld"></span></label></div>
                    </div>
                    <!-- ВИЗУАЛ -->
                    <div class="_0x_pane" id="_0x_pvis">
                        <div class="_0x_ctrl"><span id="lbl_vtrail">${_0x_tr('lbl_vtrail')}</span><label class="_0x_sw"><input type="checkbox" id="v_trail"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_vhitfx">${_0x_tr('lbl_vhitfx')}</span><label class="_0x_sw"><input type="checkbox" id="v_hitfx"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_vwasd">${_0x_tr('lbl_vwasd')}</span><label class="_0x_sw"><input type="checkbox" id="v_wasd"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_vcolor">${_0x_tr('lbl_vcolor')}</span><input type="color" id="v_color_picker" value="#8a6dee" style="width:40px; height:28px; background:transparent; border:1px solid rgba(255,255,255,0.2); border-radius:6px; cursor:pointer;"></div>
                        <div class="_0x_ctrl"><span id="lbl_vtheme">${_0x_tr('lbl_vtheme')}</span>
                            <select id="v_theme_select" style="background:rgba(20,20,20,0.9); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; outline:none;">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                    </div>
                    <!-- РАЗНОЕ -->
                    <div class="_0x_pane" id="_0x_pmisc">
                        <div class="_0x_ctrl"><span id="lbl_cpress8">${_0x_tr('lbl_cpress8')}</span><label class="_0x_sw"><input type="checkbox" id="c_press8"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_cpress0">${_0x_tr('lbl_cpress0')}</span><label class="_0x_sw"><input type="checkbox" id="c_press0"><span class="_0x_sld"></span></label></div>
                    </div>
                    <!-- ЛЕЛИ -->
                    <div class="_0x_pane" id="_0x_plely">
                        <div class="_0x_ctrl"><span><img src="${_0x_img1}">${_0x_tr('lelya_doya')}</span><label class="_0x_sw"><input type="checkbox" id="v_lelya"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span><img src="${_0x_img2}">${_0x_tr('lelya_evil')}</span><label class="_0x_sw"><input type="checkbox" id="v_evil"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span><img src="${_0x_img3}">${_0x_tr('lelya_potuzna')}</span><label class="_0x_sw"><input type="checkbox" id="v_potuzna"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span><img src="${_0x_img4}">${_0x_tr('lelya_sleep')}</span><label class="_0x_sw"><input type="checkbox" id="v_sleep"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span><img src="${_0x_img5}">${_0x_tr('lelya_watch')}</span><label class="_0x_sw"><input type="checkbox" id="v_watch"><span class="_0x_sld"></span></label></div>
                    </div>
                    <!-- ФЛУДЕР -->
                    <div class="_0x_pane" id="_0x_pflood">
                        <div class="_0x_ctrl"><span id="lbl_mflooder">${_0x_tr('lbl_mflooder')}</span><label class="_0x_sw"><input type="checkbox" id="m_flooder"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_floodez">${_0x_tr('lbl_floodez')}</span><label class="_0x_sw"><input type="checkbox" id="flood_ez_check" checked><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_floodnum">${_0x_tr('lbl_floodnum')}</span><label class="_0x_sw"><input type="checkbox" id="flood_num_check"><span class="_0x_sld"></span></label></div>
                        <div class="_0x_ctrl"><span id="lbl_floodcustom">${_0x_tr('lbl_floodcustom')}</span><label class="_0x_sw"><input type="checkbox" id="flood_custom_check"><span class="_0x_sld"></span></label></div>
                        <button id="flood_prompt_btn" style="width:100%; padding:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:#fff; font-size:13px; font-weight:600; cursor:pointer; grid-column: span 2;">${_0x_tr('btn_flood_prompt')}</button>
                        <div style="background:rgba(20,20,25,0.8); border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:6px; grid-column: span 2;">
                            <span id="_0x_fspd_lbl" style="font-size:12px; color:#dddddd;">${_0x_tr('lbl_fspd')}</span>
                            <input type="range" id="flood_speed_slider" min="50" max="1000" value="300" style="width:100%; cursor:pointer;">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(_0x_root);

        function updateThemeAndColors() {
            const themeSel = document.getElementById('v_theme_select');
            const theme = themeSel ? themeSel.value : 'dark';
            document.getElementById('_0x_dynamic_style').innerHTML = _0x_css + getThemeCss(theme);
            const col = getVisualColor();
            document.documentElement.style.setProperty('--accent-color', col);
            document.documentElement.style.setProperty('--accent-glow', col + '80');
        }

        function loadConfig() {
            for (const [id, val] of Object.entries(savedConfig)) {
                const el = document.getElementById(id);
                if (el && el.type === 'checkbox') {
                    el.checked = val;
                    el.dispatchEvent(new Event('change'));
                } else if (id === 'flood_speed_slider' && el) {
                    el.value = val;
                } else if (id === 'v_color_picker' && el) {
                    el.value = val;
                } else if (id === 'v_theme_select' && el) {
                    el.value = val;
                }
            }
            updateThemeAndColors();
        }

        loadConfig();

        document.querySelectorAll('#_0x_root input, #_0x_root select').forEach(element => {
            element.addEventListener('change', () => {
                saveConfig();
                updateThemeAndColors();
                if (element.id === 'm_flooder') {
                    updateFlooderState(element.checked);
                }
            });
            element.addEventListener('input', () => {
                saveConfig();
                updateThemeAndColors();
            });
        });

        document.getElementById('flood_prompt_btn').onclick = function() {
            showBrowserPrompt("Введите текст для флудера (можно разделять запятыми):", customPhrases.join(", "), (res) => {
                if (res !== null) {
                    customPhrases = res.split(',').map(s => s.trim()).filter(s => s.length > 0);
                }
            });
        };

        document.getElementById('v_lelya').onchange = (e) => { _0x_togW('doya', 'Леля Доярочка', _0x_img1, 'top:80px; right:20px;'); saveConfig(); };
        document.getElementById('v_evil').onchange = (e) => { _0x_togW('evil', 'Злая Леля', _0x_img2, 'top:240px; right:20px;'); saveConfig(); };
        document.getElementById('v_potuzna').onchange = (e) => { _0x_togW('potuzna', 'Потужная Леля', _0x_img3, 'top:400px; right:20px;'); saveConfig(); };
        document.getElementById('v_sleep').onchange = (e) => { _0x_togW('sleep', 'Спящая Леля', _0x_img4, 'bottom:20px; right:220px;'); saveConfig(); };
        document.getElementById('v_watch').onchange = (e) => { _0x_togW('watch', 'Смотрящая Леля', _0x_img5, 'bottom:20px; right:20px;'); saveConfig(); };

        document.getElementById('v_zoom').onchange = (e) => { toggleZoom(e.target.checked); saveConfig(); };
        document.getElementById('v_trail').onchange = (e) => { toggleTrail(e.target.checked); saveConfig(); };
        document.getElementById('v_wasd').onchange = (e) => { toggleWasdVisualizer(e.target.checked); saveConfig(); };

        if (document.getElementById('v_zoom').checked) toggleZoom(true);
        if (document.getElementById('v_trail').checked) toggleTrail(true);
        if (document.getElementById('v_wasd').checked) toggleWasdVisualizer(true);
        if (document.getElementById('m_flooder').checked) updateFlooderState(true);

        function applyLocalization() {
            document.getElementById('_0x_tlab').innerText = _0x_tr('title');
            document.getElementById('_0x_lang').innerText = _0x_tr('lang_btn');
            document.getElementById('_0x_t_gen').innerText = _0x_tr('tab_general');
            document.getElementById('_0x_t_vis').innerText = _0x_tr('tab_visuals');
            document.getElementById('_0x_t_misc').innerText = _0x_tr('tab_misc');
            document.getElementById('_0x_t_lely').innerText = _0x_tr('tab_lely');
            document.getElementById('_0x_t_flood').innerText = _0x_tr('tab_flooder');

            document.getElementById('lbl_vzoom').innerText = _0x_tr('lbl_vzoom');
            document.getElementById('lbl_mantiafk').innerText = _0x_tr('lbl_mantiafk');
            document.getElementById('lbl_cgh').innerText = _0x_tr('lbl_cgh');
            document.getElementById('lbl_ckmn').innerText = _0x_tr('lbl_ckmn');
            document.getElementById('lbl_cpkm').innerText = _0x_tr('lbl_cpkm');
            document.getElementById('lbl_cswap').innerText = _0x_tr('lbl_cswap');

            document.getElementById('lbl_vtrail').innerText = _0x_tr('lbl_vtrail');
            document.getElementById('lbl_vhitfx').innerText = _0x_tr('lbl_vhitfx');
            document.getElementById('lbl_vwasd').innerText = _0x_tr('lbl_vwasd');
            document.getElementById('lbl_vcolor').innerText = _0x_tr('lbl_vcolor');
            document.getElementById('lbl_vtheme').innerText = _0x_tr('lbl_vtheme');

            document.getElementById('lbl_mflooder').innerText = _0x_tr('lbl_mflooder');
            document.getElementById('lbl_cpress8').innerText = _0x_tr('lbl_cpress8');
            document.getElementById('lbl_cpress0').innerText = _0x_tr('lbl_cpress0');

            document.getElementById('lbl_floodez').innerText = _0x_tr('lbl_floodez');
            document.getElementById('lbl_floodnum').innerText = _0x_tr('lbl_floodnum');
            document.getElementById('lbl_floodcustom').innerText = _0x_tr('lbl_floodcustom');
            document.getElementById('flood_prompt_btn').innerText = _0x_tr('btn_flood_prompt');
            document.getElementById('_0x_fspd_lbl').innerText = _0x_tr('lbl_fspd');
        }

        document.getElementById('_0x_lang').onclick = function() {
            _0x_lang = _0x_lang === 'ru' ? 'en' : 'ru';
            window._0x_lang_code = _0x_lang;
            applyLocalization();
            saveConfig();
        };

        
        document.getElementById('_0x_close').onclick = () => {
            _0x_root.style.display = 'none';
        };

        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Insert') {
                const act = document.activeElement;
                if (!act || (act.tagName !== 'INPUT' && act.tagName !== 'TEXTAREA')) {
                    _0x_root.style.display = _0x_root.style.display === 'none' ? 'block' : 'none';
                }
            }
        });

       
        const tabs = document.querySelectorAll('._0x_tab');
        const panes = document.querySelectorAll('._0x_pane');
        tabs.forEach(t => {
            t.addEventListener('click', function(e) {
                e.stopPropagation();
                tabs.forEach(x => x.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                t.classList.add('active');
                const targetPane = document.getElementById(t.getAttribute('data-t'));
                if (targetPane) targetPane.classList.add('active');
            });
        });

       
        const dragHead = document.getElementById('_0x_head');
        let isRootDragging = false, rootStartX, rootStartY;

        dragHead.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.id === '_0x_lang' || e.target.id === '_0x_close') return;
            isRootDragging = true;
            rootStartX = e.clientX - _0x_root.offsetLeft;
            rootStartY = e.clientY - _0x_root.offsetTop;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isRootDragging) return;
            _0x_root.style.left = (e.clientX - rootStartX) + 'px';
            _0x_root.style.top = (e.clientY - rootStartY) + 'px';
        });

        window.addEventListener('mouseup', () => {
            isRootDragging = false;
        });
    }
})();
