$(document).ready(function () {


    console.log("test");

    console.log("hier");


    console.log(RS_CLIENTS_CORE_PATH)


    // Include 
    $.getScript(RS_CLIENTS_CORE_PATH + "3rdparty/json-formatter/json-formatter.2.3.4.min.js")
        .done(function () {
            setTimeout(function () {
                callSpeechEngine("", "1", "0");
            }, 3000);
            KITT();
            startSpeechRecognition();
            if (typeof RS_AVATAR_MODE !== 'undefined' && RS_AVATAR_MODE == '1') {
                $('#avatar').hide();
            }
            if (typeof RS_DYNNAV_MODE !== 'undefined' && RS_DYNNAV_MODE == '1') {
                $('#dyn-nav').hide();
            }
            if (typeof RS_RECORD_MODE !== 'undefined' && RS_RECORD_MODE == '1') {
                speechPreprocessing(' ');
            }
        });

});

/**
 * Preprocess the recognized text.
 * 
 * @param {String} cp_text     The recognized text
 */
function speechPreprocessing(cp_text) {
    console.log(cp_text);
    if (typeof RS_RECORD_MODE !== 'undefined' && RS_RECORD_MODE == '1') {
        RS_KITT_ACTIVE = 1;
        RS_KITT_ACTIVE_TS = 1;
    }
    // Check if Command-Arrays are filled           
    if (RS_COMMANDS_DYNNAV.length > 0 || RS_COMMANDS.length > 0) {
        cp_text = cp_text + " ";
        if (RS_KITT_ACTIVE > 0) {
            var cv_startWord = "";
            var cv_text = cp_text;
            // STOP???
            if (RS_COMMANDS_STOP.includes(cv_text.trim().toUpperCase())) {
                //RS_KITT_ACTIVE_TS=0; RS_KITT_ACTIVE=0;
                $("#voice_recognition_text").html(cv_text.substring(0, 40));
                onStopPress();
                return;
            }
            // BACK???
            if (RS_COMMANDS_BACK.includes(cv_text.trim().toUpperCase())) {
                //RS_KITT_ACTIVE_TS=0; RS_KITT_ACTIVE=0;
                $("#voice_recognition_text").html(cv_text.substring(0, 40));
                callSpeechEngine("", "0", "back");
                return;
            }
        } else {
            // Remove all commas from query
            cp_text = cp_text.replace(/,/g, " ");
            // Split query into two parts in order to detect activation command
            var cv_index = cp_text.indexOf(" ");
            // Retrieve activation command
            var cv_startWord = cp_text.substr(0, cv_index);
            // Retrieve query
            var cv_text = cp_text.substr(cv_index + 1);
        }
        // Check if activation command is detected 
        if (RS_COMMANDS.includes(cv_startWord) || (RS_COMMANDS_DYNNAV.includes(cv_startWord)) || (RS_KITT_ACTIVE == 1)) {
            if (cv_text) {
                $("#voice_recognition_text").html(cp_text.substring(0, 40));
                callSpeechEngine(cv_text, "0", "0");
            } else {
                sendSaluation();
            }
            RS_KITT_ACTIVE = 1;
            if (typeof RS_RECORD_MODE !== 'undefined' && RS_RECORD_MODE == '1') {
                RS_KITT_ACTIVE_TS = 1;
            } else {
                RS_KITT_ACTIVE_TS = Math.floor(Date.now() / 1000);
            }
        }
        // If Command-Arrays are empty    
    } else {
        if (cv_text) {
            $("#voice_recognition_text").html(cp_text.substring(0, 40));
            callSpeechEngine(cp_text, "0", "0");
            RS_KITT_ACTIVE_TS = Math.floor(Date.now() / 1000);
        }

    }
}

/**
 * Calls the speech engine with the recognized text.
 * 
 * @param {String} cp_text     recognized text
 * @param {boolean} cp_init    init flag ("1" = true, "0" = false)
 * @param {String} cp_dynnav   dynnav command ("back" or "stop")
 */
function callSpeechEngine(cp_text, cp_init, cp_dynnav) {
    cp_text = rawurlencode(cp_text);
    console.log(RS_SPEECH_ENGINE + "&ajaxcall=1&rs_token=" + RS_TOKEN + "&rs_client=" + RS_CLIENT + "&rs_init=" + cp_init + "&rs_dynnav=" + cp_dynnav + "---" + cp_text);
    CallAction(RS_SPEECH_ENGINE + "&ajaxcall=1&rs_token=" + RS_TOKEN + "&rs_client=" + RS_CLIENT + "&rs_init=" + cp_init + "&rs_dynnav=" + cp_dynnav, {
        data: "&rs_query=" + cp_text,
        use_ajax: true,
        success: onSpeechEngineSuccess
    });
}

