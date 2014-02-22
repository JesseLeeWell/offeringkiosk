
#import "CDVUniMag.h"
#import "uniMag.h"

#define LOGI(fmt, ...) NSLog(@"CDVUniMag: " fmt, ##__VA_ARGS__)

@interface CDVUniMag () {
    uniMag   *uniReader;       //reference to native iOS uniMag SDK
}

@property (retain, nonatomic) NSString *notifCallbackID;  //callbackID used for attachment/connection notification
@property (retain, nonatomic) NSString *taskCallbackID;  //callbackID used for notification related to the current task
@end

@implementation CDVUniMag

@synthesize notifCallbackID=_notifCallbackID;
@synthesize taskCallbackID=_taskCallbackID;

//-----------------------------------------------------------------------------
#pragma mark Life cycle
//-----------------------------------------------------------------------------
/*
- (void)pluginInitialize {
    LOGI(@"pluginInitialize");
    
    [super pluginInitialize];
}*/
- (void)dealloc
{
    LOGI(@"dealloc");
    
    [self deactivateSDK: nil];
    [super dealloc];
}
- (void)dispose
{
    LOGI(@"dispose");
    
    [self deactivateSDK: nil];
    [super dispose];
}
- (void)onReset
{
    LOGI(@"onReset");
    
    [self deactivateSDK: nil];
    [super onReset];
}

- (void)activateSDK:  (CDVInvokedUrlCommand*)command {
    LOGI(@"activateSDK");
    
    if (uniReader != nil)
        return;
    
    self.notifCallbackID = command.callbackId;
    
    //register observers for all uniMag notifications
	[self umsdk_registerObservers:TRUE];

	//enable info level NSLogs inside SDK
    // Here we turn on before initializing SDK object so the act of initializing is logged
    [uniMag enableLogging:TRUE];
    
    //initialize the SDK by creating a uniMag class object
    uniReader = [[uniMag alloc] init];
    
    //set swipe timeout to infinite. By default, swipe task will timeout after 20 seconds
	[uniReader setSwipeTimeoutDuration:0];

    //make SDK maximize the volume automatically during connection
    [uniReader setAutoAdjustVolume:TRUE];
}
- (void)deactivateSDK:(CDVInvokedUrlCommand*)command {
    LOGI(@"deactivateSDK");
    
    if (uniReader == nil)
        return;
    
    //deallocating the uniMag object deactivates the uniMag SDK
    [uniReader release];
    uniReader = nil;
    
    //it is the responsibility of SDK client to unregister itself as notification observer
    [self umsdk_registerObservers:FALSE];
    
    //clear callback ID
//    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @""];
//    [pluginResult setKeepCallbackAsBool: FALSE];
//    [self.commandDelegate sendPluginResult:pluginResult callbackId:notifCallbackID];
    self.notifCallbackID = nil;
}

-(void) umsdk_registerObservers:(BOOL) reg {
	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
    
    //list of notifications and their corresponding selector
    const struct {NSString *n; SEL s;} noteAndSel[] = {
        //
        {uniMagAttachmentNotification       , @selector(umDevice_attachment:)},
        {uniMagDetachmentNotification       , @selector(umDevice_detachment:)},
        //
        {uniMagTimeoutNotification          , @selector(umConnection_timeout:)},
        {uniMagDidConnectNotification       , @selector(umConnection_connected:)},
        {uniMagDidDisconnectNotification    , @selector(umConnection_disconnected:)},
        //
        {uniMagTimeoutSwipeNotification     , @selector(umSwipe_timeout:)},
        {uniMagDataProcessingNotification   , @selector(umDataProcessing:)},
        {uniMagInvalidSwipeNotification     , @selector(umSwipe_invalid:)},
        {uniMagDidReceiveDataNotification   , @selector(umSwipe_receivedSwipe:)},
        //
        {uniMagCommandTimeoutNotification   , @selector(umCommand_timeout:)},
        {uniMagDidReceiveCmdNotification    , @selector(umCommand_receivedResponse:)},
        
        {nil, nil},
    };
    
    //register or unregister
    for (int i=0; noteAndSel[i].s != nil ;i++) {
        if (reg)
            [nc addObserver:self selector:noteAndSel[i].s name:noteAndSel[i].n object:nil];
        else
            [nc removeObserver:self name:noteAndSel[i].n object:nil];
    }
}

