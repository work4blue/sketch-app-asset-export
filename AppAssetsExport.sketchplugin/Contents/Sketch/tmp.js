//按width 转换

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

function scaleLayer3(selection, width){

  

  var  oldLayer = selection;

  var layer = oldLayer.duplicate(),
      frame = [layer frame],
      oldWidth = [frame width];

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

var onExport6 = function onExport6(context){
  var doc = context.document;

  var selection = context.selection;

  selectedLayers = selection;

  log("onExport4");

   if(selectedLayers.count() >0){
        //doc.currentPage().deselectAllLayers();
        // var layer = selectedLayers[0];
         //    layer.setIsSelected(true);
 

var selection = context.selection;
var layer = selection.firstObject();

         var path =  "/Users/pro/Documents/app5.png";

      var scale = 1;

        frame = [layer frame];

    [frame setWidth: width]
    [frame setHeight: height]

      [frame setX: [frame x]];
    [frame setY: [frame y]];

     // scaleLayer3(layer,78,78);

// Preserve layer center point.
    // var midX=layer.frame().midX();
    // var midY=layer.frame().midY();

    // // Scale layer by 200%
    // layer.multiplyBy(2.0);

    // // Translate frame to the original center point.
    // layer.frame().midX = midX;
    // layer.frame().midY = midY;

      var rect = absoluteRectForLayer(layer)
//var rect =  NSMakeRect(0, 0, 256, 256);

       var  slice = [MSExportRequest requestWithRect:rect scale:scale]

         

          log("slice "+slice);

      var layerName = layer.name() + ((typeof suffix !== 'undefined') ? suffix : ""),
      format = (typeof format !== 'undefined') ? format : "png";

    slice.setShouldTrim(0)
    slice.setSaveForWeb(1)
    slice.configureForLayer(layer)
    slice.setName(layerName)
    slice.setFormat(format)
       
    doc.saveArtboardOrSlice_toFile(slice, path)

    log("export "+path);

      
          doc.showMessage(" export4  " + layer.name() + " to path "+path)   ;

   }

}

var onExport2 = function onExport2(context){

  parseContext(context);

  var doc = context.document;

  // var selection = context.selection;

  // selectedLayers = selection;

  var selection = context.selection;
   var layer = selection.firstObject();

  log("onExport222");

   //if(selection.count() >0)

   {
        //doc.currentPage().deselectAllLayers();
         // var layer =  selectedLayers[0];
         //     layer.setIsSelected(true);

        // var layer =  context.selection.firstObject;

         var filepath =  "/Users/pro/Documents/bpp.png";

      
            scaleLayer3(layer,78,78);
       

          // exportLayerToPath(layer,filepath,1,"png","");
           exportLayerToPath(layer,filepath,1);

          //var rect =  NSMakeRect(0, 0, 256, 256);

           //exportScaleLayerToPath(layer,filepath,rect,1);

          doc.showMessage(" export4  " + layer.name() + " to path "+filepath)   ;

   }
  // else 
  //     doc.showMessage("please select a layer to export.");
}