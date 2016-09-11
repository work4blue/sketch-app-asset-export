@import 'common.js'

var presets = {
        xcodeProjectPath: '',
        androidResPath:'',
        otherPath:'',
        exportXcode:1,
        exportAndroid:1,
        exportOther:1,
}       
var userDefaults = initDefaults(presets)



var onRun = function(context){

// NSMakeRect 的原点是左下角

  log("hello onRun");

    var accessory = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,280));


  var checkboxXCode = NSButton.alloc().initWithFrame(NSMakeRect(0,214,300,25));
    checkboxXCode.setButtonType(3);
    checkboxXCode.title = 'Input XCode Project (xcodeproj) folder';
  //  checkboxXCode.state =  userDefaults.exportXcode;

   
 var textXcode = NSTextView.alloc().initWithFrame(NSMakeRect(0,194,300,20));
    textXcode.string = '( or drop you project or workspace file to here)';
    textXcode.drawsBackground = false;
    textXcode.editable = false;


   var xcodeInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,170,300,25));
   // xcodeInput.stringValue = userDefaults.xcodeProjectPath;
    xcodeInput.editable = true;
    xcodeInput.placeholder="Drop you project or workspace file to here"

    var checkboxAndroid = NSButton.alloc().initWithFrame(NSMakeRect(0,124,300,25));
    checkboxAndroid.setButtonType(3);
    checkboxAndroid.title = 'Input Android Resource (res) folder';
 //   checkboxAndroid.state = userDefaults.exportAndroid;



var textAndroid = NSTextView.alloc().initWithFrame(NSMakeRect(0,104,300,20));
    textAndroid.string = '(or drop you AndroidManifest.xml file to here)';
    textAndroid.drawsBackground = false;
    textAndroid.editable = false;

   var androidInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,80,300,25));
 //   androidInput.stringValue = userDefaults.androidResPath;
    androidInput.editable = true;


      var checkboxOther = NSButton.alloc().initWithFrame(NSMakeRect(0,36,300,25));
    checkboxOther.setButtonType(3);
    checkboxOther.title = 'Input open SDK icon directory';
  //  checkboxOther.state = userDefaults.exportOther;

var otherInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,12,300,25));
   // otherInput.stringValue = userDefaults.otherPath;
    otherInput.editable = true;


   accessory.addSubview(xcodeInput);
   accessory.addSubview(textXcode);
   accessory.addSubview(checkboxOther);
   accessory.addSubview(androidInput);
    accessory.addSubview(textAndroid);
   accessory.addSubview(checkboxAndroid);
    accessory.addSubview(otherInput);
     accessory.addSubview(checkboxXCode);


    var alert = NSAlert.alloc().init();
    alert.setMessageText('App Asset export directory');
    alert.addButtonWithTitle('Save preferences');
    alert.addButtonWithTitle('Cancel');
     alert.setIcon(NSImage.alloc().initWithContentsOfFile(
      context.plugin.urlForResourceNamed('logo.png').path()));
    alert.setAccessoryView(accessory);

    var responseCode = alert.runModal();


     if (responseCode === 1000) {

         userDefaults.xcodeProjectPath = xcodeInput.stringValue();
         userDefaults.androidResPath = androidInput.stringValue();
         userDefaults.otherPath = otherInput.stringValue();

         //log(@"save input xcode"+xcodeInput.stringValue())
        saveDefaults(userDefaults)  ;

        //NSApplication.sharedApplication().displayDialog_withTitle_("result", xcodeInput.stringValue);
    }
    else {
       //NSApplication.sharedApplication().displayDialog_withTitle_("result2", androidInput.stringValue);
    }
}