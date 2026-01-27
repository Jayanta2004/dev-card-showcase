/**
 * GhostLink Localization
 */
const I18N = {
    'en': {
        'brand': 'GHOSTLINK',
        'btn_offline': 'GO OFFLINE',
        'btn_reconnect': 'RECONNECT',
        'sidebar_title': 'ACTIVE NODES',
        'input_placeholder': 'Type transmission...',
        'btn_send': 'SEND',
        'onboarding_msg': '⚠️ PROTOCOL ADVISORY: Open this URL in multiple tabs to simulate a peer-to-peer mesh network.',
        'sys_offline': 'SYSTEM ALERT: NETWORK CONNECTION SEVERED',
        'sys_reconnect': 'SYSTEM: CONNECTION RESTORED. SYNCING...',
        'sys_welcome': 'Welcome to GhostLink Protocol. \nLocal Node Initialized. waiting for peers...',
        'no_peers': 'NO ACTIVE PEERS FOUND\nOpen another tab'
    },
    'es': {
        'brand': 'GHOSTLINK',
        'btn_offline': 'DESCONECTAR',
        'btn_reconnect': 'RECONECTAR',
        'sidebar_title': 'NODOS ACTIVOS',
        'input_placeholder': 'Escriba transmisión...',
        'btn_send': 'ENVIAR',
        'onboarding_msg': '⚠️ AVISO DE PROTOCOLO: Abra esta URL en varias pestañas para simular una red mesh P2P.',
        'sys_offline': 'ALERTA DEL SISTEMA: CONEXIÓN CORTADA',
        'sys_reconnect': 'SISTEMA: CONEXIÓN RESTAURADA. SINCRONIZANDO...',
        'sys_welcome': 'Bienvenido al Protocolo GhostLink. \nNodo Local Inicializado. Esperando pares...',
        'no_peers': 'NO SE ENCONTRARON PARES ACTIVOS\nAbra otra pestaña'
    }
};

window.GhostI18n = {
    lang: 'en',
    toggle: function () {
        this.lang = this.lang === 'en' ? 'es' : 'en';
        return this.lang;
    },
    get: function (key) {
        return I18N[this.lang][key] || key;
    }
};
