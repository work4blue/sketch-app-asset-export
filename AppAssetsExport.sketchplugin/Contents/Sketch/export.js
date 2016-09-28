@import 'common.js'

var presets = {
        xcodeProjectPath: '',
        androidResPath:'',
        otherPath:'',
        exportXcode:1,
        exportAndroid:1,
        exportOther:1,
}   ;    



var doc,
    exportDir, 
    iOSSuffixArray = ["60","60@2x","60@3x","76","76@2x","Small-40","Small-40@2x",
                          "Small-40@3x","Small","Small@2x","Small@3x"],
    iOSSizeArray = [ 60,120,180,76,152,40,80,120,29,58,87],
    iOSSizeStrArray = ["60x60", "60x60","60x60","76x76","76x76","40x40","40x40","40x40","29x29","29x29","29x29"],


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

// function scaleLayer3(selection, width){

   

//   var  oldLayer = selection;

//   var layer = oldLayer.duplicate(),
//       frame = [layer frame],
//       oldWidth = [frame width];

//       layer.setName(oldLayer.name() + width);

//     var percentage =   width/oldWidth;

//     log("scaleLayer3 width "+width+",oldWidth="+oldWidth+",percentage="+percentage);


//     // Preserve layer center point.
//     var midX=layer.frame().midX();
//     var midY=layer.frame().midY();

//     layer.multiplyBy(percentage);
     

// // Translate frame to the original center point.
//     layer.frame().midX = midX;
//     layer.frame().midY = midY;

//     return layer;
// }


// function exportLayer(layer, path, scale, format, suffix){
	
//          log("scale "+scale+",path"+path);
// 		var rect = layer.absoluteRect().rect(),
// 			slice = [MSExportRequest requestWithRect:rect scale:scale]


//           //log("slice "+slice);

// 			var layerName = layer.name() + ((typeof suffix !== 'undefined') ? suffix : ""),
// 			format = (typeof format !== 'undefined') ? format : "png";

// 		slice.setShouldTrim(0)
// 		slice.setSaveForWeb(1)
// 		slice.configureForLayer(layer)
// 		slice.setName(layerName)
// 		slice.setFormat(format)
// 		doc.saveArtboardOrSlice_toFile(slice, path)

// 		log("export "+path);


// 		return {
// 		    x: Math.round(rect.origin.x),
// 		    y: Math.round(rect.origin.y),
// 		    width: Math.round(rect.size.width),
// 		    height: Math.round(rect.size.height)
// 		}
// }

// function removeLayer(layer) {
//   var parent = [layer parentGroup];
//   if (parent)[parent removeLayer: layer];
// }

function exportScaleLayer(layer,dir,width,suffix){
     
      frame = [layer frame];
     var scale = width / [frame width];

     var name2 = layer.name()+"-"+suffix+".png";




     var path = dir+"/"+ name2;

     log("exportScaleLayer2 "+path)

     exportLayerToPath(layer,path,scale,"png","-"+suffix);
        
     

     return  name2;
    
 }

// function exportTmpLayer(layer,width,suffix){
//      var newLayer = scaleLayer3(layer,width
 
//     var name = layer.name()+"-"+suffix+".png";
//      var path = exportDir+"/"+ name;

//      exportLayer(newLayer,path,1);
        
//      removeLayer(newLayer);

//      return  name;
    
//  }

 function initVars(context){
 	doc = context.document;
 	exportDir = "/Users/pro/Documents/AppIcon";

 	
 }


//Assets.xcassets
//Images.xcassets

