// ################################
// ANPASSUNGEN VOR DEM ERSTEN START
// ################################
/**         
 * RS_CLIENT: Name des Clients. Wird beim Aufruf der Speech Engine benötigt.
 * RS_TOKEN:  Wird im Backend (Clients Configuration) definiert. Wird zur Authentifizierung beim Aufruf der Speech Engine benötigt.
 */
const RS_CLIENT = "STUDENT_4_WS2021";
const RS_TOKEN = "ilu5jash3r7xt27suad1u47nfecnl5ih"; //Token to authenticate

// ############################
// OFTMALS GENUTZTE ANPASSUNGEN 
// ############################
/**         
 * RS_COMMANDS: Aktivierungswörter, auf die die Spracheingabe reagieren soll ("KITT"-Modus). Ist dieses Array leer (bspw. []) wird jede Spracheingabe verwertet.
 * RS_KITT_INTERVALL: Dauer, wann ein aktiver "KITT"-Modus deaktiviert wird (in Sekunden).
 * RS_COMMANDS_DYNNAV: Aktivierungswörter für die dynamische Navigation (DYNNAV). Wenn dieses Wort am Anfang eines Satzes erkannt wird, wird ein DYNNAV-Aufruf an die Speech Engine gesendet.
 * RS_COMMANDS_STOP: Stoppwörter zur Deaktivierung des "KITT"-Modus. Nur GROSSBUCHSTABEN verwenden.
 * RS_DEBUG_MODE: Der Debug-Modus wird aktiviert durch: "...&debug=1" in der URL
 */
const RS_COMMANDS = ["Simon", 'Lisa', 'Laser', 'Leser', 'Alina', 'Ally', 'Alli', 'Aly', 'Ali', 'Elli', 'Eli', 'Elly', 'Rallye', 'Helli', 'Hell', 'Eddie', 'Heli', 'Markus', 'Marcus', "Alexa"]; //[OPTIONAL Definiere Commands, um mit diesen die Spracherkennung zu aktivieren. Bsp. ['Elli', ]]Speech engine commands to activate speech recognition
const RS_SALUTATION = 'Ja, bitte?';
const RS_KITT_INTERVALL = 30;
const RS_COMMANDS_DYNNAV = ['oke', 'ok', 'okay', 'o.k.', 'okey']; // [OPTIONAL] DYNNAV commands
const RS_COMMANDS_STOP = ['STOPP', 'STOP', 'TOP'];
const RS_COMMANDS_BACK = ['BACK', 'BECK', 'ZURÜCK', 'ZURUECK'];
var urlParams = new URLSearchParams(window.location.search);
const RS_DEBUG_MODE = urlParams.get('debug');   // nicht ändern!
const RS_AVATAR_MODE = urlParams.get('avatar'); // nicht ändern!
const RS_DYNNAV_MODE = urlParams.get('dynnav'); // nicht ändern!
const RS_RECORD_MODE = urlParams.get('record'); // nicht ändern!

// ###########################
// SELTEN GENUTZTE ANPASSUNGEN 
// ###########################
/**         
 * RS_CLIENT_DOMAIN: Domain des Clients, ohne https://www., z.B. rapid-speech.com
 * RS_CLIENTS_CORE_PATH: Pfad, in dem die clients_core.js liegt (beginnend "http" oder "https", abschließend mit "/")
 * RS_SPEECH_ENGINE: komplette URL zur Speech Engine
 * RS_PROXY: komplette URL zum Proxy-Server (Vermeidung der CORS-Problematik)
 */
const RS_CLIENT_DOMAIN = "rapid-speech.com"; // [WITHOUT HTTPS://WWW.] Client-Domain
const RS_CLIENTS_CORE_PATH = "https://www.rapid-speech.com/ws2021/clients_core/";
const RS_SPEECH_ENGINE = "https://www.rapid-speech.com/ws2021/index.php?menu_level1=speech&menu_level2=engine";
const RS_GENERIC_MODULE_URL = "https://www.rapid-speech.com/ws2021/includes/generic_module/generic_module.php"
const RS_PROXY = "https://www.rapid-speech.com/ws2021/proxy.php?url="; //Proxy

var RS_KITT_ACTIVE = 0;      // will be set automatically
var RS_KITT_ACTIVE_TS = 0;   // will be set automatically

/**
 * Load Client Core, CSS, etc 
 */
$.getScript(RS_CLIENTS_CORE_PATH + "js/clients_core.js?v=ws2021");

/**
 * Recognizes the speech, converts it into text and calls the speech engine.
 */
function startSpeechRecognition() {
    annyang.addCallback('result', function (context) {
        console.log(context[0]);
        //$("#voice_recognition_text").html(recognition.substring(0,40));
        speechPreprocessing(context[0]);
    }, this);
    annyang.setLanguage('de-DE');
    annyang.start();
}

/**
 * Sends the message stored in RS_SALUTATION to the user.
 */
function sendSaluation() {

    sayText(RS_SALUTATION, 3, 3, 2);

}

