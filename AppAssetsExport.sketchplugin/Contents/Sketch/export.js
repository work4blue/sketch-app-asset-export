@import 'common.js'

var presets = {
        xcodeProjectPath: '/Users/Shared/AppIcon/Assets.xcassets',
        androidResPath:'/Users/Shared/AppIcon/res',
        otherPath:'/Users/Shared/AppIcon',
        exportXcode:1,
        exportAndroid:1,
        exportOther:1,
        exportIphoneIcon:1,
        exportIpadIcon:0,
        exportAppleWatchIcon:0,
        exportMacIcon:0
}   ;    

//83.5-->167 iPad Pro

var doc,
    exportDir, 
    exportInfo,
    appIconSetPath,
    defalutPath = "/Users/Shared/AppIcon",
    currentLayer,
    iOSSuffixArray = ["60@2x","60@3x","76","76@2x","Small-40","Small-40@2x",
                          "Small-40@3x","Small","Small@2x","Small@3x","83.5@2x"],
    iOSSizeArray = [ 120,180,76,152,40,80,120,29,58,87,167],
    iOSBaseArray = [ 60,60,76,76,40,40,40,29,29,29,83.5],

    androidDirArray = ["ldpi","mdpi","hdpi","xhdpi","xxhdpi","xxxhdpi"],
    androidSizeArray = [ 36,48,72,96,144,192],

     storeSuffixArray = [ "iTunesArtwork","iTunesArtwork@2x","GooglePlay","mi-90","mi-136","mi-168","mi-192","mi-224","qq-16","qq-512"],
      storeSizeArray = [ 512,1024,512,90,136,168,192,224,16,512];


  var userDefaults = loadDefaults(presets);
    

 function hasSuffix(str,suffix){
 	// if (typeof String.prototype.endsWith != 'function') {
  //      String.prototype.endsWith = function (str){
  //         return this.slice(-str.length) == str;
  //      };
  //    }
     return str.slice(-suffix.length) == suffix;
 }  

 function hasPrefix(str,prefix){
 // if (typeof String.prototype.startsWith != 'function') 
 //       String.prototype.startsWith = function (str){
 //          return this.slice(0, str.length) == str;
 //       };
 //     }
         return str.slice(0, prefix.length) == prefix;
 }   



function exportScaleLayer(layer,dir,width,suffix){
     
      frame = [layer frame];
     var scale = width / [frame width];

     var name2 = layer.name()+"-"+suffix+".png";




     var path = dir+"/"+ name2;

     log("exportScaleLayer2 "+path)

     exportLayerToPath(layer,path,scale,"png","-"+suffix);
        
     

     return  name2;
    
 }



 function initVars(context){
 	doc = context.document;
 	exportDir = "/Users/pro/Documents/AppIcon";

 	
 }

 function checkExportDir(path,suffix){
    if(typeof path == 'undefined'){
       path  = "/User/Shared/AppIcon";
    }

    if(path.endsWith("/"+suffix)){
       createFolderAtPath(path);

       
       
    }
    else {

      createFolderAtPath(path);

      // var isEnd = path.endsWith("\/");
      // var isEnd2 = path.endsWith("/");

      // log(" path "+path+" isEnd "+isEnd+","+isEnd2);

      //  if(isEnd == false){

      //    path += "\/";

      //     log("checkExportDir add splite2 "+path+","+path.endsWith("\/"));
      //  }

       path += "/"+suffix;

       createFolderAtPath(path);

       log("checkExportDir2 "+path); 
    }

    appIconSetPath = path;

    log("checkExportDir "+path);
 }


//Assets.xcassets
//Images.xcassets

function findImage(imagesArray,filename){

 

  for(i=0;i<imagesArray.length; i++){
      var imageObj =  imagesArray[i];
      if(imageObj.filename == filename)
        return true;

  }

  return false;
}

//在Content中增加相应记录
 function addIconContent(imagesArray,name,suffix,isIpad){
      // var suffix =  iOSSuffixArray[index];

       var index = -1;
       var scale = "1x";

       for(var i=0; i< iOSSuffixArray.length ; i++){
             if(iOSSuffixArray[i] == suffix){
                index = i;
                break;
             }
       }


       if(index == -1){
          log(" addIconContent failure suffix "+suffix);
          return ;
       }

      

       var baseSize =  iOSBaseArray[index];
       var sizeStr =  ""+baseSize+"x"+baseSize;

         if(suffix.endsWith("@2x"))
              scale = "2x";
            else if (suffix.endsWith("@3x"))
               scale = "3x";

            var device = (isIpad ? "ipad" : "iphone");
            var filename = name+"-"+suffix+".png";


            if(!findImage(imagesArray,filename)){
                log("no find "+filename+",export ");
                var size =  iOSSizeArray[index];
                exportScaleLayer(currentLayer,appIconSetPath,size,suffix);
            }
            else {
              log(" find "+filename);
            }

            //查找是否已经生成,如果没有则生成

             var  imageObj = {              
                  idiom : device,
                  size:sizeStr,
                  scale : scale,
                  filename : filename
             }
            imagesArray.push(imageObj)     
           //imagesArray.splice(0,0,imageObj); //插入头部 

 }

