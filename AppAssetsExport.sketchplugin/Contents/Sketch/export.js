var doc,
    exportDir,
    iOSSuffixArray = ["iTunesArtwork","iTunesArtwork@2x","60@2x","60@3x","76","76@2x","Small-40","Small-40@2x",
                          "Small-40@3x","Small","Small@2x","Small@3x"],
    iOSSizeArray = [ 512,1024,120,180,76,152,40,80,120,29,58,87];

function scaleLayer3(selection, width){

   

  var  oldLayer = selection;

  var layer = oldLayer.duplicate(),
      frame = [layer frame],
      oldWidth = [frame width];

      layer.setName(oldLayer.name() + width);

    var percentage =   width/oldWidth;

    log("scaleLayer3 width "+width+",oldWidth="+oldWidth+",percentage="+percentage);


    // Preserve layer center point.
    var midX=layer.frame().midX();
    var midY=layer.frame().midY();

    layer.multiplyBy(percentage);
     

// Translate frame to the original center point.
    layer.frame().midX = midX;
    layer.frame().midY = midY;

    return layer;
}


function exportLayer(layer, path, scale, format, suffix){
	
         log("scale "+scale+",path"+path);
		var rect = layer.absoluteRect().rect(),
			slice = [MSExportRequest requestWithRect:rect scale:scale]


          //log("slice "+slice);

			var layerName = layer.name() + ((typeof suffix !== 'undefined') ? suffix : ""),
			format = (typeof format !== 'undefined') ? format : "png";

		slice.setShouldTrim(0)
		slice.setSaveForWeb(1)
		slice.configureForLayer(layer)
		slice.setName(layerName)
		slice.setFormat(format)
		doc.saveArtboardOrSlice_toFile(slice, path)

		log("export "+path);


		return {
		    x: Math.round(rect.origin.x),
		    y: Math.round(rect.origin.y),
		    width: Math.round(rect.size.width),
		    height: Math.round(rect.size.height)
		}
}

function removeLayer(layer) {
  var parent = [layer parentGroup];
  if (parent)[parent removeLayer: layer];
}

function exportTmpLayer(layer,width,suffix){
     var newLayer = scaleLayer3(layer,width);

     var path = exportDir+"/"+layer.name()+"-"+suffix+".png";

     exportLayer(newLayer,path,1);
        
     removeLayer(newLayer);
    
 }

 function initVars(context){
 	doc = context.document;
 	exportDir = "/Users/pro/Documents/AppIcon";

 	
 }


//Assets.xcassets
//Images.xcassets


var onExportIcon = function onExportIcon(context,userDefaults)
{
    log("onExportddd");

     initVars(context);

      var selection = context.selection;

      if(selection.count() >0){
         var layer =    selection.firstObject();

          for(var i=0; i< iOSSuffixArray.length;i++){
          	 exportTmpLayer(layer,iOSSizeArray[i],iOSSuffixArray[i]);
          }

         // exportTmpLayer(layer,512,"-iTunesArtwork");
         // exportTmpLayer(layer,1024,"-iTunesArtwork@2x");
         // exportTmpLayer(layer,120,"-60@2x");
         // exportTmpLayer(layer,180,"-60@2x");
         // exportTmpLayer(layer,180,"-60@3x");

         //var newLayer = scaleLayer3(layer,128);

         //var path =  "/Users/pro/Documents/dpp5.png";

         // exportLayer(newLayer,path,1);
        

         // removeLayer(newLayer);

          //doc.showMessage("export  layer to "+path);

      }
     else 
        doc.showMessage("please select a layer to export.");

}