//-----------------------------------------------------------------------------
#pragma mark - Get state
//-----------------------------------------------------------------------------
- (void)isReaderAttached:(CDVInvokedUrlCommand*)command {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: [uniReader isReaderAttached]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isReaderConnected:(CDVInvokedUrlCommand*)command {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: [uniReader getConnectionStatus]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)getRunningTask:(CDVInvokedUrlCommand*)command {
    UmTask umtask = [uniReader getRunningTask];
    NSString *task;
    switch (umtask) {
    case UMTASK_NONE     : task=@"none"          ; break;
    case UMTASK_CONNECT  : task=@"connect"       ; break;
    case UMTASK_SWIPE    : task=@"swipe"         ; break;
    case UMTASK_CMD      : task=@"sendCommand"   ; break;
    case UMTASK_FW_UPDATE: task=@"updateFirmware"; break;
    }
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: task];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

//-----------------------------------------------------------------------------
#pragma mark - Start / stop task
//-----------------------------------------------------------------------------

- (void)stopTask:(CDVInvokedUrlCommand*)command {
    [uniReader cancelTask];
    
    //TODO: removed this hack. Implement proper task notification
    //If a task is still going on at the js side, fire a stopped
    if ( self.taskCallbackID ) {
        [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
            info: [NSNumber numberWithBool:FALSE], @"ok", nil];
    }
}

static inline NSString* UmRet_to_js(UmRet c) {
    switch (c) {
    case UMRET_SUCCESS          : return @"SUCCESS";
    case UMRET_NO_READER        : return @"NO_READER";
    case UMRET_SDK_BUSY         : return @"SDK_BUSY";
    case UMRET_MONO_AUDIO       : return @"MONO_AUDIO";
    case UMRET_ALREADY_CONNECTED: return @"ALREADY_CONNECTED";
    case UMRET_LOW_VOLUME       : return @"LOW_VOLUME";
    case UMRET_NOT_CONNECTED    : return @"NOT_CONNECTED";
    case UMRET_UF_INVALID_STR   : return @"UF_INVALID_STR";
    case UMRET_UF_NO_FILE       : return @"UF_NO_FILE";
    case UMRET_UF_INVALID_FILE  : return @"UF_INVALID_FILE";
    default: return @"<unknown code>";
    }
}
- (void)startTaskConnect:(CDVInvokedUrlCommand*)command {
    self.taskCallbackID = command.callbackId;
    
    UmRet r = [uniReader startUniMag: TRUE];
    if (r == UMRET_SUCCESS) {
        [self sendTaskNotif:TaskEnum.Connect type:TaskNotifEnum.Started     info: nil];
    }
    else {
        [self sendTaskNotif:TaskEnum.Connect type:TaskNotifEnum.StartFailed
            info: UmRet_to_js(r), @"StartFailedReason", nil];
    }
}

- (void)startTaskSwipe:(CDVInvokedUrlCommand*)command {
    self.taskCallbackID = command.callbackId;
    
    UmRet r = [uniReader requestSwipe];
    if (r == UMRET_SUCCESS) {
        [self sendTaskNotif:TaskEnum.Swipe   type:TaskNotifEnum.Started     info: nil];
    }
    else {
        [self sendTaskNotif:TaskEnum.Swipe   type:TaskNotifEnum.StartFailed
            info: UmRet_to_js(r), @"StartFailedReason", nil];
    }
}

- (void)startTaskSendCommand:(CDVInvokedUrlCommand*)command {
    self.taskCallbackID = command.callbackId;
    
    NSString *cmd = [command.arguments objectAtIndex:0];
    SEL sel = NSSelectorFromString([NSString stringWithFormat: @"sendCommand%@", cmd]);
    UmRet r = (UmRet)[uniReader performSelector: sel];
    
    if (r == UMRET_SUCCESS) {
        [self sendTaskNotif:TaskEnum.SendCommand type:TaskNotifEnum.Started     info: nil];
    }
    else {
        [self sendTaskNotif:TaskEnum.SendCommand type:TaskNotifEnum.StartFailed
            info: UmRet_to_js(r), @"StartFailedReason", nil];
    }
}

//-----------------------------------------------------------------------------
#pragma mark - Set/Get configuration
//-----------------------------------------------------------------------------

- (void)foo:(CDVInvokedUrlCommand*)command {
    CDVPluginResult* pluginResult = nil;
    NSString* myarg = [command.arguments objectAtIndex:0];

    if (myarg != nil) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: myarg];
    } else { 
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Arg was null"];
    }
    
    [pluginResult setKeepCallbackAsBool: TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    [pluginResult setKeepCallbackAsBool: FALSE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


static struct {
    NSString *Attach     ;
    NSString *Detach     ;
    NSString *Connect    ;
    NSString *Disconnect ;
} NotifEnum = {
    @"Attach"    ,
    @"Detach"    ,
    @"Connect"   ,
    @"Disconnect",
};

static struct {
    NSString *Connect    ;
    NSString *Swipe      ;
    NSString *SendCommand;
} TaskEnum = {
    @"Connect"    ,
    @"Swipe"      ,
    @"SendCommand",
};

static struct {
    NSString *Started     ;
    NSString *StartFailed ;
    NSString *Update      ;
    NSString *Stopped     ;
} TaskNotifEnum = {
    @"Started"    ,
    @"StartFailed",
    @"Update"     ,
    @"Stopped"    ,
};

//-----------------------------------------------------------------------------
#pragma mark - uniMag SDK notification handlers
//-----------------------------------------------------------------------------

-(void)sendNotif:(NSString*)notif {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: notif];
    [pluginResult setKeepCallbackAsBool: TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.notifCallbackID];
}

-(void)sendTaskNotif:(NSString*)task type:(NSString*)type
    info:(id)firstValue, ... NS_REQUIRES_NIL_TERMINATION
{
    //this shouldn't happen. But if it does, ignore it
    if (self.taskCallbackID == nil)
        return;
    
    //make info dictionary from variadic arg
    NSMutableDictionary *info = [NSMutableDictionary dictionary];
    va_list vaList;
    va_start(vaList, firstValue);
    for (id v=firstValue; v!=nil; v=va_arg(vaList, id)) {
        id k = va_arg(vaList, id);
        [info setObject: v forKey: k];
    }
    va_end(vaList);
    
    //build wrapper dict for sending through cordova
    NSDictionary *callbackDict = [NSDictionary dictionaryWithObjectsAndKeys:
        task, @"taskEnum",
        type, @"taskNotifEnum",
        info, @"info",
    nil];
    
    //some asserts
    BOOL isSendingStoppedNotif = [TaskNotifEnum.Stopped isEqualToString: type];
    BOOL isTaskRunning = [uniReader getRunningTask]!=UMTASK_NONE;
    if (isSendingStoppedNotif)
        assert(!isTaskRunning);
    
    //send. Will remove taskCallbackID if task stopped
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
        messageAsDictionary: callbackDict];
    [result setKeepCallbackAsBool: isTaskRunning];
    [self.commandDelegate sendPluginResult:result callbackId: self.taskCallbackID];
    if ( ! isTaskRunning )
        self.taskCallbackID = nil;
}