function exportIphoneContentJson(layer,imagesArray){
   var name = layer.name();

   addIconContent(imagesArray,name,"Small",0); //Small
   addIconContent(imagesArray,name,"Small@2x",0); 
   addIconContent(imagesArray,name,"Small@3x",0); 

    //addIconContent(imagesArray,name,"Small-40",0); 
    addIconContent(imagesArray,name,"Small-40@2x",0); 
    addIconContent(imagesArray,name,"Small-40@3x",0); 

   addIconContent(imagesArray,name,"60@2x",0); 
   addIconContent(imagesArray,name,"60@3x",0); 
   // addIconContent(imagesArray,name,"76",0); 
   // addIconContent(imagesArray,name,"76@2x",0); 

}

function exportIpadContentJson(layer,imagesArray){
   var name = layer.name();

    addIconContent(imagesArray,name,"Small-40",1); 
    addIconContent(imagesArray,name,"Small-40@2x",1); 


   addIconContent(imagesArray,name,"76",1); 
   addIconContent(imagesArray,name,"76@2x",1); 
   addIconContent(imagesArray,name,"83.5@2x",1); 

  

    addIconContent(imagesArray,name,"Small",1); 
    addIconContent(imagesArray,name,"Small@2x",1); 
  
}

function exportWatchContentJson(layer,imagesArray){
  
}

function exportIOSIcon(layer){
   //var tmpDir =  "/Users/pro/Documents/AppIcon";

       checkExportDir(userDefaults.xcodeProjectPath,"AppIcon.appiconset");
   

   // var  tmpDir =  userDefaults.xcodeProjectPath;
   //   var    appIconSetPath =  tmpDir + "/AppIcon.appiconset";

   // createFolderAtPath(tmpDir);


   //       log("out "+appIconSetPath );

   //       doc.showMessage("eeekkk");

   //       if (!createFolderAtPath(appIconSetPath)) {
   //        doc.showMessage("create "+appIconSetPath+" failure!");
   //        return;
   //       }

          //输出所需图片
          var imagesArray = [];
          currentLayer = layer;

       


        if(userDefaults.exportIpadIcon == 1)
         {
                
            exportIpadContentJson(layer,imagesArray);

         }
         
         if(userDefaults.exportIphoneIcon ==1){
             exportIphoneContentJson(layer,imagesArray);
         }


         exportInfo += "export iOS icon to "+ appIconSetPath +"\n";


       imageContent = {
        info : {
          version : 1,
          author : "bluedrum"
        },
        images : imagesArray
      }


      var filePath = appIconSetPath + "/Contents.json"
      log("json file2 "+filePath);
      var jsonString = stringify(imageContent, true)  
          writeTextToFile(jsonString, filePath)
}

function exportStoreIcon(layer){
        //var tmpDir =  "/Users/pro/Documents/AppIcon";
        // var storeIconSetPath =  tmpDir + "/store";

         //var storeIconSetPath =  userDefaults.otherPath;


          checkExportDir(userDefaults.otherPath,"store");

         
         // createFolderAtPath(userDefaults.otherPath)

         // appIconSetPath =  userDefaults.otherPath +"/store";


         // log("export store icon to"+appIconSetPath );

         // if (!createFolderAtPath(appIconSetPath)) {
         //  doc.showMessage("create "+appIconSetPath+" failure!");
         //  return;
         // }

            for(var i=0; i< storeSuffixArray.length;i++){

            

            var suffix = storeSuffixArray[i];
            var size = storeSizeArray[i];

             exportScaleLayer(layer,appIconSetPath,size,suffix);
          }

          exportInfo += "export store icon to "+ appIconSetPath +"\n";



}