/**
 * Callback function on successfull speech engine call.
 * 
 * @param {Object} cp_data     speech engine results
 */
function onSpeechEngineSuccess(cp_data) {
    // Clear dynamic navgiation
    $('#table-matched').empty();
    $('#table-unmatched').empty();
    $('#list-support').empty();
    cp_data = JSON.parse(cp_data);
    if (RS_DEBUG_MODE == "1") {
        //Show debug details
        const formatter = new JSONFormatter(cp_data, "1");
        $("#div-debug").html("");
        document.getElementById("div-debug").appendChild(formatter.render());
    }
    if (cp_data.hasOwnProperty('DYNNAV')) {
        var cv_matched = cp_data.DYNNAV.MATCHED;
        var cv_unmatched = cp_data.DYNNAV.UNMATCHED;
        var cv_support = cp_data.DYNNAV.SUPPORTED;
        for (const key in cv_matched) {
            //$('#table-matched').append('<tr><td style="padding:0px;">' + cv_matched[key] + '</td></tr>');
            $('#table-matched').append(cv_matched[key] + "<br>");
        }
        for (const key in cv_unmatched) {
            //$('#table-unmatched').append('<tr><td style="padding:0px;"><span class="badge badge-primary" style="cursor: pointer" onclick="onPress()">' + cv_unmatched[key] + '</span></td></tr>');
            $('#table-unmatched').append('<span class="badge badge-primary" style="cursor: pointer" onclick="onPress()">' + cv_unmatched[key] + '</span><br>');
        }
        for (const key in cv_support) {
            //$('#list-support').append('<li style="float:left; padding-right: 10px;"><span onclick="onPress()" style="color: #4169E1; cursor: pointer; text-align: center;">' + cv_support[key] + '</span></li>');
            $('#list-support').append('<font onclick="onSupportPress()" style="color: #4169E1;cursor: pointer;">' + cv_support[key] + '</font>&nbsp;&nbsp;<wbr>');
        }
    }
    // Output query for debug purposes
    //$('#text-query').html(cp_data.DEBUG.QUERY);
    //$('#text-session-query').html(cp_data.DEBUG.SESSION_QUERY);
    //$('#text-dynnav-query').html(cp_data.DEBUG.DYNNAV_QUERY);
    for (index in cp_data) {
        switch (cp_data[index].CALL_TYPE) {
            case "AJAX":
                executeAJAX(cp_data[index].COMMAND, cp_data[index].HTTP_METHOD, cp_data[index].RETURN_TYPE, cp_data[index].HTML_ELEMENT, cp_data[index].HEADER, cp_data[index].BODY);
                break;
            case "JS":
                executeFunction(cp_data[index].COMMAND);
                break;
        }
    }
}

function onPress() {
    callSpeechEngine($(event.target).text(), "0", "0");
}

function onSupportPress() {
    onStopPress();
    callSpeechEngine($(event.target).text() + " anzeigen", "0", "0");
}

function onStopPress() {
    $("#div-content").empty();
    callSpeechEngine("", "0", "stop");
}

function onBackPress() {
    callSpeechEngine("", "0", "back");
}

function KITT() {
    //console.log(RS_KITT_ACTIVE);
    if (typeof RS_RECORD_MODE !== 'undefined' && RS_RECORD_MODE == '1') {
        if (RS_KITT_ACTIVE_TS < RS_KITT_INTERVALL) {
            $("#kitton").show();
            $("#kittoff").hide();
        } else {
            $("#kittoff").show();
            $("#kitton").hide();
            RS_KITT_ACTIVE = 0;
        }
        setTimeout(KITT, 500);
    } else {
        if ((Math.floor(Date.now() / 1000) - RS_KITT_ACTIVE_TS) < RS_KITT_INTERVALL) {
            $("#kitton").show();
            $("#kittoff").hide();
        } else {
            $("#kittoff").show();
            $("#kitton").hide();
            RS_KITT_ACTIVE = 0;
        }
        setTimeout(KITT, 500);
    }
}

/**
 * Executes the given string as function.
 * 
 * @param {String} cp_functionCall     function call
 */
