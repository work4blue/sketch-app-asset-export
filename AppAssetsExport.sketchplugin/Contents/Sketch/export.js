var doc,
    exportDir;

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

function exportTmpLayer(layer,width){
     var newLayer = scaleLayer3(layer,width);

     var path = exportDir+"/"+layer.name()+"-"+width+".png";

     exportLayer(newLayer,path,1);
        
     removeLayer(newLayer);
    
 }

 function initVars(context){
 	doc = context.document;
 	exportDir = "/Users/pro/Documents/AppIcon";
 }


var onExportIcon = function onExportIcon(context)
{
    log("onExportfff");

     initVars(context);

      var selection = context.selection;

      if(selection.count() >0){
         var layer =    selection.firstObject();

         exportTmpLayer(layer,128);
         exportTmpLayer(layer,512);
         exportTmpLayer(layer,78);

         //var newLayer = scaleLayer3(layer,128);

         //var path =  "/Users/pro/Documents/dpp5.png";

         // exportLayer(newLayer,path,1);
        

         // removeLayer(newLayer);

          doc.showMessage("export  layer to "+path);

      }
     else 
        doc.showMessage("please select a layer to export.");

}