function exportAndroidIcon(layer){
   //var tmpDir =  "/Users/pro/Documents/AppIcon";
    //     var appIconSetPath =  tmpDir + "/res";

    // var  appIconSetPath =  userDefaults.androidResPath;

    //      log("out "+appIconSetPath );

    //    if (!createFolderAtPath(appIconSetPath)) {
    //       doc.showMessage("create "+appIconSetPath+" failure!");
    //       return;
    //      }

           checkExportDir(userDefaults.androidResPath,"res");

          for(var i=0; i< androidDirArray.length;i++){

            

            var suffix = androidDirArray[i];
            var size = androidSizeArray[i];


             var path =  appIconSetPath+"/drawable-"+suffix;
             if (!createFolderAtPath(path)) {
                   log("create "+path+" failure!");
                   continue;
           
                  }

             exportScaleLayer(layer,path,size,suffix);
          }


          exportInfo += "export Android icon to "+ appIconSetPath +"\n";


 }

 var onSetting = function onSetting(context){
  log("onSetting7");
  context.document.showMessage("show setting6");

  // log("hello onRun");

  // context.document.showMessage("show setting");

  log("userDefaults.xcodeProjectPath ="+userDefaults.xcodeProjectPath);

    var accessory = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,320));


  var checkboxXCode = NSButton.alloc().initWithFrame(NSMakeRect(0,264,300,25));
    checkboxXCode.setButtonType(3);
    checkboxXCode.title = 'Input XCode Project (xcodeproj) folder';
    checkboxXCode.state =  userDefaults.exportXcode;

   
 var textXcode = NSTextView.alloc().initWithFrame(NSMakeRect(0,244,300,20));
    textXcode.string = '( or drop you project or workspace file to here)';
    textXcode.drawsBackground = false;
    textXcode.editable = false;


   var xcodeInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,220,300,25));
    xcodeInput.stringValue = userDefaults.xcodeProjectPath;
    xcodeInput.editable = true;
    xcodeInput.placeholder="Drop you project or workspace file to here"


    var checkboxIphone = NSButton.alloc().initWithFrame(NSMakeRect(20,192,300,25));
    checkboxIphone.setButtonType(3);
    checkboxIphone.title = 'iPhone';
    checkboxIphone.state =  userDefaults.exportIphoneIcon;

    var checkboxIpad = NSButton.alloc().initWithFrame(NSMakeRect(100,192,300,25));
    checkboxIpad.setButtonType(3);
    checkboxIpad.title = 'iPad';
    checkboxIpad.state =  userDefaults.exportIpadIcon;

    var checkboxAppleWatch = NSButton.alloc().initWithFrame(NSMakeRect(180,192,300,25));
    checkboxAppleWatch.setButtonType(3);
    checkboxAppleWatch.title = 'Apple Watch';
    checkboxAppleWatch.state =  userDefaults.exportAppleWatchIcon;


    var checkboxAndroid = NSButton.alloc().initWithFrame(NSMakeRect(0,124,300,25));
    checkboxAndroid.setButtonType(3);
    checkboxAndroid.title = 'Input Android Resource (res) folder';
    checkboxAndroid.state = userDefaults.exportAndroid;



var textAndroid = NSTextView.alloc().initWithFrame(NSMakeRect(0,104,300,20));
    textAndroid.string = '(or drop you AndroidManifest.xml file to here)';
    textAndroid.drawsBackground = false;
    textAndroid.editable = false;

   var androidInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,80,300,25));
    androidInput.stringValue = userDefaults.androidResPath;
    androidInput.editable = true;


      var checkboxOther = NSButton.alloc().initWithFrame(NSMakeRect(0,36,300,25));
    checkboxOther.setButtonType(3);
    checkboxOther.title = 'Input open SDK icon directory';
   checkboxOther.state = userDefaults.exportOther;

var otherInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,12,300,25));
    otherInput.stringValue = userDefaults.otherPath;
    otherInput.editable = true;


   accessory.addSubview(xcodeInput);
   accessory.addSubview(textXcode);
   accessory.addSubview(checkboxOther);
   accessory.addSubview(checkboxIphone);
   accessory.addSubview(checkboxIpad);
   accessory.addSubview(checkboxAppleWatch);
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

         userDefaults.exportXcode = checkboxXCode.state();

         userDefaults.exportIphoneIcon = checkboxIphone.state() ;

         userDefaults.exportIpadIcon = checkboxIpad.state() ;
         userDefaults.exportAppleWatchIcon = checkboxAppleWatch.state();

         userDefaults.exportAndroid = checkboxAndroid.state();

         userDefaults.exportOther = checkboxOther.state();

         //log(@"save input xcode"+xcodeInput.stringValue())
        saveValues(userDefaults)  ;

        //NSApplication.sharedApplication().displayDialog_withTitle_("result", xcodeInput.stringValue);
    }
    else {
       //NSApplication.sharedApplication().displayDialog_withTitle_("result2", androidInput.stringValue);
    }
 }

 function showMultiText(context,text){
      var alert = NSAlert.alloc().init();
      log("showText "+text);
    alert.setMessageText(text);

    alert.addButtonWithTitle('Close');
    
     alert.setIcon(NSImage.alloc().initWithContentsOfFile(
      context.plugin.urlForResourceNamed('logo.png').path()));
   
    var responseCode = alert.runModal();


 }

var onExportIcon = function onExportIcon(context,userDefaults)
{
    log("onExporCCC");

    userDefaults = loadDefaults(presets);

    parseContext(context);

     //initVars(context);

     log("userDefaults.xcodeProjectPath ="+userDefaults.xcodeProjectPath);

      var selection = context.selection;

      exportInfo = ""; //输出文本

      if(selection.count() >0){
         var layer =    selection.firstObject();

         log("exportOther ="+userDefaults.exportOther.intValue());

        if(userDefaults.exportOther ==1)  
            exportStoreIcon(layer);

        if(userDefaults.exportXcode ==1)  
             exportIOSIcon(layer);
     
        if(userDefaults.exportAndroid ==1)    
              exportAndroidIcon(layer);
         
    
        if(exportInfo == "")
            doc.showMessage("none icon export.");
          else 
            showMultiText(context,exportInfo);
            //doc.showMessage(exportInfo);

      }
     else 
        doc.showMessage("please select a layer to export.");

}


