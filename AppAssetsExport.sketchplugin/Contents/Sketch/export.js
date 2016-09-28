@import 'common.js'



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