function executeFunction(cp_functionCall) {

    console.log("execute Funktion::::")

    var cv_functionName = cp_functionCall;
    cv_functionName = cv_functionName.substring(0, cv_functionName.indexOf('('));
    if (typeof window[cv_functionName] === 'function') {
        var cv_tempFunction = new Function(cp_functionCall);
        cv_tempFunction();
        if (cv_functionName == "sayText") {
            if ($("#tts_avatar_text").length) {
                // SayText extrahieren
                var dertext = "";
                var n = cp_functionCall.indexOf(",");
                if (n > 0) {
                    $("#tts_avatar_text").html(cp_functionCall.substr(9, n - 10).toUpperCase());
                }
            }
        }
    }
}

/**
 * Executes an AJAX call to the given url.
 * 
 * @param {String} cp_url              url
 * @param {String} cp_httpMethod       http method 
 * @param {String} cp_returnType       return type
 * @param {String} cp_htmlElement      html element
 * @param {String} cp_header           request header
 * @param {String} cp_body             request body
 */
function executeAJAX(cp_url, cp_httpMethod, cp_returnType, cp_htmlElement, cp_header, cp_body) {
    cp_header = allocateWildcards(cp_header);
    cp_body = allocateWildcards(cp_body);
    if (!cp_url.includes(RS_CLIENT_DOMAIN) && !cp_url.includes('https://fbe-iot-02.rwu.de')) {
        cp_url = RS_PROXY + rawurlencode(cp_url);
    }
    CallAction(cp_url, {
        use_ajax: true,
        type: cp_httpMethod,
        external_call: true,
        headers: cp_header,
        data: cp_body,
       /*  error: function (request, status, error) {

            console.log(error);
            console.log(request);
        }, */
        success: function (data) {
            switch (cp_returnType) {
                case "HTML":
                    $("#" + cp_htmlElement).html(data);
                    break;
                default:
                    if (typeof window[cp_returnType] === "function") {
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            console.log(e);
                        }
                        console.log("call")
                        window[cp_returnType](data);
                        console.log(cp_returnType)
                    }
                    break;
            }
        }
    });
}

/**
 * Allocates wildcards with the actual values stored in global variables.
 * 
 * @param {String} cp_jsonString   stringified JSON
 * 
 * @return {JSON} parsed JSON
 */
function allocateWildcards(cp_jsonString) {
    var cv_regex = RegExp(/GLOBAL_JS\w+/);
    var cv_params = [];
    if (cv_regex.test(cp_jsonString)) {
        var matches = cp_jsonString.match(cv_regex);
        for (var match of matches) {
            cv_params.push(match);
        }
    }
    for (var param of cv_params) {
        if (window[param]) {
            cp_jsonString = cp_jsonString.replace(param, window[param]);
        }
    }
    return (cp_jsonString) ? JSON.parse(cp_jsonString) : null;
}


// ACHTUNG!!! Redundant zu BACKEND
// NICHT 1:1 kopieren, client hat spezifische Teile (markiert!)
// #####################################
function CallAction(theurl, theparams)
// #####################################
{

    // Parameter (alle OPTIONAL)
    // #########################
    // loader_symbol: true, false
    // must_confirm: true, false
    // use_ajax: true, false
    // ALLE PARAMETER GEMÃ„ÃŸ JQUERY.AJAX werden durchgereicht! z.B.
    // success:    {Name der Callback-Funktion, die im Erfolgsfall aufgerufen wird}
    // error:      {Name der Callback-Funktion, die im Fehlerfall aufgerufen wird}
    //
    // Beispiel: CallAction("xxx_ajax.htm",{use_ajax:true,success:EIGENE_CALLBACK_success,loader_symbol:false,must_confirm:true});  
    //              function EIGENE_CALLBACK_success(data, textStatus, jqXHR) {

    // Default values
    if ((typeof (theparams["cache"]) == 'undefined') || (theparams["cache"] == null)) theparams["cache"] = false; // Standardwert
    if ((typeof (theparams["type"]) == 'undefined') || (theparams["type"] == null)) theparams["type"] = "POST"; // Standardwert
    if ((typeof (theparams["timeout"]) == 'undefined') || (theparams["timeout"] == null)) theparams["timeout"] = 30000; // Standardwert
    if ((typeof (theparams["loader_symbol"]) == 'undefined') || (theparams["loader_symbol"] == null)) theparams["loader_symbol"] = false; // Standardwert
    if ((typeof (theparams["must_confirm"]) == 'undefined') || (theparams["must_confirm"] == null)) theparams["must_confirm"] = false; // Standardwert
    if ((typeof (theparams["use_ajax"]) == 'undefined') || (theparams["use_ajax"] == null)) theparams["use_ajax"] = true; // Standardwert
    if ((typeof (theparams["encode"]) == 'undefined') || (theparams["encode"] == null)) theparams["encode"] = true; // Standardwert
    // client specific
    if ((typeof (theparams["success"]) == 'undefined') || (theparams["success"] == null)) theparams["success"] = AjaxStandardSuccess; // Standardwert
    // client specific
    if ((typeof (theparams["error"]) == 'undefined') || (theparams["error"] == null)) theparams["error"] = AjaxStandardFailure; // Standardwert
    // not in client    if ((typeof (theparams["external_call"]) == 'undefined') || (theparams["external_call"] == null)) theparams["external_call"] = false; // Standardwert
    if ((typeof (theparams["data"]) == 'undefined') || (theparams["data"] == null)) theparams["data"] = null; // Standardwert
    if ((typeof (theparams["headers"]) == 'undefined') || (theparams["headers"] == null)) theparams["headers"] = null; // Standardwert

    // not in client    if (!theparams["external_call"]) theurl = CompleteURL(theurl);

    // Confirm ?
    var Check = true;
    if (theparams["must_confirm"]) Check = confirm("Are you sure?");
    //console.log("CallAction with URL="+theurl+" PARAMS: "+JSON.stringify(theparams));
    if (Check == true) {
        if (theparams["loader_symbol"]) ShowLoader();
        if (theparams["use_ajax"]) $.ajax(theurl, theparams);
        else location.href = theurl;
    }
}


