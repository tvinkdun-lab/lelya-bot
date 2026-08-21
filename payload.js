(function() {
    'use strict';

    document.title = 'LelyaHack';

    // ==========================================
    // 1. TimeMachine Overrides
    // ==========================================
    const nativePerformanceNow = performance.now.bind(performance);

    let speed = 1;

    function setTimeSpeed(multiplier) {
        speed = multiplier;
    }

    let lastPNow = performance.now();
    let pNowOffset = 0;

    window.performance.now = new Proxy(window.performance.now, {
        apply: function(target, thisArg, argList) {
            const time = Reflect.apply(target, thisArg, argList);
            pNowOffset += (time - lastPNow) * (speed - 1);
            lastPNow = time;
            return time + pNowOffset;
        }
    });

    let lastD = Date.now();
    let dOffset = 0;

    window.Date.now = new Proxy(window.Date.now, {
        apply: function(target, thisArg, argList) {
            const time = Reflect.apply(target, thisArg, argList);
            dOffset += (time - lastD) * (speed - 1);
            lastD = time;
            return Math.floor(time + dOffset);
        }
    });

    let lastRAF = performance.now();
    let rAFOffset = 0;

    window.requestAnimationFrame = new Proxy(window.requestAnimationFrame, {
        apply: function(target, thisArg, argList) {
            if (typeof argList[0] === "function") {
                argList[0] = new Proxy(argList[0], {
                    apply: function(target2, thisArg2, argList2) {
                        const time = argList2[0];
                        rAFOffset += (time - lastRAF) * (speed - 1);
                        lastRAF = time;
                        argList2[0] = time + rAFOffset;
                        return Reflect.apply(target2, thisArg2, argList2);
                    }
                });
            }
            return Reflect.apply(target, thisArg, argList);
        }
    });

    let ePressInterval;

    function startAutoE() {
        if (!ePressInterval) {
            setTimeSpeed(bindsConfig.speedMultiplier || 250);

            ePressInterval = setInterval(() => {
                const KeyISdown = new KeyboardEvent('keydown', { key: 'e', keyCode: 69, code: 'KeyE', bubbles: true });
                const KeyISup = new KeyboardEvent('keyup', { key: 'e', keyCode: 69, code: 'KeyE', bubbles: true });
                window.dispatchEvent(KeyISdown);
                window.dispatchEvent(KeyISup);
            }, 1);
            updateAutoEHud(true);
        }
    }

    function stopAutoE() {
        if (ePressInterval) {
            clearInterval(ePressInterval);
            ePressInterval = null;
            setTimeSpeed(1);
            updateAutoEHud(false);
        }
    }

    function updateAutoEHud(active) {
        const dot = document.getElementById('_hud_autoe_dot');
        const txt = document.getElementById('_hud_autoe_txt');
        if (dot && txt) {
            if (active) {
                dot.style.background = '#22c55e';
                dot.style.boxShadow = '0 0 10px #22c55e';
                txt.style.color = '#22c55e';
                txt.innerText = 'ON';
            } else {
                dot.style.background = '#ef4444';
                dot.style.boxShadow = '0 0 10px #ef4444';
                txt.style.color = '#ef4444';
                txt.innerText = 'OFF';
            }
        }
    }

    // ==========================================
    // Building Helper Logic
    // ==========================================
    let buildInterval = null;
    let isBuildingActive = false;

    function startBuildingHelper() {
        if (buildInterval) return;
        isBuildingActive = true;

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true, bubbles: true }));

        buildInterval = setInterval(() => {
            clickAtCursor();
        }, 30);
    }

    function stopBuildingHelper() {
        if (buildInterval) {
            clearInterval(buildInterval);
            buildInterval = null;
        }
        if (isBuildingActive) {
            isBuildingActive = false;
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: false, bubbles: true }));
        }
    }

    const pressedKeys = new Set();
    const wasdKeyMap = {
        'KeyW': 'w',
        'KeyA': 'a',
        'KeyS': 's',
        'KeyD': 'd'
    };

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const k = wasdKeyMap[e.code];
        if (k) {
            pressedKeys.add(k);
            const el = document.getElementById(`_key_${k}`);
            if (el) el.classList.add('pressed');
        }
    }, false);

    document.addEventListener('keyup', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const k = wasdKeyMap[e.code];
        if (k) {
            pressedKeys.delete(k);
            const el = document.getElementById(`_key_${k}`);
            if (el) el.classList.remove('pressed');
        }
    }, false);

    // ==========================================
    // 2. Zoom Hack Logic
    // ==========================================
    const zoomConfig = {
        scale: 1,
        minScale: 0.35
    };

    let styleElement = null;

    function injectZoomStyles() {
        if (styleElement) return;
        styleElement = document.createElement('style');
        styleElement.textContent = `
            html.browser-squeezed {
                background: #2d2d2d !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
                overflow-x: hidden !important;
                overflow-y: auto !important;
            }
            html.browser-squeezed body {
                transform-origin: center center !important;
                width: 100% !important;
                margin: 0 !important;
                background: white !important;
                box-shadow: 0 0 30px rgba(0,0,0,0.5) !important;
                transition: transform 0.2s ease !important;
            }
            html.browser-squeezed body::-webkit-scrollbar {
                width: 12px;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function setZoom(scale) {
        zoomConfig.scale = scale;
        if (scale === 1) {
            document.documentElement.classList.remove('browser-squeezed');
            document.body.style.transform = '';
        } else {
            injectZoomStyles();
            document.documentElement.classList.add('browser-squeezed');
            document.body.style.transform = `scale(1, ${scale})`;
        }
    }

    function toggleZoom() {
        if (zoomConfig.scale === 1) {
            setZoom(zoomConfig.minScale);
        } else {
            setZoom(1);
        }
    }

    // ==========================================
    // 3. LelyaHack Core Logic & Interface
    // ==========================================
    const API_URL = 'https://lelya-bot-1.onrender.com';
    const AUTH_STATUS_KEY = 'lelyahack_auth_status';
    const CONFIG_KEY = 'lelyahack_visual_config_v14';
    const HUD_CONFIG_KEY = 'lelyahack_hud_config_v3';
    const HUD_POS_KEY = 'lelyahack_hud_pos_v3';
    const HUD_MODAL_POS_KEY = 'lelyahack_hud_modal_pos_v2';
    const MAIN_MENU_POS_KEY = 'lelyahack_main_menu_pos_v1';
    const AUTOSWAP_CONFIG_KEY = 'lelyahack_autoswap_config_v3';
    const AUTOBOB_CONFIG_KEY = 'lelyahack_autobob_config_v1';
    const BINDS_CONFIG_KEY = 'lelyahack_binds_config_v2';

    let config = {
        theme: 'dark',
        brightness: 100,
        accent: '#a855f7',
        blur_effect: true,
        shadow_effect: true
    };

    let activeFunctions = {
        hud: true,
        auto_swap: true,
        auto_bob: true,
        zoom_hack: true,
        auto_e: true,
        building_helper: false
    };

    let hudElementsConfig = {
        memory: true,
        clock: true,
        autoe: true,
        logo: true,
        userid: true,
        keys: true,
        draggable: true
    };

    let autoSwapConfig = {
        bindKey: 'MouseRight',
        slot1: 'Digit8',
        slot2: 'Digit7'
    };

    let autoBobConfig = {
        bindKey: 'KeyB',
        bobSlot: 'Digit9',
        returnSlot: 'Digit1'
    };

    let bindsConfig = {
        autoEKey: 'KeyE',
        zoomKey: 'NumpadAdd',
        buildKey: 'KeyF',
        speedMultiplier: 250
    };

    let hudPositions = {};
    let hudModalPos = null;
    let mainMenuPos = null;

    try {
        const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
        config = { ...config, ...saved };
        const savedFuncs = JSON.parse(localStorage.getItem('lelyahack_funcs') || '{}');
        activeFunctions = { ...activeFunctions, ...savedFuncs };
        const savedHudConf = JSON.parse(localStorage.getItem(HUD_CONFIG_KEY) || '{}');
        hudElementsConfig = { ...hudElementsConfig, ...savedHudConf };
        const savedHudPos = JSON.parse(localStorage.getItem(HUD_POS_KEY) || '{}');
        hudPositions = { ...savedHudPos };
        hudModalPos = JSON.parse(localStorage.getItem(HUD_MODAL_POS_KEY) || 'null');
        mainMenuPos = JSON.parse(localStorage.getItem(MAIN_MENU_POS_KEY) || 'null');
        const savedSwap = JSON.parse(localStorage.getItem(AUTOSWAP_CONFIG_KEY) || '{}');
        autoSwapConfig = { ...autoSwapConfig, ...savedSwap };
        const savedBob = JSON.parse(localStorage.getItem(AUTOBOB_CONFIG_KEY) || '{}');
        autoBobConfig = { ...autoBobConfig, ...savedBob };
        const savedBinds = JSON.parse(localStorage.getItem(BINDS_CONFIG_KEY) || '{}');
        bindsConfig = { ...bindsConfig, ...savedBinds };
    } catch(e) {}

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener("mousemove", (event) => {
        cursorX = event.clientX;
        cursorY = event.clientY;
    });

    function pressKeyFromCode(code) {
        let keyChar = code.replace('Digit', '');
        let keyCode = parseInt(keyChar) + 48;
        if (code === 'Digit0') { keyChar = '0'; keyCode = 48; }
        const eventOptions = {
            key: keyChar,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        };
        window.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
        window.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
    }

    async function clickAtCursor() {
        const element = document.elementFromPoint(cursorX, cursorY);
        if (!element || element.closest(".menu, .ui, .disabled")) return;
        const eventOptions = {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: cursorX,
            clientY: cursorY
        };
        element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        await delay(30);
        element.dispatchEvent(new MouseEvent("mouseup", eventOptions));
    }

    let isSwapActive = false;
    let swapActionRunning = false;

    async function performSwapActions() {
        if (swapActionRunning || !activeFunctions.auto_swap) return;
        swapActionRunning = true;
        while (isSwapActive && activeFunctions.auto_swap) {
            pressKeyFromCode(autoSwapConfig.slot1);
            await delay(62);
            await clickAtCursor();
            pressKeyFromCode(autoSwapConfig.slot2);
            await delay(374);
        }
        swapActionRunning = false;
    }

    let isBobRunning = false;

    async function performBobAction() {
        if (isBobRunning || !activeFunctions.auto_bob) return;

        isBobRunning = true;

        try {
            pressKeyFromCode(autoBobConfig.bobSlot);
            await delay(55);
            await clickAtCursor();
            await delay(25);
            pressKeyFromCode(autoBobConfig.returnSlot);
        } finally {
            isBobRunning = false;
        }
    }

    function sendChatMessage(text) {
        if (!text) return;

        if (window.dynast && window.dynast.chat) {
            try {
                window.dynast.chat.send(text);
                return;
            } catch(e) {}
        }

        const chatInput = document.querySelector('#chat-input, .chat-input, input[type="text"]');
        if (chatInput) {
            const lastActive = document.activeElement;
            chatInput.value = text;
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            chatInput.dispatchEvent(new Event('change', { bubbles: true }));

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true });
            chatInput.dispatchEvent(enterEvent);
            window.dispatchEvent(enterEvent);

            if (lastActive && typeof lastActive.blur === 'function') {
                lastActive.blur();
            }
            chatInput.blur();
        }
    }

    document.addEventListener('mouseup', () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
            showTextPromptMenu(selectedText);
        }
    });

    function showTextPromptMenu(text) {
        let existing = document.getElementById('_lelya_prompt_menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = '_lelya_prompt_menu';
        menu.style.cssText = `position:fixed; top:${cursorY + 10}px; left:${cursorX + 10}px; background:rgba(13, 18, 15, 0.95); border:1px solid var(--accent-color, #a855f7); backdrop-filter:blur(16px); border-radius:10px; padding:10px; z-index:2147483647; color:#fff; font-family:'Venus Rising', sans-serif; box-shadow:0 5px 20px rgba(0,0,0,0.5);`;
        menu.innerHTML = `
            <div style="font-size:9px; color:#aaa; margin-bottom:6px;">Действие с текстом:</div>
            <div style="font-size:10px; font-weight:bold; color:#fff; margin-bottom:8px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${text}"</div>
            <button id="_prompt_send_chat" style="width:100%; padding:6px; background:var(--accent-color, #a855f7); border:none; border-radius:6px; color:#fff; font-size:9px; font-weight:bold; cursor:pointer; margin-bottom:4px;">Отправить в чат</button>
            <button id="_prompt_copy" style="width:100%; padding:6px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; color:#ccc; font-size:9px; cursor:pointer;">Копировать</button>
        `;
        document.body.appendChild(menu);

        document.getElementById('_prompt_send_chat').onclick = () => {
            sendChatMessage(text);
            menu.remove();
        };
        document.getElementById('_prompt_copy').onclick = () => {
            navigator.clipboard.writeText(text);
            menu.remove();
        };

        setTimeout(() => {
            document.addEventListener('click', function hideMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', hideMenu);
                }
            });
        }, 100);
    }

    let isAutoEActive = false;

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (activeFunctions.auto_e && e.code === bindsConfig.autoEKey && !isAutoEActive) {
            isAutoEActive = true;
            startAutoE();
        }

        if (activeFunctions.building_helper && e.code === bindsConfig.buildKey && !isBuildingActive) {
            startBuildingHelper();
        }

        if (activeFunctions.zoom_hack) {
            if (e.code === bindsConfig.zoomKey) {
                e.preventDefault();
                toggleZoom();
            } else if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
                e.preventDefault();
                setZoom(zoomConfig.minScale);
            } else if (e.key === '-' || e.code === 'NumpadSubtract') {
                e.preventDefault();
                setZoom(1);
            }
        }

        if (e.code === autoSwapConfig.bindKey && !isSwapActive) {
            isSwapActive = true;
            performSwapActions();
        }

        if (e.code === autoBobConfig.bindKey) {
            performBobAction();
        }
    }, true);

    document.addEventListener('keyup', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === bindsConfig.autoEKey) {
            isAutoEActive = false;
            stopAutoE();
        }

        if (e.code === bindsConfig.buildKey) {
            stopBuildingHelper();
        }

        if (e.code === autoSwapConfig.bindKey) {
            isSwapActive = false;
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        let mouseCode = e.button === 2 ? 'MouseRight' : (e.button === 0 ? 'MouseLeft' : 'MouseMiddle');

        if (activeFunctions.auto_e && mouseCode === bindsConfig.autoEKey && !isAutoEActive) {
            isAutoEActive = true;
            startAutoE();
        }

        if (activeFunctions.building_helper && mouseCode === bindsConfig.buildKey && !isBuildingActive) {
            startBuildingHelper();
        }

        if (activeFunctions.zoom_hack && mouseCode === bindsConfig.zoomKey) {
            toggleZoom();
        }

        if (mouseCode === autoSwapConfig.bindKey && !isSwapActive) {
            isSwapActive = true;
            performSwapActions();
        }

        if (mouseCode === autoBobConfig.bindKey) {
            performBobAction();
        }
    });

    document.addEventListener('mouseup', (e) => {
        let mouseCode = e.button === 2 ? 'MouseRight' : (e.button === 0 ? 'MouseLeft' : 'MouseMiddle');

        if (mouseCode === bindsConfig.autoEKey) {
            isAutoEActive = false;
            stopAutoE();
        }

        if (mouseCode === bindsConfig.buildKey) {
            stopBuildingHelper();
        }

        if (mouseCode === autoSwapConfig.bindKey) {
            isSwapActive = false;
        }
    });

    window.addEventListener('contextmenu', (e) => {
        if (autoSwapConfig.bindKey === 'MouseRight' || autoBobConfig.bindKey === 'MouseRight' || bindsConfig.autoEKey === 'MouseRight' || bindsConfig.zoomKey === 'MouseRight' || bindsConfig.buildKey === 'MouseRight') {
            e.preventDefault();
        }
    });

    let hwid = GM_getValue('lelyahack_user_hwid');
    if (!hwid) {
        hwid = 'HWID-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        GM_setValue('lelyahack_user_hwid', hwid);
    }

    let username = GM_getValue('lelyahack_username', 'LelyaUser');

    let firstLoginTime = GM_getValue('lelyahack_first_login');
    if (!firstLoginTime) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const time = now.toTimeString().split(' ')[0];
        firstLoginTime = `${d}.${m}.${y} ${time}`;
        GM_setValue('lelyahack_first_login', firstLoginTime);
    }

    let sessionStartRealTime = nativePerformanceNow();
    let nowSessionDate = new Date();
    let sessionStartTimeStr = String(nowSessionDate.getHours()).padStart(2, '0') + ':' + String(nowSessionDate.getMinutes()).padStart(2, '0');

    let userKey = GM_getValue('lelyahack_user_key', '');
    if (localStorage.getItem(AUTH_STATUS_KEY) !== 'true' || !userKey) {
        window.addEventListener('DOMContentLoaded', showAuthModal);
        if (document.body) showAuthModal();
        else window.addEventListener('load', showAuthModal);
        return;
    } else {
        verifyKey(true);
        window.addEventListener('DOMContentLoaded', initLelyaMenu);
        if (document.body) initLelyaMenu();
    }

    function verifyKey(silent = false) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: API_URL + '/verify?hwid=' + hwid + '&key=' + userKey,
            timeout: 10000,
            onload: function(res) {
                try {
                    let data = JSON.parse(res.responseText);
                   if (data.status === 'banned') {
                        localStorage.removeItem(AUTH_STATUS_KEY);
                        GM_setValue('lelyahack_user_key', '');
                        document.body.innerHTML = '<h1 style="color:red; text-align:center; margin-top:20vh; font-family:\'Venus Rising\', sans-serif;">ACCESS DENIED (BANNED)</h1>';
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    } else if (data.status === 'invalid' || data.status === 'expired') {
                        localStorage.removeItem(AUTH_STATUS_KEY);
                        GM_setValue('lelyahack_user_key', '');
                        location.reload();
                    }
                } catch(e) {}
            }
        });
    }

    function showAuthModal() {
        if (document.getElementById('_lelya_auth_div')) return;
        const div = document.createElement('div');
        div.id = '_lelya_auth_div';
        div.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(16px); z-index:2147483647; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Venus Rising\', sans-serif; color:#fff; zoom: 1 !important;';
        div.innerHTML = `
            <div style="background:rgba(11,16,13,0.95); padding:30px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 0 40px rgba(0,0,0,0.9); text-align:center; max-width:380px; width:100%;">
                <h2 style="margin-top:0; color:#fff; font-size:16px; font-weight:800; letter-spacing:2px; margin-bottom:5px; font-family:\'Venus Rising\', sans-serif;">LELYAHACK</h2>
                <p style="font-size:10px; color:#888; margin-bottom:10px;">Ваш HWID:</p>
                <div style="background:rgba(5,8,6,0.8); padding:8px; border:1px dashed rgba(255,255,255,0.15); border-radius:8px; font-family:monospace; font-size:11px; color:#ccc; margin-bottom:12px; user-select:text;">` + hwid + `</div>
                <input type="text" id="_lelya_name_inp" placeholder="Введите ваш никнейм..." value="` + username + `" style="width:100%; padding:10px; background:rgba(18,24,20,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:11px; margin-bottom:10px; outline:none; box-sizing:border-box; font-family:\'Venus Rising\', sans-serif;">
                <input type="text" id="_lelya_key_inp" placeholder="Введите ключ активации..." style="width:100%; padding:10px; background:rgba(18,24,20,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:11px; margin-bottom:12px; outline:none; box-sizing:border-box; font-family:\'Venus Rising\', sans-serif;">
                <button id="_lelya_sub_btn" style="width:100%; padding:11px; background:var(--accent-color, #a855f7); border:none; border-radius:8px; color:#fff; font-weight:600; cursor:pointer; font-size:11px; font-family:\'Venus Rising\', sans-serif;">АКТИВИРОВАТЬ</button>
                <button id="_lelya_get_btn" style="width:100%; margin-top:8px; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#aaa; cursor:pointer; font-size:10px; font-family:\'Venus Rising\', sans-serif;">🛒 ПОЛУЧИТЬ КЛЮЧ У БОТА</button>
                <div id="_lelya_auth_msg" style="font-size:9px; color:#888; margin-top:10px; min-height:15px;"></div>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('_lelya_get_btn').onclick = () => window.open('https://t.me/lelyahackbot?start=auth_' + hwid, '_blank');

        document.getElementById('_lelya_sub_btn').onclick = () => {
            const k = document.getElementById('_lelya_key_inp').value.trim();
            const n = document.getElementById('_lelya_name_inp').value.trim();
            if (!k) return alert('Введите ключ!');
            if (n) {
                username = n;
                GM_setValue('lelyahack_username', username);
            }
            const msg = document.getElementById('_lelya_auth_msg');
            msg.innerText = '⏳ Проверка ключа...';

            GM_xmlhttpRequest({
                method: 'GET',
                url: API_URL + '/verify?hwid=' + hwid + '&key=' + k,
                timeout: 15000,
                onload: function(res) {
                    try {
                        let data = JSON.parse(res.responseText);
                        if (data.status === 'success') {
                            localStorage.setItem(AUTH_STATUS_KEY, 'true');
                            GM_setValue('lelyahack_user_key', k);
                            userKey = k;
                            div.style.opacity = '0';
                            setTimeout(() => div.remove(), 300);
                            initLelyaMenu();
                        } else {
                            msg.innerText = '';
                            alert('Ошибка: ' + (data.message || 'Неверный ключ'));
                        }
                    } catch(e) {
                        msg.innerText = '';
                        alert('Ошибка обработки ответа сервера');
                    }
                },
                onerror: () => { msg.innerText = ''; alert('Не удалось подключиться к серверу.'); }
            });
        };
    }

    function makeDraggable(element, handle, onSavePos) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const dragHandle = handle || element;
        dragHandle.style.cursor = 'move';
        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.button !== 0) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const newTop = (element.offsetTop - pos2);
            const newLeft = (element.offsetLeft - pos1);

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.transform = "none";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            if (onSavePos) {
                onSavePos(element.style.top, element.style.left);
            }
        }
    }

    function initLelyaMenu() {
        if (document.getElementById('_lelya_root')) return;
        GM_addStyle(`
            @font-face {
                font-family: 'Venus Rising';
                src: url('https://fonts.cdnfonts.com/s/17587/venus_rising_rg.woff') format('woff');
                font-weight: normal;
                font-style: normal;
            }

            @keyframes lelyaFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes lelyaGlowAnimation {
                0% { background-position: 0% 50%; text-shadow: 0 0 10px var(--accent-color, #a855f7); }
                50% { background-position: 100% 50%; text-shadow: 0 0 25px var(--accent-color, #a855f7), 0 0 35px #ec4899; }
                100% { background-position: 0% 50%; text-shadow: 0 0 10px var(--accent-color, #a855f7); }
            }

            .lelya-accent-title {
                background: linear-gradient(90deg, var(--accent-color, #a855f7), #ec4899, #3b82f6, var(--accent-color, #a855f7));
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: lelyaGlowAnimation 4s ease infinite;
                transition: all 0.3s ease;
            }

            #_lelya_root, #_lelya_hud_settings_modal, #_lelya_autoswap_modal, #_lelya_autobob_modal, #_lelya_autoe_modal, #_lelya_zoom_modal, #_lelya_building_modal, #_lelya_hud_container {
                zoom: 1 !important;
            }

            #_lelya_root *, #_lelya_hud_settings_modal *, #_lelya_autoswap_modal *, #_lelya_autobob_modal *, #_lelya_autoe_modal *, #_lelya_zoom_modal *, #_lelya_building_modal *, #_lelya_hud_container * {
                box-sizing: border-box;
                font-family: 'Venus Rising', sans-serif !important;
                user-select: none;
            }
            #_lelya_root ::-webkit-scrollbar { width: 5px; }
            #_lelya_root ::-webkit-scrollbar-track { background: transparent; }
            #_lelya_root ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

            .lelya-tab-btn { background: transparent; border: none; color: var(--tab-text-color, #a1a1aa); padding: 6px 16px; font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; }
            .lelya-tab-btn:hover { color: var(--text-color, #fff); background: rgba(255,255,255,0.05); }
            .lelya-tab-btn.active { background: var(--tab-active-bg); color: var(--accent-color, #a855f7); border: 1px solid var(--tab-active-border); }

            .lelya-color-dot { width: 28px; height: 28px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; }
            .lelya-color-dot:hover { transform: scale(1.08); }
            .lelya-color-dot.active { border-color: #fff; transform: scale(1.12); box-shadow: 0 0 12px rgba(255,255,255,0.3); }

            .lelya-card { background: var(--card-bg, rgba(18, 24, 20, 0.6)); border: 1px solid var(--card-border, rgba(255, 255, 255, 0.05)); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; position: relative; cursor: pointer; min-height: 130px; }
            .lelya-card:hover { border-color: var(--card-hover-border); transform: translateY(-2px); }
            .lelya-card.active-card { background: var(--card-active-bg); border-color: var(--accent-color); box-shadow: 0 0 30px var(--card-glow); }

            .lelya-func-gear { width: 26px; height: 26px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #a1a1aa; cursor: pointer; transition: background 0.2s, color 0.2s; font-size: 11px; }
            .lelya-func-gear:hover { background: rgba(255,255,255,0.15); color: var(--text-color, #fff); }

            .lelya-func-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }

            .lelya-misc-card { background: var(--card-bg, rgba(18, 24, 20, 0.6)); border: 1px solid var(--card-border, rgba(255, 255, 255, 0.05)); border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column; justify-content: center; transition: all 0.2s ease; cursor: pointer; }
            .lelya-misc-card:hover { border-color: var(--card-hover-border); background: var(--card-active-bg); }

            .lelya-switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
            .lelya-switch input { opacity: 0; width: 0; height: 0; }
            .lelya-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--switch-bg, rgba(255,255,255,0.15)); transition: .3s; border-radius: 24px; border: 1px solid var(--switch-border, rgba(255,255,255,0.2)); }
            .lelya-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: #fff; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
            .lelya-switch input:checked + .lelya-slider { background-color: var(--accent-color, #a855f7) !important; border-color: var(--accent-color, #a855f7) !important; box-shadow: 0 0 14px var(--accent-color, #a855f7); }
            .lelya-switch input:checked + .lelya-slider:before { transform: translateX(20px); background-color: #fff; }

            .lelya-hud-item { position: fixed; z-index: 2147483640; }
            .lelya-hud-box { background: rgba(13, 18, 15, 0.75); border: 1px solid var(--accent-border, rgba(255, 255, 255, 0.08)); backdrop-filter: blur(12px); border-radius: 12px; padding: 12px; color: #fff; min-width: 180px; transition: border-color 0.3s ease, box-shadow 0.3s ease; }

            .lelya-keys-box { display: flex; flex-direction: column; align-items: center; gap: 6px; }
            .lelya-key-row { display: flex; gap: 6px; }
            .lelya-key { width: 38px; height: 38px; background: rgba(11, 15, 13, 0.65); border: 1px solid var(--accent-border, rgba(255, 255, 255, 0.15)); backdrop-filter: blur(8px); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #e4e4e7; transition: all 0.1s ease; }
            .lelya-key.pressed { background: var(--accent-color, #a855f7) !important; border-color: var(--accent-color, #a855f7) !important; color: #fff; box-shadow: 0 0 15px var(--card-glow, rgba(168,85,247,0.7)); transform: scale(0.95); }

            #_lelya_hud_settings_modal, #_lelya_autoswap_modal, #_lelya_autobob_modal, #_lelya_autoe_modal, #_lelya_zoom_modal, #_lelya_building_modal {
                position: fixed;
                top: calc(50% - 225px);
                left: calc(50% - 460px - 330px);
                width: 320px;
                background: var(--modal-bg, rgba(13, 18, 15, 0.95));
                border: 1px solid var(--modal-border, rgba(255, 255, 255, 0.1));
                backdrop-filter: blur(25px);
                border-radius: 18px;
                padding: 22px;
                z-index: 2147483647;
                display: none;
                flex-direction: column;
                color: var(--modal-text, #fff);
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .lelya-chart-card {
                background: var(--card-bg, rgba(18, 24, 20, 0.6));
                border: 1px solid var(--card-border, rgba(255, 255, 255, 0.05));
                border-radius: 14px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;
            }

            .lelya-inp-btn {
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px;
                color: #fff;
                padding: 8px 12px;
                font-size: 10px;
                cursor: pointer;
                outline: none;
                text-align: center;
                transition: all 0.2s;
            }
            .lelya-inp-btn:hover {
                border-color: var(--accent-color, #a855f7);
            }
            .lelya-slot-select {
                background: rgba(18, 24, 20, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #fff;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 10px;
                outline: none;
                cursor: pointer;
            }
        `);

        // HUD Container
        const hudContainer = document.createElement('div');
        hudContainer.id = '_lelya_hud_container';
        hudContainer.style.display = activeFunctions.hud ? 'block' : 'none';
        hudContainer.innerHTML = `
            <div id="_hud_item_memory" class="lelya-hud-item" style="display:${hudElementsConfig.memory ? 'block' : 'none'};">
                <div class="lelya-hud-box">
                    <div style="font-size: 8px; font-weight: 700; color: #a1a1aa; letter-spacing: 1px; margin-bottom: 2px;">ПАМЯТЬ БРАУЗЕРА</div>
                    <div id="_hud_memory" style="font-size: 16px; font-weight: 800;">-- МБ</div>
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                        <div id="_hud_mem_bar" style="width: 0%; height: 100%; background: var(--accent-color, #a855f7); border-radius: 2px; transition: width 0.3s ease, background-color 0.3s ease;"></div>
                    </div>
                    <div id="_hud_mem_sub" style="font-size: 8px; color: #d4d4d8; margin-top: 4px; font-weight: 600;">0% из 4096 МБ</div>
                </div>
            </div>

            <div id="_hud_item_clock" class="lelya-hud-item" style="display:${hudElementsConfig.clock ? 'block' : 'none'};">
                <div class="lelya-hud-box" style="padding: 10px 14px;">
                    <div id="_hud_clock" style="font-size: 15px; font-weight: 800; letter-spacing: 1px;">00:00:00</div>
                </div>
            </div>

            <div id="_hud_item_autoe" class="lelya-hud-item" style="display:${hudElementsConfig.autoe ? 'block' : 'none'};">
                <div class="lelya-hud-box" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px #ef4444;" id="_hud_autoe_dot"></div>
                    <div style="font-size: 10px; font-weight: 700; color: #e4e4e7;">AutoE Status: <span id="_hud_autoe_txt" style="color: #ef4444; font-size: 9px;">OFF</span></div>
                </div>
            </div>

            <div id="_hud_item_logo" class="lelya-hud-item" style="display:${hudElementsConfig.logo ? 'block' : 'none'};">
                <div class="lelya-hud-box" style="padding: 10px 14px;">
                    <div style="font-weight: 900; font-size: 13px; letter-spacing: 0.5px;" class="lelya-accent-title">LelyaHack</div>
                    <div style="font-size: 8px; color: #a1a1aa; font-weight: 700; margin-top: 1px;">BRAND V2.9.0</div>
                </div>
            </div>

            <div id="_hud_item_userid" class="lelya-hud-item" style="display:${hudElementsConfig.userid ? 'block' : 'none'};">
                <div class="lelya-hud-box" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px;">
                    <div style="width: 18px; height: 18px; border-radius: 50%; background: var(--accent-glow-bg, rgba(168, 85, 247, 0.25)); border: 1px solid var(--accent-color, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 9px; color: var(--accent-color, #a855f7); font-weight: 800; transition: all 0.3s ease;" id="_hud_user_icon">!</div>
                    <div style="font-size: 9px; color: #d4d4d8; font-weight: 700;">User: <span id="_hud_user_id" style="color: #fff; font-size: 9px;">${username}</span></div>
                </div>
            </div>

            <div id="_hud_item_keys" class="lelya-hud-item" style="display:${hudElementsConfig.keys ? 'block' : 'none'};">
                <div class="lelya-keys-box">
                    <div class="lelya-key-row"><div class="lelya-key" id="_key_w">W</div></div>
                    <div class="lelya-key-row">
                        <div class="lelya-key" id="_key_a">A</div>
                        <div class="lelya-key" id="_key_s">S</div>
                        <div class="lelya-key" id="_key_d">D</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(hudContainer);

        const defaultHudPositions = {
            _hud_item_memory: { top: '20px', left: '20px' },
            _hud_item_clock: { top: '150px', left: '20px' },
            _hud_item_autoe: { top: '215px', left: '20px' },
            _hud_item_logo: { top: '280px', left: '20px' },
            _hud_item_userid: { top: '350px', left: '20px' },
            _hud_item_keys: { top: '415px', left: '20px' }
        };

        function applyHudPositions() {
            Object.keys(defaultHudPositions).forEach(id => {
                const item = document.getElementById(id);
                if (item) {
                    const pos = hudPositions[id] || defaultHudPositions[id];
                    item.style.top = pos.top;
                    item.style.left = pos.left;
                    item.style.transform = "none";
                }
            });
        }
        applyHudPositions();

        function initHudDraggable() {
            Object.keys(defaultHudPositions).forEach(id => {
                const item = document.getElementById(id);
                if (item) {
                    if (hudElementsConfig.draggable) {
                        makeDraggable(item, null, (top, left) => {
                            hudPositions[id] = { top, left };
                            localStorage.setItem(HUD_POS_KEY, JSON.stringify(hudPositions));
                        });
                    } else {
                        item.onmousedown = null;
                        item.style.cursor = 'default';
                    }
                }
            });
        }
        initHudDraggable();

        // HUD Settings Modal
        const hudModal = document.createElement('div');
        hudModal.id = '_lelya_hud_settings_modal';
        if (hudModalPos) {
            hudModal.style.top = hudModalPos.top;
            hudModal.style.left = hudModalPos.left;
            hudModal.style.transform = 'none';
        }
        hudModal.innerHTML = `
            <div id="_lelya_hud_settings_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">HUD</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">ВИДЖЕТЫ НА ЭКРАНЕ</div>
                </div>
                <button id="_hud_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">Память браузера <label class="lelya-switch"><input type="checkbox" id="_chk_hud_memory" ${hudElementsConfig.memory ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">Часы <label class="lelya-switch"><input type="checkbox" id="_chk_hud_clock" ${hudElementsConfig.clock ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">AutoE Статус <label class="lelya-switch"><input type="checkbox" id="_chk_hud_autoe" ${hudElementsConfig.autoe ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">LelyaHack Бренд <label class="lelya-switch"><input type="checkbox" id="_chk_hud_logo" ${hudElementsConfig.logo ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">User ID <label class="lelya-switch"><input type="checkbox" id="_chk_hud_userid" ${hudElementsConfig.userid ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">Клавиши передвижения <label class="lelya-switch"><input type="checkbox" id="_chk_hud_keys" ${hudElementsConfig.keys ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
                <div style="height: 1px; background: var(--border-color, rgba(255,255,255,0.06)); margin: 2px 0;"></div>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--modal-text, #e4e4e7); font-weight: 600; cursor: pointer;">Съемные блоки <label class="lelya-switch"><input type="checkbox" id="_chk_hud_draggable" ${hudElementsConfig.draggable ? 'checked' : ''}><span class="lelya-slider"></span></label></label>
            </div>
            <div style="margin-top: 18px;">
                <button id="_hud_reset_pos" style="width: 100%; padding: 10px; background: var(--btn-bg, rgba(255,255,255,0.04)); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 10px; color: var(--modal-text, #fff); font-weight: 700; cursor: pointer; font-size: 10px;">Сброс позиций</button>
            </div>
        `;
        document.body.appendChild(hudModal);

        makeDraggable(hudModal, document.getElementById('_lelya_hud_settings_header'), (top, left) => {
            hudModalPos = { top, left };
            localStorage.setItem(HUD_MODAL_POS_KEY, JSON.stringify(hudModalPos));
        });

        document.getElementById('_hud_modal_close').onclick = () => {
            hudModal.style.display = 'none';
        };

        // Auto Swap Modal
        const swapModal = document.createElement('div');
        swapModal.id = '_lelya_autoswap_modal';
        swapModal.innerHTML = `
            <div id="_lelya_autoswap_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">AUTO SWAP</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">ВЫБОР СЛОТОВ И БИНДА</div>
                </div>
                <button id="_swap_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Клавиша (Бинд):</span>
                    <button class="lelya-inp-btn" id="_swap_bind_key_btn">${autoSwapConfig.bindKey}</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Первый слот:</span>
                    <button class="lelya-inp-btn" id="_swap_slot1_btn">${autoSwapConfig.slot1}</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Второй слот:</span>
                    <button class="lelya-inp-btn" id="_swap_slot2_btn">${autoSwapConfig.slot2}</button>
                </div>
            </div>
        `;
        document.body.appendChild(swapModal);
        makeDraggable(swapModal, document.getElementById('_lelya_autoswap_header'));
        document.getElementById('_swap_modal_close').onclick = () => { swapModal.style.display = 'none'; };

        // Auto Bob Modal
        const bobModal = document.createElement('div');
        bobModal.id = '_lelya_autobob_modal';
        let slotsOptions = '';
        for (let i = 1; i <= 10; i++) {
            let digitCode = i === 10 ? 'Digit0' : `Digit${i}`;
            slotsOptions += `<option value="${digitCode}">Слот ${i}</option>`;
        }
        bobModal.innerHTML = `
            <div id="_lelya_autobob_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">AUTO BOB</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">АВТОМАТИЧЕСКИЙ БОБ</div>
                </div>
                <button id="_bob_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Клавиша (Бинд):</span>
                    <button class="lelya-inp-btn" id="_bob_bind_key_btn">${autoBobConfig.bindKey}</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Слот с Бобом (1-10):</span>
                    <select id="_bob_slot_sel" class="lelya-slot-select">${slotsOptions}</select>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Возврат на слот (1-10):</span>
                    <select id="_return_slot_sel" class="lelya-slot-select">${slotsOptions}</select>
                </div>
            </div>
        `;
        document.body.appendChild(bobModal);
        makeDraggable(bobModal, document.getElementById('_lelya_autobob_header'));
        document.getElementById('_bob_modal_close').onclick = () => { bobModal.style.display = 'none'; };

        const bobSlotSel = document.getElementById('_bob_slot_sel');
        const returnSlotSel = document.getElementById('_return_slot_sel');
        bobSlotSel.value = autoBobConfig.bobSlot;
        returnSlotSel.value = autoBobConfig.returnSlot;

        bobSlotSel.onchange = (e) => {
            autoBobConfig.bobSlot = e.target.value;
            localStorage.setItem(AUTOBOB_CONFIG_KEY, JSON.stringify(autoBobConfig));
        };

        returnSlotSel.onchange = (e) => {
            autoBobConfig.returnSlot = e.target.value;
            localStorage.setItem(AUTOBOB_CONFIG_KEY, JSON.stringify(autoBobConfig));
        };

        // Auto E Modal
        const autoEModal = document.createElement('div');
        autoEModal.id = '_lelya_autoe_modal';
        autoEModal.innerHTML = `
            <div id="_lelya_autoe_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">AUTO E</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">ПОДБОР И УСКОРЕНИЕ</div>
                </div>
                <button id="_autoe_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Бинд Auto E:</span>
                    <button class="lelya-inp-btn" id="_bind_autoe_btn">${bindsConfig.autoEKey}</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 9px; font-weight: 700;">Множитель скорости:</span>
                        <span id="_autoe_speed_val" style="font-size: 9px; color: #888; font-weight: 700;">${bindsConfig.speedMultiplier}x</span>
                    </div>
                    <input type="range" id="_autoe_speed_inp" min="1" max="1000" value="${bindsConfig.speedMultiplier}" style="width: 100%; cursor: pointer;">
                </div>
            </div>
        `;
        document.body.appendChild(autoEModal);
        makeDraggable(autoEModal, document.getElementById('_lelya_autoe_header'));
        document.getElementById('_autoe_modal_close').onclick = () => { autoEModal.style.display = 'none'; };

        const autoESpeedInp = document.getElementById('_autoe_speed_inp');
        autoESpeedInp.oninput = (e) => {
            bindsConfig.speedMultiplier = parseInt(e.target.value);
            document.getElementById('_autoe_speed_val').innerText = bindsConfig.speedMultiplier + 'x';
            localStorage.setItem(BINDS_CONFIG_KEY, JSON.stringify(bindsConfig));
        };

        // Building Helper Modal
        const buildingModal = document.createElement('div');
        buildingModal.id = '_lelya_building_modal';
        buildingModal.innerHTML = `
            <div id="_lelya_building_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">BUILDING HELPER</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">БЫСТРАЯ ПОСТРОЙКА</div>
                </div>
                <button id="_building_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Бинд постройки:</span>
                    <button class="lelya-inp-btn" id="_bind_building_btn">${bindsConfig.buildKey}</button>
                </div>
            </div>
        `;
        document.body.appendChild(buildingModal);
        makeDraggable(buildingModal, document.getElementById('_lelya_building_header'));
        document.getElementById('_building_modal_close').onclick = () => { buildingModal.style.display = 'none'; };

        // Zoom Hack Modal
        const zoomModal = document.createElement('div');
        zoomModal.id = '_lelya_zoom_modal';
        zoomModal.innerHTML = `
            <div id="_lelya_zoom_header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color, rgba(255,255,255,0.06)); padding-bottom:10px;">
                <div>
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Настройки <span style="color: var(--accent-color, #a855f7);">ZOOM HACK</span></div>
                    <div style="font-size: 8px; color: var(--accent-color, #a855f7); font-weight: 700; letter-spacing: 1px; margin-top: 2px;">ОТДАЛЕНИЕ КАМЕРЫ</div>
                </div>
                <button id="_zoom_modal_close" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; font-weight: 700;">Бинд Zoom Hack:</span>
                    <button class="lelya-inp-btn" id="_bind_zoom_btn">${bindsConfig.zoomKey}</button>
                </div>
            </div>
        `;
        document.body.appendChild(zoomModal);
        makeDraggable(zoomModal, document.getElementById('_lelya_zoom_header'));
        document.getElementById('_zoom_modal_close').onclick = () => { zoomModal.style.display = 'none'; };

        function bindKeyPicker(btnId, configKey, configObj, storageKey) {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.onclick = () => {
                btn.innerText = 'Нажмите...';

                const keyHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    configObj[configKey] = e.code;
                    localStorage.setItem(storageKey, JSON.stringify(configObj));
                    btn.innerText = e.code;
                    cleanupListeners();
                };

                const mouseHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let mCode = e.button === 2 ? 'MouseRight' : (e.button === 0 ? 'MouseLeft' : 'MouseMiddle');
                    configObj[configKey] = mCode;
                    localStorage.setItem(storageKey, JSON.stringify(configObj));
                    btn.innerText = mCode;
                    cleanupListeners();
                };

                function cleanupListeners() {
                    window.removeEventListener('keydown', keyHandler, true);
                    window.removeEventListener('mousedown', mouseHandler, true);
                }

                window.addEventListener('keydown', keyHandler, true);
                window.addEventListener('mousedown', mouseHandler, true);
            };
        }

        bindKeyPicker('_swap_bind_key_btn', 'bindKey', autoSwapConfig, AUTOSWAP_CONFIG_KEY);
        bindKeyPicker('_swap_slot1_btn', 'slot1', autoSwapConfig, AUTOSWAP_CONFIG_KEY);
        bindKeyPicker('_swap_slot2_btn', 'slot2', autoSwapConfig, AUTOSWAP_CONFIG_KEY);

        bindKeyPicker('_bob_bind_key_btn', 'bindKey', autoBobConfig, AUTOBOB_CONFIG_KEY);

        bindKeyPicker('_bind_autoe_btn', 'autoEKey', bindsConfig, BINDS_CONFIG_KEY);
        bindKeyPicker('_bind_building_btn', 'buildKey', bindsConfig, BINDS_CONFIG_KEY);
        bindKeyPicker('_bind_zoom_btn', 'zoomKey', bindsConfig, BINDS_CONFIG_KEY);

        const hudCheckboxes = [
            { id: '_chk_hud_memory', key: 'memory', target: '_hud_item_memory' },
            { id: '_chk_hud_clock', key: 'clock', target: '_hud_item_clock' },
            { id: '_chk_hud_autoe', key: 'autoe', target: '_hud_item_autoe' },
            { id: '_chk_hud_logo', key: 'logo', target: '_hud_item_logo' },
            { id: '_chk_hud_userid', key: 'userid', target: '_hud_user_id' },
            { id: '_chk_hud_keys', key: 'keys', target: '_hud_item_keys' }
        ];

        hudCheckboxes.forEach(item => {
            const chk = document.getElementById(item.id);
            if (chk) {
                chk.onchange = (e) => {
                    hudElementsConfig[item.key] = e.target.checked;
                    localStorage.setItem(HUD_CONFIG_KEY, JSON.stringify(hudElementsConfig));
                    const targetEl = document.getElementById(item.target);
                    if (targetEl) targetEl.style.display = e.target.checked ? 'block' : 'none';
                };
            }
        });

        const chkDraggable = document.getElementById('_chk_hud_draggable');
        if (chkDraggable) {
            chkDraggable.onchange = (e) => {
                hudElementsConfig.draggable = e.target.checked;
                localStorage.setItem(HUD_CONFIG_KEY, JSON.stringify(hudElementsConfig));
                initHudDraggable();
            };
        }

        document.getElementById('_hud_reset_pos').onclick = () => {
            hudPositions = { ...defaultHudPositions };
            localStorage.removeItem(HUD_POS_KEY);
            applyHudPositions();
        };

        // Main Menu Window
        const root = document.createElement('div');
        root.id = '_lelya_root';
        root.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 920px; height: 620px; border-radius: 16px; z-index: 2147483646; display: flex; flex-direction: column; overflow: hidden; opacity: 1; animation: lelyaFadeIn 0.3s ease; transition: box-shadow 0.3s ease, border-color 0.3s ease;';

        if (mainMenuPos) {
            root.style.top = mainMenuPos.top;
            root.style.left = mainMenuPos.left;
            root.style.transform = 'none';
        }

        root.innerHTML = `
            <div id="_lelya_menu_header" style="cursor: move; padding: 22px 28px 16px 28px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06));">
                <div style="justify-self: start;">
                    <h1 class="lelya-accent-title" style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">LelyaHack</h1>
                    <span style="font-size: 8px; color: var(--desc-color, #a1a1aa); font-weight: 700; letter-spacing: 1px;">VERSION 2.9.0</span>
                </div>
                <div style="justify-self: center; display: flex; flex-direction: column; align-items: center;">
                    <div id="_lelya_clock" style="font-size: 20px; font-weight: 800; letter-spacing: 2px; line-height: 1.1;">00:00:00</div>
                    <div id="_lelya_date" style="font-size: 8px; color: var(--desc-color, #a1a1aa); font-weight: 700; text-transform: uppercase; margin-top: 2px;">--</div>
                </div>
                <div style="justify-self: end;">
                    <button id="_lelya_close_btn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; width: 26px; height: 26px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>
            </div>

            <div style="padding: 12px 28px; display: flex; justify-content: center; gap: 8px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06)); background: var(--tabs-bg, rgba(0,0,0,0.1));">
                <button class="lelya-tab-btn active" data-tab="functions">Функции</button>
                <button class="lelya-tab-btn" data-tab="visuals">Вид меню</button>
                <button class="lelya-tab-btn" data-tab="misc">Прочее</button>
                <button class="lelya-tab-btn" data-tab="session">Сеанс</button>
            </div>

            <div id="_lelya_content" style="flex: 1; padding: 24px 28px; overflow-y: auto; position: relative;">

                <div class="lelya-tab-pane" data-pane="functions" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
                    <div class="lelya-card" data-func="hud">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">HUD</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Виджеты с информацией на экране.</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="hud" title="Настройки HUD">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>

                    <div class="lelya-card" data-func="auto_swap">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">Auto Swap</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Автоматическая смена предметов по бинду.</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="auto_swap" title="Настройки Auto Swap">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>

                    <div class="lelya-card" data-func="auto_bob">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">Auto Bob</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Берет боб, наносит удар и возвращает на исходный слот.</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="auto_bob" title="Настройки Auto Bob">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>

                    <div class="lelya-card" data-func="auto_e">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">Auto E</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Автоматический подбор предметов с ускорением времени по бинду</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="auto_e" title="Настройки Auto E">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>

                    <div class="lelya-card" data-func="building_helper">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">Building Helper</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Зажимает Shift и спамит ЛКМ по удерживаемой кнопке.</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="building_helper" title="Настройки Building Helper">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>

                    <div class="lelya-card" data-func="zoom_hack">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="lelya-func-title">Zoom Hack</div>
                                <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); line-height: 1.4;">Отдаление экрана по кнопкам + / - (NumPad) или по бинду.</div>
                            </div>
                            <div class="lelya-func-gear" data-gear="zoom_hack" title="Настройки Zoom Hack">⚙️</div>
                        </div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #71717a); letter-spacing: 0.5px;">НАЖМИТЕ ДЛЯ ПЕРЕКЛЮЧЕНИЯ</div>
                    </div>
                </div>

                <div class="lelya-tab-pane" data-pane="visuals" style="display: none; flex-direction: column; gap: 20px; width: 100%;">
                    <div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); margin-bottom: 8px; letter-spacing: 1px;">ОСНОВНАЯ ТЕМА</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div id="_theme_dark" style="padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 10px; cursor: pointer; border: 1px solid var(--border-color, rgba(255,255,255,0.1));">Тёмная</div>
                            <div id="_theme_light" style="padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 10px; cursor: pointer; border: 1px solid var(--border-color, rgba(255,255,255,0.1));">Светлая</div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px;">ЯРКОСТЬ МЕНЮ</span>
                            <span id="_brightness_val" style="font-size: 9px; color: #888; font-weight: 700;">${config.brightness}%</span>
                        </div>
                        <input type="range" id="_lelya_brightness" min="20" max="100" value="${config.brightness}" style="width: 100%; cursor: pointer;">
                    </div>
                    <div>
                        <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); margin-bottom: 8px; letter-spacing: 1px;">АКЦЕНТНЫЙ ЦВЕТ</div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <div class="lelya-color-dot" style="background: #a855f7;" data-color="#a855f7"></div>
                            <div class="lelya-color-dot" style="background: #3b82f6;" data-color="#3b82f6"></div>
                            <div class="lelya-color-dot" style="background: #ec4899;" data-color="#ec4899"></div>
                            <div class="lelya-color-dot" style="background: #f97316;" data-color="#f97316"></div>
                            <div class="lelya-color-dot" style="background: #10b981;" data-color="#10b981"></div>
                            <div class="lelya-color-dot" style="background: #eab308;" data-color="#eab308"></div>
                            <div class="lelya-color-dot" style="background: #ffffff;" data-color="#ffffff"></div>
                            <div class="lelya-color-dot" style="background: #ef4444;" data-color="#ef4444"></div>
                            <div class="lelya-color-dot" style="background: #27272a; border: 1px solid rgba(255,255,255,0.2);" data-color="#27272a"></div>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 4px;">
                        <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--desc-color, #cbd5e1); cursor: pointer;">
                            Эффект размытия элементов
                            <label class="lelya-switch"><input type="checkbox" id="blur_effect" ${config.blur_effect ? 'checked' : ''}><span class="lelya-slider"></span></label>
                        </label>
                        <label style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--desc-color, #cbd5e1); cursor: pointer;">
                            Тень вокруг элементов
                            <label class="lelya-switch"><input type="checkbox" id="shadow_effect" ${config.shadow_effect ? 'checked' : ''}><span class="lelya-slider"></span></label>
                        </label>
                    </div>
                </div>

                <div class="lelya-tab-pane" data-pane="misc" style="display: none; flex-direction: column; gap: 16px; width: 100%;">
                    <div class="lelya-misc-card" id="_btn_change_username">
                        <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">Кастомный никнейм</div>
                        <div style="font-size: 10px; color: var(--desc-color, #a1a1aa);">Текущий: <span id="_current_username_label" style="color: var(--text-color, #fff); font-weight: 600;">${username}</span></div>
                    </div>
                    <div class="lelya-misc-card" id="_btn_discord">
                        <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">Discord Сервер</div>
                        <div style="font-size: 10px; color: var(--desc-color, #a1a1aa);">Присоединиться к нашему сообществу</div>
                    </div>
                    <div class="lelya-misc-card" style="cursor: default;">
                        <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">Информация об аккаунте</div>
                        <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); margin-top: 4px;">Никнейм: <span id="_info_username_display" style="color: var(--text-color, #fff); font-weight: 700;">${username}</span></div>
                        <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); margin-top: 2px;">Первый вход: <span style="color: var(--text-color, #fff); font-family: monospace;">${firstLoginTime}</span></div>
                        <div style="font-size: 10px; color: var(--desc-color, #a1a1aa); margin-top: 2px;">Ваш HWID: <span style="color: var(--text-color, #fff); font-family: monospace; font-size: 9px;">${hwid}</span></div>
                        <div style="margin-top: 12px;"><button id="_lelya_logout" style="padding: 6px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 8px; font-weight: 600; cursor: pointer; width: fit-content; font-size: 10px;">Сбросить ключ авторизации</button></div>
                    </div>
                </div>

                <div class="lelya-tab-pane" data-pane="session" style="display: none; flex-direction: column; gap: 16px; width: 100%;">
                    <div class="lelya-card" style="cursor: default; padding: 16px 24px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: unset;">
                        <div>
                            <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px; margin-bottom: 2px;">ЗАПУЩЕН</div>
                            <div id="_session_start_time" style="font-size: 18px; font-weight: 800;">${sessionStartTimeStr}</div>
                        </div>
                        <div style="width: 1px; height: 35px; background: var(--border-color, rgba(255,255,255,0.1));"></div>
                        <div style="text-align: right;">
                            <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px; margin-bottom: 2px;">ДЛИТЕЛЬНОСТЬ</div>
                            <div id="_session_duration" style="font-size: 18px; font-weight: 800;">0м 0с</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        <div class="lelya-card" style="cursor: default; min-height: unset;">
                            <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px; margin-bottom: 4px;">СРЕДНИЙ FPS</div>
                            <div id="_real_fps" style="font-size: 22px; font-weight: 800; line-height: 1.1;">60</div>
                            <div style="font-size: 8px; color: var(--desc-color, #a1a1aa); margin-top: 4px;">кадров/сек</div>
                        </div>
                        <div class="lelya-card" style="cursor: default; min-height: unset;">
                            <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px; margin-bottom: 4px;">СРЕДНИЙ ПИНГ</div>
                            <div id="_real_ping" style="font-size: 22px; font-weight: 800; line-height: 1.1;">32 МС</div>
                            <div style="font-size: 8px; color: var(--desc-color, #a1a1aa); margin-top: 4px;">задержка</div>
                        </div>
                        <div class="lelya-card" style="cursor: default; min-height: unset;">
                            <div style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1px; margin-bottom: 4px;">ПАМЯТЬ</div>
                            <div id="_real_memory" style="font-size: 22px; font-weight: 800; line-height: 1.1;">-- МБ</div>
                            <div style="font-size: 8px; color: var(--desc-color, #a1a1aa); margin-top: 4px;">использование JS</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="lelya-chart-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--desc-color, #a1a1aa);">ГРАФИК FPS</span>
                                <span id="_chart_fps_val" style="font-size: 11px; font-weight: 800; color: var(--accent-color, #a855f7);">60 FPS</span>
                            </div>
                            <canvas id="_canvas_fps" width="380" height="110" style="width: 100%; height: 110px; display: block; border-radius: 8px;"></canvas>
                        </div>
                        <div class="lelya-chart-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--desc-color, #a1a1aa);">ГРАФИК ПАМЯТИ</span>
                                <span id="_chart_mem_val" style="font-size: 11px; font-weight: 800; color: var(--accent-color, #a855f7);">-- МБ</span>
                            </div>
                            <canvas id="_canvas_mem" width="380" height="110" style="width: 100%; height: 110px; display: block; border-radius: 8px;"></canvas>
                        </div>
                    </div>
                </div>

            </div>

            <div style="padding: 12px 28px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.06)); display: flex; justify-content: space-between; align-items: center; background: var(--footer-bg, rgba(0,0,0,0.15));">
                <span style="font-size: 8px; font-weight: 700; color: var(--desc-color, #a1a1aa); letter-spacing: 1.5px;">CREATED BY VITAMINKA</span>
            </div>
        `;

        document.body.appendChild(root);

        makeDraggable(root, document.getElementById('_lelya_menu_header'), (top, left) => {
            mainMenuPos = { top, left };
            localStorage.setItem(MAIN_MENU_POS_KEY, JSON.stringify(mainMenuPos));
        });

        document.getElementById('_lelya_close_btn').onclick = () => {
            root.style.display = 'none';
        };

        document.querySelectorAll('.lelya-tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.lelya-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetTab = btn.getAttribute('data-tab');
                document.querySelectorAll('.lelya-tab-pane').forEach(pane => {
                    if (pane.getAttribute('data-pane') === targetTab) {
                        pane.style.display = targetTab === 'functions' ? 'grid' : 'flex';
                    } else {
                        pane.style.display = 'none';
                    }
                });
            };
        });

        const updateCardsState = () => {
            root.querySelectorAll('.lelya-card[data-func]').forEach(card => {
                const func = card.getAttribute('data-func');
                if (activeFunctions[func]) {
                    card.classList.add('active-card');
                } else {
                    card.classList.remove('active-card');
                }
            });
        };
        updateCardsState();

        root.querySelectorAll('.lelya-card[data-func]').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.lelya-func-gear')) return;
                const func = card.getAttribute('data-func');
                activeFunctions[func] = !activeFunctions[func];
                localStorage.setItem('lelyahack_funcs', JSON.stringify(activeFunctions));
                updateCardsState();

                if (func === 'hud') {
                    hudContainer.style.display = activeFunctions.hud ? 'block' : 'none';
                }
            };
        });

        const modalsMap = {
            hud: hudModal,
            auto_swap: swapModal,
            auto_bob: bobModal,
            auto_e: autoEModal,
            building_helper: buildingModal,
            zoom_hack: zoomModal
        };

        root.querySelectorAll('.lelya-func-gear').forEach(gear => {
            gear.onclick = (e) => {
                e.stopPropagation();
                const targetModal = modalsMap[gear.getAttribute('data-gear')];
                if (targetModal) {
                    targetModal.style.display = targetModal.style.display === 'flex' ? 'none' : 'flex';
                }
            };
        });

        document.getElementById('_btn_change_username').onclick = () => {
            const newName = prompt('Введите новый никнейм:', username);
            if (newName && newName.trim()) {
                username = newName.trim();
                GM_setValue('lelyahack_username', username);
                document.getElementById('_current_username_label').innerText = username;
                document.getElementById('_info_username_display').innerText = username;
                document.getElementById('_hud_user_id').innerText = username;
            }
        };

        document.getElementById('_btn_discord').onclick = () => {
            window.open('https://discord.gg/VDGgZX2Gb', '_blank');
        };

        document.getElementById('_lelya_logout').onclick = () => {
            if (confirm('Вы уверены, что хотите сбросить ключ авторизации?')) {
                localStorage.removeItem(AUTH_STATUS_KEY);
                GM_setValue('lelyahack_user_key', '');
                location.reload();
            }
        };

        document.getElementById('_lelya_brightness').oninput = (e) => {
            config.brightness = parseInt(e.target.value);
            document.getElementById('_brightness_val').innerText = config.brightness + '%';
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            applyConfigEffects();
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Insert' || e.key === 'Insert') {
                if (root.style.display === 'none') {
                    root.style.display = 'flex';
                } else {
                    root.style.display = 'none';
                    hudModal.style.display = 'none';
                    swapModal.style.display = 'none';
                    bobModal.style.display = 'none';
                    autoEModal.style.display = 'none';
                    buildingModal.style.display = 'none';
                    zoomModal.style.display = 'none';
                }
            }
        });

        let frameCount = 0;
        let lastFpsCheck = nativePerformanceNow();
        let currentFps = 60;

        function calcFPS() {
            frameCount++;
            const now = nativePerformanceNow();
            if (now - lastFpsCheck >= 1000) {
                currentFps = Math.round((frameCount * 1000) / (now - lastFpsCheck));
                frameCount = 0;
                lastFpsCheck = now;
                const fpsEl = document.getElementById('_real_fps');
                if (fpsEl) fpsEl.innerText = currentFps;
            }
            requestAnimationFrame(calcFPS);
        }
        requestAnimationFrame(calcFPS);

        let currentPing = 32;
        setInterval(() => {
            const start = nativePerformanceNow();
            fetch(window.location.origin + '/favicon.ico?cache=' + Math.random(), { method: 'HEAD', cache: 'no-store' })
                .then(() => {
                    const diff = Math.round(nativePerformanceNow() - start);
                    currentPing = diff > 0 ? diff : Math.floor(Math.random() * 10 + 25);
                    const pingEl = document.getElementById('_real_ping');
                    if (pingEl) pingEl.innerText = currentPing + ' МС';
                })
                .catch(() => {
                    const pingEl = document.getElementById('_real_ping');
                    if (pingEl) pingEl.innerText = '-- МС';
                });
        }, 3000);

        const fpsHistory = new Array(30).fill(60);
        const memHistory = new Array(30).fill(0);

        function drawChart(canvasId, data, accentColor) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            ctx.strokeStyle = config.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h * 0.33); ctx.lineTo(w, h * 0.33);
            ctx.moveTo(0, h * 0.66); ctx.lineTo(w, h * 0.66);
            ctx.stroke();

            if (data.length < 2) return;

            let maxVal = Math.max(...data, 10);
            let minVal = Math.min(...data);
            if (maxVal === minVal) { maxVal += 5; minVal = Math.max(0, minVal - 5); }

            const points = data.map((val, idx) => {
                const x = (idx / (data.length - 1)) * w;
                const y = h - ((val - minVal) / (maxVal - minVal)) * (h - 20) - 10;
                return { x, y };
            });

            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, hexToRgba(accentColor, 0.4));
            gradient.addColorStop(1, hexToRgba(accentColor, 0.0));

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        setInterval(() => {
            const d = new Date();
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            const s = String(d.getSeconds()).padStart(2, '0');

            const clockStr = `${h}:${m}:${s}`;
            const clockEl = document.getElementById('_lelya_clock');
            const hudClockEl = document.getElementById('_hud_clock');
            if (clockEl) clockEl.innerText = clockStr;
            if (hudClockEl) hudClockEl.innerText = clockStr;

            const dateEl = document.getElementById('_lelya_date');
            if (dateEl) dateEl.innerText = `${d.getDate()} ${months[d.getMonth()]}`;

            const diffSec = Math.floor((nativePerformanceNow() - sessionStartRealTime) / 1000);
            const mDuration = Math.floor(diffSec / 60);
            const sDuration = diffSec % 60;
            const durEl = document.getElementById('_session_duration');
            if (durEl) durEl.innerText = `${mDuration}м ${sDuration}с`;

            let currentMemory = 0;
            if (performance.memory) {
                const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
                const totalMB = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
                const pct = Math.round((usedMB / totalMB) * 100);
                currentMemory = usedMB;

                const realMem = document.getElementById('_real_memory');
                const hudMem = document.getElementById('_hud_memory');
                const hudMemBar = document.getElementById('_hud_mem_bar');
                const hudMemSub = document.getElementById('_hud_mem_sub');

                if (realMem) realMem.innerText = usedMB + ' МБ';
                if (hudMem) hudMem.innerText = usedMB + ' МБ';
                if (hudMemBar) hudMemBar.style.width = pct + '%';
                if (hudMemSub) hudMemSub.innerText = `${pct}% из ${totalMB} МБ`;
            }

            fpsHistory.shift();
            fpsHistory.push(currentFps);
            const fpsChartVal = document.getElementById('_chart_fps_val');
            if (fpsChartVal) fpsChartVal.innerText = currentFps + ' FPS';
            drawChart('_canvas_fps', fpsHistory, config.accent);

            memHistory.shift();
            memHistory.push(currentMemory);
            const memChartVal = document.getElementById('_chart_mem_val');
            if (memChartVal) memChartVal.innerText = (currentMemory || '--') + ' МБ';
            drawChart('_canvas_mem', memHistory, config.accent);

        }, 1000);

        const hexToRgba = (hex, alpha) => {
            let c = hex.replace('#','');
            if(c.length===3) c = c.split('').map(x=>x+x).join('');
            const num = parseInt(c,16);
            return `rgba(${num>>16},${(num>>8)&255},${num&255},${alpha})`;
        };

        function applyConfigEffects() {
            root.style.opacity = (config.brightness / 100);
            root.style.setProperty('--accent-color', config.accent);
            root.style.setProperty('--accent-glow-bg', hexToRgba(config.accent, 0.25));
            root.style.setProperty('--card-active-bg', hexToRgba(config.accent, 0.15));
            root.style.setProperty('--card-glow', hexToRgba(config.accent, 0.35));
            root.style.setProperty('--card-hover-border', hexToRgba(config.accent, 0.4));
            root.style.setProperty('--tab-active-bg', hexToRgba(config.accent, 0.15));
            root.style.setProperty('--tab-active-border', hexToRgba(config.accent, 0.3));

            if (config.theme === 'light') {
                root.style.background = 'rgba(245, 245, 247, 0.95)';
                root.style.color = '#1d1d1f';
                root.style.setProperty('--text-color', '#1d1d1f');
                root.style.setProperty('--desc-color', '#6e6e73');
                root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
                root.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.08)');
                root.style.setProperty('--border-color', 'rgba(0,0,0,0.08)');
                root.style.setProperty('--tabs-bg', 'rgba(0,0,0,0.03)');
                root.style.setProperty('--footer-bg', 'rgba(0,0,0,0.03)');
                root.style.setProperty('--tab-text-color', '#6e6e73');
                root.style.setProperty('--switch-bg', 'rgba(0,0,0,0.15)');
                root.style.setProperty('--switch-border', 'rgba(0,0,0,0.2)');
                root.style.setProperty('--modal-bg', 'rgba(245, 245, 247, 0.98)');
                root.style.setProperty('--modal-border', 'rgba(0,0,0,0.1)');
                root.style.setProperty('--modal-text', '#1d1d1f');
                root.style.setProperty('--btn-bg', 'rgba(0,0,0,0.05)');

                document.getElementById('_theme_dark').style.background = 'transparent';
                document.getElementById('_theme_dark').style.color = '#6e6e73';
                document.getElementById('_theme_light').style.background = config.accent;
                document.getElementById('_theme_light').style.color = '#fff';
            } else {
                root.style.background = 'rgba(11, 16, 13, 0.95)';
                root.style.color = '#fff';
                root.style.setProperty('--text-color', '#fff');
                root.style.setProperty('--desc-color', '#a1a1aa');
                root.style.setProperty('--card-bg', 'rgba(18, 24, 20, 0.6)');
                root.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.05)');
                root.style.setProperty('--border-color', 'rgba(255,255,255,0.06)');
                root.style.setProperty('--tabs-bg', 'rgba(0,0,0,0.1)');
                root.style.setProperty('--footer-bg', 'rgba(0,0,0,0.15)');
                root.style.setProperty('--tab-text-color', '#a1a1aa');
                root.style.setProperty('--switch-bg', 'rgba(255,255,255,0.15)');
                root.style.setProperty('--switch-border', 'rgba(255,255,255,0.2)');
                root.style.setProperty('--modal-bg', 'rgba(13, 18, 15, 0.95)');
                root.style.setProperty('--modal-border', 'rgba(255, 255, 255, 0.1)');
                root.style.setProperty('--modal-text', '#fff');
                root.style.setProperty('--btn-bg', 'rgba(255,255,255,0.04)');

                document.getElementById('_theme_light').style.background = 'transparent';
                document.getElementById('_theme_light').style.color = '#a1a1aa';
                document.getElementById('_theme_dark').style.background = config.accent;
                document.getElementById('_theme_dark').style.color = '#fff';
            }

            if (config.blur_effect) {
                root.style.backdropFilter = 'blur(20px)';
            } else {
                root.style.backdropFilter = 'none';
            }

            if (config.shadow_effect) {
                root.style.boxShadow = `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${hexToRgba(config.accent, 0.2)}`;
            } else {
                root.style.boxShadow = 'none';
            }

            root.querySelectorAll('.lelya-color-dot').forEach(dot => {
                if (dot.getAttribute('data-color') === config.accent) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        applyConfigEffects();

        document.getElementById('_theme_dark').onclick = () => {
            config.theme = 'dark';
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            applyConfigEffects();
        };

        document.getElementById('_theme_light').onclick = () => {
            config.theme = 'light';
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            applyConfigEffects();
        };

        root.querySelectorAll('.lelya-color-dot').forEach(dot => {
            dot.onclick = () => {
                config.accent = dot.getAttribute('data-color');
                localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
                applyConfigEffects();
            };
        });

        document.getElementById('blur_effect').onchange = (e) => {
            config.blur_effect = e.target.checked;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            applyConfigEffects();
        };

        document.getElementById('shadow_effect').onchange = (e) => {
            config.shadow_effect = e.target.checked;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            applyConfigEffects();
        };
    }
})();
