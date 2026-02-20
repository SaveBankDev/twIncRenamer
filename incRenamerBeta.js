/*
* Script Name: Mass Incomings Renamer
* Version: v1.1.1
* Last Updated: 2026-02-20
* Author: SaveBank
* Author Contact: Discord: savebank 
* Approved: Yes
* Approved Date: 2024-04-14
* Mod: RedAlert
*/

/*
By uploading a user-generated mod (script) for use with Tribal Wars, the creator grants InnoGames a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, publicly display, modify, and create derivative works of the mod. This license permits InnoGames to incorporate the mod into any aspect of the game and its related services, including promotional and commercial endeavors, without any requirement for compensation or attribution to the uploader. The uploader represents and warrants that they have the legal right to grant this license and that the mod does not infringe upon any third-party rights.
*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;
if (typeof QUICKSTART !== 'boolean') QUICKSTART = false;
if (typeof PREFIX !== 'string') PREFIX = '';
if (typeof REPLACE !== 'string') REPLACE = '';
if (typeof SUFFIX !== 'string') SUFFIX = '';

var allIdsIR = ['prependContent', 'replaceContent', 'appendContent'];

window.twSDK = {
    scriptData: {},
    translations: {},
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    enableCountApi: false,
    isDebug: false,
    market: game_data.market,

    _initDebug: function () {
        if (this.isDebug) {
            console.debug(`${this.scriptInfo()} It works 🚀!`);
            console.debug(`${this.scriptInfo()} HELP:`, this.scriptData.helpLink);
        }
    },
    addGlobalStyle: function () {
        return `
            .ra-table-container { overflow-y: auto; overflow-x: hidden; height: auto; max-height: 400px; }
            .ra-table th { font-size: 14px; }
            .ra-table th label { margin: 0; padding: 0; }
            .ra-table th,
            .ra-table td { padding: 5px; text-align: center; }
            .ra-table td a { word-break: break-all; }
            .ra-table a:focus { color: blue; }
            .ra-table a.btn:focus { color: #fff; }
            .ra-table tr:nth-of-type(2n) td { background-color: #f0e2be }
            .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
            .ra-mb10 { margin-bottom: 10px !important; }
            .ra-popup-content { width: 360px; }
            .custom-close-button { right: 0; top: 0; }
            @media (max-width: 480px) {
                .ra-fixed-widget {
                    position: relative !important;
                    top: 0;
                    left: 0;
                    display: block;
                    width: auto;
                    height: auto;
                    z-index: 1;
                }
                .custom-close-button { display: none; }
                .ra-popup-content { width: 100%; }
            }
        `;
    },
    checkValidLocation: function (type) {
        switch (type) {
            case 'screen':
                return this.allowedScreens.includes(this.getParameterByName('screen'));
            case 'mode':
                return this.allowedModes.includes(this.getParameterByName('mode'));
            default:
                return false;
        }
    },
    getParameterByName: function (name, url = window.location.href) {
        return new URL(url).searchParams.get(name);
    },
    init: async function (scriptConfig) {
        const {
            scriptData,
            translations,
            allowedMarkets,
            allowedScreens,
            allowedModes,
            isDebug,
            enableCountApi,
        } = scriptConfig;

        this.scriptData = scriptData;
        this.translations = translations;
        this.allowedMarkets = allowedMarkets;
        this.allowedScreens = allowedScreens;
        this.allowedModes = allowedModes;
        this.enableCountApi = enableCountApi;
        this.isDebug = isDebug;
        this._initDebug();
    },
    redirectTo: function (location) {
        window.location.assign(game_data.link_base_pure + location);
    },
    renderFixedWidget: function (
        body,
        id,
        mainClass,
        customStyle,
        width,
        customName = this.scriptData.name
    ) {
        const globalStyle = this.addGlobalStyle();

        const content = `
            <div class="${mainClass} ra-fixed-widget" id="${id}">
                <div class="${mainClass}-header">
                    <h3>${this.tt(customName)}</h3>
                </div>
                <div class="${mainClass}-body">
                    ${body}
                </div>
                <div class="${mainClass}-footer">
                    <small>
                        <strong>${this.tt(customName)} ${this.scriptData.version}</strong> -
                        <a href="${this.scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">${this.scriptData.author}</a> -
                        <a href="${this.scriptData.helpLink}" target="_blank" rel="noreferrer noopener">${this.tt('Help')}</a>
                    </small>
                </div>
                <a class="popup_box_close custom-close-button" href="#">&nbsp;</a>
            </div>
            <style>
                .${mainClass} { position: fixed; top: 10vw; right: 10vw; z-index: 99999; border: 2px solid #7d510f; border-radius: 10px; width: ${
            width ?? '360px'
        }; overflow-y: auto; padding: 10px; background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; }
                .${mainClass} * { box-sizing: border-box; }
                ${globalStyle}
                ${customStyle}
            </style>
        `;

        if (jQuery(`#${id}`).length < 1) {
            if (typeof mobiledevice !== 'undefined' && mobiledevice) {
                jQuery('#content_value').prepend(content);
            } else {
                jQuery('#contentContainer').prepend(content);
                jQuery(`#${id}`).draggable({
                    cancel: '.ra-table, input, textarea, button, select, option',
                });

                jQuery(`#${id} .custom-close-button`).on('click', function (e) {
                    e.preventDefault();
                    jQuery(`#${id}`).remove();
                });
            }
        } else {
            jQuery(`.${mainClass}-body`).html(body);
        }
    },
    scriptInfo: function (scriptData = this.scriptData) {
        return `[${scriptData.name} ${scriptData.version}]`;
    },
    tt: function (string) {
        if (this.translations[game_data.locale] !== undefined) {
            return this.translations[game_data.locale][string] || string;
        }
        return (this.translations.en_DK && this.translations.en_DK[string]) || string;
    },
};

var scriptConfig = {
    scriptData: {
        prefix: 'sbIR',
        name: 'Mass Incomings Renamer',
        version: 'v1.1.1',
        author: 'SaveBank',
        authorUrl: 'https://forum.tribalwars.net/index.php?members/savebank.131111/',
        helpLink: 'https://forum.tribalwars.net/index.php?threads/mass-incomings-renamer.292218/',
    },
    translations: {
        en_DK: {
            'Can only be used in the village overview or incoming screen!': 'Can only be used in the village overview or incoming screen!',
            Help: 'Help',
            'Mass Incomings Renamer': 'Mass Incomings Renamer',
            'There was an error!': 'There was an error!',
            'Prepend to attack label': 'Prepend to attack label',
            'Replace current attack label': 'Replace current attack label',
            'Append to attack label': 'Append to attack label',
            'Rename': 'Rename',
            'No content to prepend, replace or append': 'No content to prepend, replace or append',
            'Enter content to prepend': 'Enter content to prepend',
            'Enter new attack label': 'Enter new attack label',
            'Enter content to append': 'Enter content to append',
            'No incoming attacks found': 'No incoming attacks found',
        },
        de_DE: {
            'Can only be used in the village overview or incoming screen!': 'Kann nur im Dorf oder in Eintreffende Befehle verwendet werden!',
            Help: 'Hilfe',
            'Mass Incomings Renamer': 'Angriffsumbenenner',
            'There was an error!': 'Es gab einen Fehler!',
            'Prepend to attack label': 'Vor der Angriffsbezeichnung einfügen',
            'Replace current attack label': 'Aktuelle Angriffsbezeichnung ersetzen',
            'Append to attack label': 'Nach der Angriffsbezeichnung einfügen',
            'Rename': 'Umbenennen',
            'No content to prepend, replace or append': 'Kein Inhalt zum Voranstellen, Ersetzen oder Anhängen',
            'Enter content to prepend': 'Präfix eingeben',
            'Enter new attack label': 'Inhalt zum Ersetzen eingeben',
            'Enter content to append': 'Suffix eingeben',
            'No incoming attacks found': 'Keine eingehenden Angriffe gefunden',
        }
    }
    ,
    allowedMarkets: [],
    allowedScreens: ['overview_villages', 'overview'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: false
};



(async function () {
        const startTime = performance.now();
        if (DEBUG) {
            console.debug(`Init`);
        }
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');
        if (!isValidScreen) {
            UI.ErrorMessage(twSDK.tt('Can only be used in the village overview or incoming screen!'));
            return;
        }
        let incDataMap;

        const urlParams = new URLSearchParams(window.location.search);
        const screen = urlParams.get('screen');
        const mode = urlParams.get('mode');
        const subtype = urlParams.get('subtype');

        if (screen === 'overview' && mode === null && subtype === null) {
            incDataMap = collectIncDataFromVillage();
        } else if (screen === 'overview_villages' && mode === 'incomings' && subtype === 'attacks') {
            incDataMap = collectIncDataFromOverview();
        } else {
            console.error('Invalid screen, mode, or subtype');
            if (screen === 'overview') {
                twSDK.redirectTo('overview');
            } else if (screen === 'overview_villages') {
                twSDK.redirectTo('overview_villages&mode=incomings&subtype=attacks');
            }
            return;
        }
        if (incDataMap.size === 0) {
            UI.ErrorMessage(twSDK.tt('No incoming attacks found'));
            return;
        }
        if (DEBUG) console.debug(`${scriptInfo}: Startup time: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        // Entry point
        (async function () {
            try {
                const startTime = performance.now();
                if (QUICKSTART) {
                    renameLabels();
                } else {
                    renderUI();
                    addEventHandlers();
                    initializeInputFields();
                }
                if (DEBUG) console.debug(`${scriptInfo}: Time to initialize: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo}: Error:`, error);
            }
        })();

        function renderUI() {
            const css = generateCSS();

            const content = `
                <div class="ra-mb10 sb-grid sb-grid-30-40-30">
                    <div>
                        <label for="prependContent">${twSDK.tt('Prepend to attack label')}</label>
                        <input type="text" id="prependContent" placeholder="${twSDK.tt('Enter content to prepend')}" />
                    </div>
                    <div>
                        <label for="replaceContent">${twSDK.tt('Replace current attack label')}</label>
                        <input type="text" id="replaceContent" placeholder="${twSDK.tt('Enter new attack label')}" />
                    </div>
                    <div>
                        <label for="appendContent">${twSDK.tt('Append to attack label')}</label>
                        <input type="text" id="appendContent" placeholder="${twSDK.tt('Enter content to append')}" />
                    </div>
                </div>
                <div class="ra-mb10">
                    <button class="btn btn-confirm-yes" id="btnRename">${twSDK.tt('Rename')}</button>
                </div>
            `;

            twSDK.renderFixedWidget(
                content,
                'sbIncRenamerWidget',
                'sb-inc-renamer-widget',
                css,
                '700px',
            );
        }
        function generateCSS() {
            // Start building the CSS string
            let css = `
            .sb-grid-30-40-30 {
                grid-template-columns: calc(30% - 5px) calc(40% - 10px) calc(30% - 5px);
            }
            .sb-grid {
                display: grid;
                grid-gap: 10px;
            }
            .sb-grid > div {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .sb-grid label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            .sb-grid input[type="text"] {
                width: 100%;
            }
            .btn-confirm-yes { 
                padding: 3px; 
                margin: 5px; 
            }
    `;

            return css;
        }
        function addEventHandlers() {
            $('#btnRename').on('click', function () {
                renameLabels();
            });

            $(document).ready(function () {
                allIdsIR.forEach(function (id) {
                    $('#' + id).on('change', handleInputChange);
                });
            });
        }
        function initializeInputFields() {
            const settingsObject = getLocalStorage();
            if (DEBUG) console.debug(`${scriptInfo}: Settings object from local storage: `, settingsObject);

            if (settingsObject.replaceContent) {
                settingsObject.prependContent = '';
                settingsObject.appendContent = '';
                saveLocalStorage(settingsObject);
            }

            for (let id in settingsObject) {
                if (settingsObject.hasOwnProperty(id)) {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = settingsObject[id];

                        if ((id === 'prependContent' || id === 'appendContent') && settingsObject[id]) {
                            document.getElementById('replaceContent').disabled = true;
                        }
                        if (id === 'replaceContent' && settingsObject[id]) {
                            document.getElementById('prependContent').disabled = true;
                            document.getElementById('appendContent').disabled = true;
                        }
                    } else {
                        console.error(`${scriptInfo}: Element not found for ID: ${id} in `, settingsObject);
                    }
                }
            }
        }
        function handleInputChange() {
            const inputId = $(this).attr('id');
            let inputValue;

            switch (inputId) {
                case "prependContent":
                    inputValue = $(this).val();
                    if (inputValue) {
                        $('#replaceContent').prop('disabled', true);
                    } else {
                        if (!$('#prependContent').val() && !$('#appendContent').val()) {
                            $('#replaceContent').prop('disabled', false);
                        }
                    }
                    break;
                case "appendContent":
                    inputValue = $(this).val();
                    if (inputValue) {
                        $('#replaceContent').prop('disabled', true);
                    } else {
                        if (!$('#prependContent').val() && !$('#appendContent').val()) {
                            $('#replaceContent').prop('disabled', false);
                        }
                    }
                    break;
                case "replaceContent":
                    inputValue = $(this).val();
                    if (inputValue) {
                        $('#prependContent, #appendContent').prop('disabled', true);
                    } else {
                        $('#prependContent, #appendContent').prop('disabled', false);
                    }
                    break;
                default:
                    console.error(`${scriptInfo}: Unknown id: ${inputId}`)
            }
            if (DEBUG) console.debug(`${scriptInfo}: ${inputId} changed to ${inputValue}`)
            const settingsObject = getLocalStorage();
            settingsObject[inputId] = inputValue;
            saveLocalStorage(settingsObject);
        }

        function collectIncDataFromOverview() {
            const startTime = performance.now();
            const incDataMap = new Map();
            try {
                jQuery('#incomings_table tbody tr.nowrap').each((_, incsRow) => {
                    try {
                        const incId = parseInt(jQuery(incsRow).find('span.quickedit').attr('data-id'));
                        const incLabel = jQuery(incsRow).find('span.quickedit-label').text().trim();
                        const commandType = "attack";
                        incDataMap.set(incId, { label: incLabel, commandType: commandType });
                    } catch (innerError) {
                        console.error('Error processing a row:', innerError);
                    }
                });
            } catch (outerError) {
                console.error('Error processing the table:', outerError);
            }
            if (DEBUG) console.debug(`${scriptInfo}: incDataMap: `, incDataMap);
            if (DEBUG) console.debug(`${scriptInfo}: Time to collect inc data: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
            return incDataMap;
        }
        function collectIncDataFromVillage() {
            const startTime = performance.now();
            const incDataMap = new Map();
            try {
                jQuery('#commands_incomings form .vis tbody tr.command-row.no_ignored_command').each((_, incsRow) => {
                    try {
                        const incId = parseInt(jQuery(incsRow).find('span.quickedit').attr('data-id'));
                        const incLabel = jQuery(incsRow).find('span.quickedit-label').text().trim();
                        let commandType = jQuery(incsRow).find('span.icon-container span.command_hover_details').attr('data-command-type');

                        if (typeof commandType === 'undefined') {
                            let imgSrc = jQuery(incsRow).find('span.icon-container span:first img').attr('src');
                            if (typeof imgSrc !== 'undefined') {
                                let imgName = imgSrc.split('/').pop();
                                commandType = imgName.substring(0, imgName.length - 5); // remove .webp
                            } else {
                                commandType = "attack";
                            }
                        }
                        incDataMap.set(incId, { label: incLabel, commandType: commandType });
                    } catch (innerError) {
                        console.error('Error processing a row:', innerError);
                    }
                });
            } catch (outerError) {
                console.error('Error processing the table:', outerError);
            }
            if (DEBUG) console.debug(`${scriptInfo}: incDataMap: `, incDataMap);
            if (DEBUG) console.debug(`${scriptInfo}: Time to collect inc data: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
            return incDataMap;
        }
        function renameLabels() {
            const startTime = performance.now();
            let prependContent;
            let replaceContent;
            let appendContent;

            if (QUICKSTART) {
                prependContent = PREFIX;
                replaceContent = REPLACE;
                appendContent = SUFFIX;
                PREFIX = '';
                REPLACE = '';
                SUFFIX = '';
                QUICKSTART = false;
            } else {
                const settingsObject = getLocalStorage();
                prependContent = settingsObject.prependContent;
                replaceContent = settingsObject.replaceContent;
                appendContent = settingsObject.appendContent;
            }
            if (!prependContent && !replaceContent && !appendContent) {
                UI.ErrorMessage(twSDK.tt('No content to prepend, replace or append'));
                return;
            }
            if (DEBUG) console.debug(`${scriptInfo}: Renaming labels with prependContent: ${prependContent}`);
            if (DEBUG) console.debug(`${scriptInfo}: Renaming labels with replaceContent: ${replaceContent}`);
            if (DEBUG) console.debug(`${scriptInfo}: Renaming labels with appendContent: ${appendContent}`);
            if (screen === 'overview' && mode === null && subtype === null) {
                incDataMap = collectIncDataFromVillage();
            } else if (screen === 'overview_villages' && mode === 'incomings' && subtype === 'attacks') {
                incDataMap = collectIncDataFromOverview();
            } else {
                console.error('Invalid screen, mode, or subtype');
                return;
            }
            let index = 0;
            incDataMap.forEach((incData, incId) => {
                let type = incData.commandType;
                if (!type.startsWith('attack')) {
                    return;
                }
                let newLabel = incData.label;
                if (replaceContent) {
                    newLabel = replaceContent;
                }
                if (prependContent) {
                    newLabel = prependContent + ' ' + newLabel;
                }
                if (appendContent) {
                    newLabel = newLabel + ' ' + appendContent;
                }
                setTimeout(() => {
                    renameLabel(incId, newLabel);
                }, 160 * index);
                index++;
            });
            if (DEBUG) console.debug(`${scriptInfo}: Time to rename labels: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        }
        function renameLabel(id, newLabel) {
            const startTime = performance.now();
            try {
                const quickEdit = jQuery(`span.quickedit[data-id="${id}"]`);
                quickEdit.find('.rename-icon').click();
                quickEdit.find('input[type=text]').val(newLabel);
                quickEdit.find('input[type=button]').click();
            } catch (error) {
                console.error(`Failed to rename label with id ${id}:`, error);
            }
            if (DEBUG) console.debug(`${scriptInfo}: Time to rename label ${id}: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        }
        function getLocalStorage() {
            const localStorageSettings = JSON.parse(localStorage.getItem('sbIncRenamer'));
            // Check if all expected settings are in localStorageSettings
            const expectedSettings = [
                'prependContent',
                'replaceContent',
                'appendContent',
            ];

            let missingSettings = [];
            if (localStorageSettings) {
                missingSettings = expectedSettings.filter(setting => !(setting in localStorageSettings));
                if (DEBUG && missingSettings.length > 0) console.debug(`${scriptInfo}: Missing settings in localStorage: `, missingSettings);
            }

            if (localStorageSettings && missingSettings.length === 0) {
                // If settings exist in localStorage  return the object
                return localStorageSettings;
            } else {
                const defaultSettings = {
                    prependContent: '',
                    replaceContent: '',
                    appendContent: '',
                };

                saveLocalStorage(defaultSettings);

                return defaultSettings;
            }
        }
        function saveLocalStorage(settingsObject) {
            // Stringify and save the settings object
            localStorage.setItem('sbIncRenamer', JSON.stringify(settingsObject));
        }
})();

