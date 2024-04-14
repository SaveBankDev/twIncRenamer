/*
* Script Name: Mass Incomings Renamer
* Version: v1.0
* Last Updated: 2024-04-14
* Author: SaveBank
* Author Contact: Discord: savebank 
* Approved: Yes
* Approved Date: 2024-04-14
* Mod: RedAlert
*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

var allIdsIR = ['prependContent', 'replaceContent', 'appendContent'];

var scriptConfig = {
    scriptData: {
        prefix: 'sbIR',
        name: 'Mass Incomings Renamer',
        version: 'v1.0',
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
        }
    }
    ,
    allowedMarkets: [],
    allowedScreens: ['overview_villages', 'overview'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: false
};



$.getScript(`https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
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
            UI.ErrorMessage('No incoming attacks found');
            return;
        }
        if (DEBUG) console.debug(`${scriptInfo}: Startup time: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        // Entry point
        (async function () {
            try {
                const startTime = performance.now();
                renderUI();
                addEventHandlers();
                initializeInputFields();
                count();
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
                '600px',
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

            for (let id in settingsObject) {
                if (settingsObject.hasOwnProperty(id)) {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = settingsObject[id];
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
                        incDataMap.set(incId, { label: incLabel });
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
                        incDataMap.set(incId, { label: incLabel });
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
            const settingsObject = getLocalStorage();
            const prependContent = settingsObject.prependContent;
            const replaceContent = settingsObject.replaceContent;
            const appendContent = settingsObject.appendContent;
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
        function count() {
            const apiUrl = 'https://api.counterapi.dev/v1';
            const playerId = game_data.player.id;
            const encodedPlayerId = btoa(game_data.player.id);
            const apiKey = 'sbIncRenamer'; // api key
            const namespace = 'savebankscriptstw'; // namespace
            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}/up`, response => {
                    if (DEBUG) console.debug(`Total script runs: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch total script runs"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching total script runs: ", error); }

            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}_id${encodedPlayerId}/up`, response => {
                    if (response.count === 1) {
                        $.getJSON(`${apiUrl}/${namespace}/${apiKey}_users/up`).fail(() => {
                            if (DEBUG) console.debug("Failed to increment user count");
                        });
                    }
                    if (DEBUG) console.debug(`Player ${playerId} script runs: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch player script runs"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching player script runs: ", error); }

            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}_users`, response => {
                    if (DEBUG) console.debug(`Total users: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch total users"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching total users: ", error); }
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
    });

