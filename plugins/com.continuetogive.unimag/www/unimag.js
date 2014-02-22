
var unimag = {};

(function(){

// ----------------------------------------------------------------------------------
// unimag
// ----------------------------------------------------------------------------------
function unimagModule(){
  var um = {};

  //-----------------------------------------------------------------
  //activation
  //-----------------------------------------------------------------
  um.NotifEnum = {
    Attach     :"Attach"    ,
    Detach     :"Detach"    ,
    Connect    :"Connect"   ,
    Disconnect :"Disconnect",
  };
 
  var isSDKActive = false;
 
  um.isSDKActive = function() {
    return isSDKActive;
  };
 
  um.activateSDK = function(notifCallback) {
      argscheck.checkArgs('f', 'unimag.activateSDK', arguments);
      isSDKActive = true;
      cordova.exec(notifCallback, null, "UniMag", "activateSDK", []);
  };

  um.deactivateSDK = function() {
      isSDKActive = false;
      cordova.exec(null, null, "UniMag", "deactivateSDK", []);
  };

  //-----------------------------------------------------------------
  //get status
  //-----------------------------------------------------------------
  um.isSDKConfigured   = function (valueCallback) {
    argscheck.checkArgs('f' , 'unimag.isSDKConfigured', arguments);
    if (!isSDKActive) return;
    valueCallback(true); //iOS uniMag SDK is always configured
  };
  um.isReaderAttached  = function (valueCallback) {
    argscheck.checkArgs('f' , 'unimag.isReaderAttached', arguments);
    if (!isSDKActive) return;
    cordova.exec(valueCallback, null, "UniMag", "isReaderAttached" , []);
  };
  um.isReaderConnected = function (valueCallback) {
    argscheck.checkArgs('f' , 'unimag.isReaderConnected', arguments);
    if (!isSDKActive) return;
    cordova.exec(valueCallback, null, "UniMag", "isReaderConnected", []);
  };
  um.getRunningTask    = function (valueCallback) {
    argscheck.checkArgs('f' , 'unimag.getRunningTask', arguments);
    if (!isSDKActive) return;
    cordova.exec(valueCallback, null, "UniMag", "getRunningTask"   , []);
  };
 
  //-----------------------------------------------------------------
  //start and stop task
  //-----------------------------------------------------------------
  //types
  um.TaskEnum = {
    Connect         :"Connect"    ,
    Swipe           :"Swipe"      ,
    SendCommand     :"SendCommand",
  };
  um.TaskNotifEnum = {
    Started         :"Started"    ,
    StartFailed     :"StartFailed",
    Update          :"Update"     ,
    Stopped         :"Stopped"    ,
  };
  um.CommandEnum = {
    GetVersion      :"GetVersion"     ,
    GetSettings     :"GetSettings"    ,
    EnableTDES      :"EnableTDES"     ,
    EnableAES       :"EnableAES"      ,
    GetSerialNumber :"GetSerialNumber",
    ClearBuffer     :"ClearBuffer"    ,
  };
 
  //stop
  um.stopTask = function() {
    if (!isSDKActive) return;
    cordova.exec(null, null, "UniMag", "stopTask", []);
  };
 
  //start
  function getTaskCallbackWrapper(taskCallback) {
    return function(dict) {
      taskCallback(dict.taskEnum, dict.taskNotifEnum, dict.info || {});
    };
  }
  /**
  var example_taskCallback = function(taskEnum, taskNotifEnum, info) {};
  */
  um.startTaskConnect      = function (taskCallback) {
    argscheck.checkArgs('f' , 'unimag.startTaskConnect'    , arguments);
    if (!isSDKActive) return;
    cordova.exec(getTaskCallbackWrapper(taskCallback), null, "UniMag", "startTaskConnect"    , []);
  };
  um.startTaskSwipe        = function (taskCallback) {
    argscheck.checkArgs('f' , 'unimag.startTaskSwipe'      , arguments);
    if (!isSDKActive) return;
    cordova.exec(getTaskCallbackWrapper(taskCallback), null, "UniMag", "startTaskSwipe"      , []);
  };
  um.startTaskSendCommand  = function (taskCallback, command) {
    argscheck.checkArgs('fs', 'unimag.startTaskSendCommand', arguments);
    if (!isSDKActive) return;
    if (!um.CommandEnum[command]) {
      var errMsg = 'unimag.startTaskSendCommand called with unexpected command "'+command+'"';
      console.error(errMsg);
      throw TypeError(errMsg);
    }
    cordova.exec(getTaskCallbackWrapper(taskCallback), null, "UniMag", "startTaskSendCommand", [command]);
  };
 
  //-----------------------------------------------------------------
  //set and get SDK setting
  //-----------------------------------------------------------------
 
  return um;
}

// ----------------------------------------------------------------------------------
// argscheck
// ----------------------------------------------------------------------------------
//this module copied from Cordova
function argscheckModule(){
  var typeMap = {
      'A': 'Array',
      'D': 'Date',
      'N': 'Number',
      'S': 'String',
      'F': 'Function',
      'O': 'Object'
  };
  function checkArgs(spec, functionName, args) {
      var errMsg = null;
      var typeName;
      for (var i = 0; i < spec.length; ++i) {
          var c = spec.charAt(i),
              cUpper = c.toUpperCase(),
              arg = args[i];
          // Asterix means allow anything.
          if (c == '*') {
              continue;
          }
          typeName = Object.prototype.toString.call(arg).slice(8, -1);
          if ((arg === null || arg === undefined) && c == cUpper) {
              continue;
          }
          if (typeName != typeMap[cUpper]) {
              errMsg = 'Expected ' + typeMap[cUpper];
              break;
          }
      }
      if (errMsg) {
          errMsg += ', but got ' + typeName + '.';
          errMsg = 'Wrong type for parameter ' + i + ' of ' + functionName + ': ' + errMsg;
          console.error(errMsg);
          throw TypeError(errMsg);
      }
  }
  function getValue(value, defaultValue) {
      return value === undefined ? defaultValue : value;
  }
  return {
    checkArgs:checkArgs,
    getValue:getValue
  };
}

//export
var argscheck = argscheckModule();
window.unimag = unimagModule();

}());
