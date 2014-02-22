
#import <Cordova/CDV.h>



@interface CDVUniMag : CDVPlugin

- (void)foo:(CDVInvokedUrlCommand*)command;

//Life cycle
- (void)activateSDK:  (CDVInvokedUrlCommand*)command;
- (void)deactivateSDK:(CDVInvokedUrlCommand*)command;

/*




//
version


//status
isSDKActive
isSDKConfigured
isReaderAttached
isReaderConnected
getRunningTask

//config
autoConnect
swipeTimeoutInterval
commandTimeoutInterval

//task
stopTask
startTaskConnect
startTaskSwipe
startTaskSendCommand
    GetVersion;
    GetSettings;
    EnableTDES;
    EnableAES;
    DefaultGeneralSettings;
    GetSerialNumber;
    GetNextKSN;
    EnableErrNotification;
    DisableErrNotification;
    EnableExpDate;
    DisableExpDate;
    EnableForceEncryption;
    DisableForceEncryption;
    SetPrePAN: (NSInteger) prePAN;
    ClearBuffer;
startTaskCheckFirmware
startTaskUpdateFirmware


// troubleshooting
+(void) enableLogging:(BOOL) enable;
-(NSData*) getWave;
-(BOOL) setWavePath:(NSString*) path;



-(float) getVolumeLevel;
-(void) setAutoAdjustVolume:(BOOL) b;
-(void) setDeferredActivateAudioSession:(BOOL) b;
-(NSData*) getFlagByte;


//Notification

  //physical attachment state
UniMagAttach
UniMagDetach

  //connection state
UniMagConnect
UniMagDisconnect

  //task change
UniMagTaskStart
UniMagTaskUpdate
UniMagTaskEnd
  "connect"
  "swipe"
  "send_command"
  "auto_config"
  "firmware_update"
  
  
  //task start
UniMagPowering
UniMagSwipe
UniMagCmdSending
  
  //task start error
UniMagInsufficientPower
UniMagMonoAudioError

  //task update
UniMagDataProcessing
UniMagInvalidSwipe
  
  //task end result
UniMagTimeout
UniMagTimeoutSwipe
UniMagDidReceiveData
UniMagCommandTimeout
UniMagDidReceiveCmd

  //multi use
UniMagSystemMessage


*/
@end