function exportIOSIcon(layer){
   var tmpDir =  "/Users/pro/Documents/AppIcon";
         var appIconSetPath =  tmpDir + "/AppIcon.appiconset";

         log("out "+appIconSetPath );

         if (!createFolderAtPath(appIconSetPath)) {
          doc.showMessage("create "+appIconSetPath+" failure!");
          return;
         }

          //exportDir =  appIconSetPath;

          var imagesArray = [];

          for(var i=0; i< iOSSuffixArray.length;i++){

            

            var suffix = iOSSuffixArray[i];

            var scale = "1x";

            // if(hasSuffix(suffix,"@2x")){
            //      scale = "2x";
            //  }
            // else if (hasSuffix(suffix,"@3x")){
            //      scale = "3x";    
            //  }

            if(suffix.endsWith("@2x"))
              scale = "2x";
            else if (hasSuffix(suffix,"@3x"))
               scale = "3x";

            
             var size =  iOSSizeArray[i];

             var sizeStr= iOSSizeStrArray[i];

            var finalFileName = exportScaleLayer(layer,appIconSetPath,size,iOSSuffixArray[i]);

               imageObj = {              
                idiom : "iphone",
                size:sizeStr,
                scale : scale,
                filename : finalFileName
        }
            imagesArray.push(imageObj) 

             
          }

          imageContent = {
        info : {
          version : 1,
          author : "xcode"
        },
        images : imagesArray
      }


      var filePath = appIconSetPath + "/Contents.json"
      log("json file2 "+filePath);
      var jsonString = stringify(imageContent, true)  
          writeTextToFile(jsonString, filePath)
}

function exportStoreIcon(layer){
        var tmpDir =  "/Users/pro/Documents/AppIcon";
         var storeIconSetPath =  tmpDir + "/store";

         log("out "+storeIconSetPath );

         if (!createFolderAtPath(storeIconSetPath)) {
          doc.showMessage("create "+storeIconSetPath+" failure!");
          return;
         }

            for(var i=0; i< storeSuffixArray.length;i++){

            

            var suffix = storeSuffixArray[i];
            var size = storeSizeArray[i];

             exportScaleLayer(layer,storeIconSetPath,size,suffix);
          }


}

function exportAndroidIcon(layer){
   var tmpDir =  "/Users/pro/Documents/AppIcon";
         var appIconSetPath =  tmpDir + "/res";

         log("out "+appIconSetPath );

       if (!createFolderAtPath(appIconSetPath)) {
          doc.showMessage("create "+appIconSetPath+" failure!");
          return;
         }

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


 }

 var onSetting = function onSetting(context){
  log("onSetting6");
  context.document.showMessage("show setting6");

  // log("hello onRun");

  // context.document.showMessage("show setting");

    var accessory = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,280));


  var checkboxXCode = NSButton.alloc().initWithFrame(NSMakeRect(0,214,300,25));
    checkboxXCode.setButtonType(3);
    checkboxXCode.title = 'Input XCode Project (xcodeproj) folder';
    checkboxXCode.state =  userDefaults.exportXcode;

   
 var textXcode = NSTextView.alloc().initWithFrame(NSMakeRect(0,194,300,20));
    textXcode.string = '( or drop you project or workspace file to here)';
    textXcode.drawsBackground = false;
    textXcode.editable = false;


   var xcodeInput = NSTextField.alloc().initWithFrame(NSMakeRect(0,170,300,25));
    xcodeInput.stringValue = userDefaults.xcodeProjectPath;
    xcodeInput.editable = true;
    xcodeInput.placeholder="Drop you project or workspace file to here"

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
        saveValues(userDefaults)  ;

        //NSApplication.sharedApplication().displayDialog_withTitle_("result", xcodeInput.stringValue);
    }
    else {
       //NSApplication.sharedApplication().displayDialog_withTitle_("result2", androidInput.stringValue);
    }
 }

var onExportIcon = function onExportIcon(context,userDefaults)
{
    log("onExportfff");


     initVars(context);

     doc.showMessage("aaakkk");

      var selection = context.selection;

      if(selection.count() >0){
         var layer =    selection.firstObject();

         exportStoreIcon(layer);

         exportIOSIcon(layer);

         exportAndroidIcon(layer);
         
    

      }
     else 
        doc.showMessage("please select a layer to export.");

}