// #####################################
function AjaxStandardFailure(jqXHR, textStatus, errorThrown)
// #####################################
{

    console.log("was soll der schmutz hier??????ß")

    console.log("AJAX Standard Failure Routine:");
}

// #####################################
function AjaxStandardSuccess(jqXHR, textStatus, errorThrown)
// #####################################
{
    console.log("AJAX Standard Success Routine:");
}

// ACHTUNG!!! Redundant zu BACKEND
// #############################################
function rawurlencode(str) {
    // #############################################
    //       discuss at: https://locutus.io/php/rawurlencode/
    //      original by: Brett Zamir (https://brett-zamir.me)
    //         input by: travc
    //         input by: Brett Zamir (https://brett-zamir.me)
    //         input by: Michael Grier
    //         input by: Ratheous
    //      bugfixed by: Kevin van Zonneveld (https://kvz.io)
    //      bugfixed by: Brett Zamir (https://brett-zamir.me)
    //      bugfixed by: Joris
    // reimplemented by: Brett Zamir (https://brett-zamir.me)
    // reimplemented by: Brett Zamir (https://brett-zamir.me)
    //           note 1: This reflects PHP 5.3/6.0+ behavior
    //           note 1: Please be aware that this function expects \
    //           note 1: to encode into UTF-8 encoded strings, as found on
    //           note 1: pages served as UTF-8
    //        example 1: rawurlencode('Kevin van Zonneveld!')
    //        returns 1: 'Kevin%20van%20Zonneveld%21'
    //        example 2: rawurlencode('https://kvz.io/')
    //        returns 2: 'https%3A%2F%2Fkvz.io%2F'
    //        example 3: rawurlencode('https://www.google.nl/search?q=Locutus&ie=utf-8')
    //        returns 3: 'https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'

    str = (str + '')

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
    // but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/\s/g, '%20')

}

// ACHTUNG!!! Redundant zu BACKEND
// #############################################
function rawurldecode(str) {
    // #############################################
    //       discuss at: https://locutus.io/php/rawurldecode/
    //      original by: Brett Zamir (https://brett-zamir.me)
    //         input by: travc
    //         input by: Brett Zamir (https://brett-zamir.me)
    //         input by: Ratheous
    //         input by: lovio
    //      bugfixed by: Kevin van Zonneveld (https://kvz.io)
    // reimplemented by: Brett Zamir (https://brett-zamir.me)
    //      improved by: Brett Zamir (https://brett-zamir.me)
    //           note 1: Please be aware that this function expects to decode
    //           note 1: from UTF-8 encoded strings, as found on
    //           note 1: pages served as UTF-8
    //        example 1: rawurldecode('Kevin+van+Zonneveld%21')
    //        returns 1: 'Kevin+van+Zonneveld!'
    //        example 2: rawurldecode('https%3A%2F%2Fkvz.io%2F')
    //        returns 2: 'https://kvz.io/'
    //        example 3: rawurldecode('https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3D')
    //        returns 3: 'https://www.google.nl/search?q=Locutus&ie='

    return decodeURIComponent((str + '')
        .replace(/%(?![\da-f]{2})/gi, function () {
            // PHP tolerates poorly formed escape sequences
            return '%25'
        }))
}