static NSArray *getArrayFromData(NSData *data) {
    const unsigned char *b = data.bytes;
    NSUInteger len = data.length;
    NSMutableArray *ret = [NSMutableArray arrayWithCapacity: sizeof(NSNumber*)*len];
    for (int i=0; i<len; i++)
        [ret addObject: [NSNumber numberWithUnsignedChar: b[i]] ];
    return ret;
}

#pragma mark attachment

//called when uniMag is physically attached
- (void)umDevice_attachment:(NSNotification *)notification {
    [self sendNotif: NotifEnum.Attach];
}

//called when uniMag is physically detached
- (void)umDevice_detachment:(NSNotification *)notification {
    //TODO: removed this hack. Implement proper task notification
    //If a task is still going on at the js side, fire a stopped
    if ( self.taskCallbackID ) {
        [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
            info: [NSNumber numberWithBool:FALSE], @"ok", nil];
    }
    
    [self sendNotif: NotifEnum.Detach];
}

#pragma mark connection task

//called when SDK failed to handshake with reader in time. ie, the connection task has timed out
- (void)umConnection_timeout:(NSNotification *)notification {
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:FALSE], @"ok", nil];
}

//called when the connection task is successful. SDK's connection state changes to true
- (void)umConnection_connected:(NSNotification *)notification {
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:TRUE], @"ok", nil];
    
    [self sendNotif: NotifEnum.Connect];
}

//called when SDK's connection state changes to false. This happens when reader becomes 
// physically detached or when a disconnect API is called
- (void)umConnection_disconnected:(NSNotification *)notification {
    [self sendNotif: NotifEnum.Disconnect];
}

#pragma mark swipe task

//called when the SDK hasn't received a swipe from the device within a configured
// "swipe timeout interval".
- (void)umSwipe_timeout:(NSNotification *)notification {
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:FALSE], @"ok", nil];
}

//called when the SDK has read something from the uniMag device 
// (eg a swipe, a response to a command) and is in the process of decoding it
// Use this to provide an early feedback on the UI 
- (void)umDataProcessing:(NSNotification *)notification {
    if ([uniReader getRunningTask]!=UMTASK_SWIPE)
        return;
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Update info: nil];
}

//called when SDK failed to read a valid card swipe
- (void)umSwipe_invalid:(NSNotification *)notification {
    NSData *cardData = notification.object;
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:FALSE], @"ok", getArrayFromData(cardData), @"data", nil];
}

//called when SDK received a swipe successfully
- (void)umSwipe_receivedSwipe:(NSNotification *)notification {
    NSData *cardData = notification.object;
    [self sendTaskNotif: TaskEnum.Connect type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:TRUE ], @"ok", getArrayFromData(cardData), @"data", nil];
}

#pragma mark command task

//called when SDK failed to receive a command response within a configured
// "command timeout interval"
- (void)umCommand_timeout:(NSNotification *)notification {
    [self sendTaskNotif: TaskEnum.SendCommand type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:FALSE], @"ok", nil];
}

//called when SDK successfully received a response to a command
- (void)umCommand_receivedResponse:(NSNotification *)notification {
    NSData *cmdResponse = notification.object;
    [self sendTaskNotif: TaskEnum.SendCommand type: TaskNotifEnum.Stopped
        info: [NSNumber numberWithBool:TRUE ], @"ok", getArrayFromData(cmdResponse), @"data", nil];
}

@end
