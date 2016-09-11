@import 'sandbox.js'

//--------------------------------------
//  Common variables for easy access
//--------------------------------------

var app = [NSApplication sharedApplication],
	selection,
	plugin,
	currentCommand,
	currentCommandID,
	doc,
	currentPage,
	currentArtboard,
	stage,
	pluginName,
	scriptPath,
	scriptURL,
	scriptFolder,
	pluginDomain,
	iconName,
	isRemote = false,
	debug = true,
	SKVersion3_3 = "3.3",
	SKVersion3_4 = "3.4",
	sketchVersion = getMajorVersion();


//--------------------------------------
//  Parse Context - Sketch 3.3 onwards
//--------------------------------------

function parseContext(context, remote) {
	if(typeof remote !== 'undefined') isRemote = remote;
	selection = context.selection;
	currentCommand = context.command;
	doc = context.document;
	scriptPath = context.scriptPath;
	scriptURL = context.scriptURL;
	plugin = context.plugin;
	
	currentPage = [doc currentPage];
	currentArtboard = [currentPage currentArtboard];
	stage = currentArtboard ? currentArtboard : currentPage;
	currentCommandID = [currentCommand identifier];
	if (!isRemote) {
		pluginName = [plugin name];
		pluginDomain = [plugin identifier];
	}
	scriptFolder = [scriptPath stringByDeletingLastPathComponent];
}

function sketchLog(l) { 
	if (debug) log(l);
}

function getSketchVersionNumber() {
	const version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"]
	var versionNumber = version.stringByReplacingOccurrencesOfString_withString(".", "") + ""
	while(versionNumber.length != 3) {
		versionNumber += "0"
	}
	return parseInt(versionNumber)
}

function getMajorVersion() {
	const version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] + ""
    return version.substr(0, 3)
}
	
//--------------------------------------
//  User interaction
//--------------------------------------

function showDialog (message, title, OKHandler) {
  var alert = [COSAlertWindow new];
  var messageTitle = (typeof title !== 'undefined') ? title : pluginName
  [alert setMessageText: messageTitle];
  [alert setInformativeText: message];
  if (!isRemote && typeof iconName !== 'undefined' && iconName != null) {
  	var iconPath = [[plugin urlForResourceNamed:iconName] path];
  	var icon = [[NSImage alloc] initByReferencingFile:iconPath];
  	[alert setIcon:icon];
  }
  var responseCode = [alert runModal];	
  if(OKHandler != nil && responseCode == 0) OKHandler();
}


//--------------------------------------
//  Checking Layer Types
//--------------------------------------

function selectionIsEmpty() {
	return ([selection count] == 0);
}

function is(layer, theClass){
  var klass = [layer class];
  return klass === theClass;
}

function isPage(layer){
  return is(layer, MSPage);
}

function isArtboard(layer){
  return is(layer, MSArtboardGroup);
}

function isGroup(layer){
  return is(layer, MSLayerGroup);
}

function isText(layer){
  return is(layer, MSTextLayer);
}

function isShape(layer){
  return is(layer, MSShapeGroup);
}


//--------------------------------------
//  Adding (and removing) Different Kinds of Layers
//--------------------------------------

function addArtboard(name, rect, page) {
	var artboard = [MSArtboardGroup new];
	
	[artboard setName:name];
	setSize(artboard, rect.width, rect.height);
	setPosition(artboard, rect.x, rect.y, true);
	[page addLayers:[artboard]];
	return artboard;
}

function addBitmap(filePath, parent, name) {

	if (getSketchVersionNumber() >= 340) {
		var parent = parent ? parent : stage;	
		if(![parent documentData]) {
			showDialog("Before adding a Bitmap, add its parent to the document.")
			return
		}
		
		var layer = [MSBitmapLayer bitmapLayerWithImageFromPath:filePath]
		if(!name) name = "Bitmap"
		[layer setName:name]
		[parent addLayers:[layer]]

		return layer

	} 
	else {
		var parent = parent ? parent : stage,
			layer = [MSBitmapLayer new];
		
		if(![parent documentData]) {
			showDialog("Before adding a Bitmap, add its parent to the document.")
			return
		}
		
		if(!name) name = "Bitmap"
		[layer setName:name]
		[parent addLayers:[layer]]
			
		var image = [[NSImage alloc] initWithContentsOfFile:filePath]
		if(image) {
			var originalImageSize = [image size],
				fills = [[layer style] fills];
			
			[layer setConstrainProportions:false]
			[fills addNewStylePart]
			[[fills firstObject] setIsEnabled:false]
			[layer setRawImage:image convertColourspace:false collection:[[doc documentData] images]]
			[[layer frame] setWidth:originalImageSize.width]
			[[layer frame] setHeight:originalImageSize.height]
			[layer setConstrainProportions:true]
		} else {
			showDialog("Image file could not be found!")
		}
		return layer;
	}
	
}

function addLine(name, parent, startPoint, endPoint, thickness, hex, alpha, blendMode) {
	var parent = parent ? parent : stage,
		path = [NSBezierPath bezierPath],
		line;
	[path moveToPoint:NSMakePoint(startPoint.x,startPoint.y)];
	[path lineToPoint:NSMakePoint(endPoint.x,endPoint.y)];

	line = [MSShapeGroup shapeWithBezierPath:path];
	[line setName:name];
	setBorder(line, thickness, 0, hex, alpha, blendMode);
	[parent addLayers:[line]];
	return line;
}

function addArrowToLine(lineLayer, arrowPosition, arrowSize) {
	if(!isShape(lineLayer) || ![lineLayer isLine]) showDialog("Not a line!");
	var arrowPath = [NSBezierPath bezierPath],
		arrowPosition = (typeof arrowPosition !== 'undefined') ? arrowPosition : 1,
		m = (arrowPosition == 0) ? 1 : -1,
		arrowSize = arrowSize ? arrowSize : {width:15, height:15};
	[arrowPath moveToPoint:NSMakePoint(arrowSize.width*m,-arrowSize.height)];
	[arrowPath lineToPoint:NSMakePoint(0,0)];
	[arrowPath lineToPoint:NSMakePoint(arrowSize.width*m,arrowSize.height)];
	
	if (arrowPosition == 0) {
		[lineLayer bezierPathForStartDecorationOnPath:arrowPath];
	} else {
		[lineLayer bezierPathForEndDecorationOnPath:arrowPath];
	}
	
}

function addLayer(name, type, parent) {
  var parent = parent ? parent : stage,
    layer = [parent addLayerOfType: type];
  if (name)[layer setName: name];
  return layer;
}

function addGroup(name, parent) {
  return addLayer(name, 'group', parent);
}

function addShape(name, parent) {
  return addLayer(name, 'rectangle', parent);
}

function addText(name, parent, fontSize) {
	var fontSize = (typeof fontSize !== 'undefined') ? fontSize : 12,
  		textLayer = addLayer(name, 'text', parent);
	[textLayer setFontSize:fontSize];
	return textLayer;
}

function removeLayer(layer) {
  var parent = [layer parentGroup];
  if (parent)[parent removeLayer: layer];
}


//--------------------------------------
//  GET Layers, Attributes, Positions and Sizes
//--------------------------------------

function getFrame(layer, relativeToLayer) {
  if(relativeToLayer) {
	var frame = [layer absoluteRect];
	var relativeFrame = [relativeToLayer absoluteRect];
	return {
    		x: Math.round([frame x]-[relativeFrame x]),
    		y: Math.round([frame y]-[relativeFrame y]),
    		width: Math.round([frame width]),
    		height: Math.round([frame height])
  	}
  } else {
  	var frame = [layer frame];
  	return {
    		x: Math.round([frame x]),
	    	y: Math.round([frame y]),
	    	width: Math.round([frame width]),
    		height: Math.round([frame height])
  	};
  }
}

function getRect(layer) {
  var rect = [layer absoluteRect];
  return {
    x: Math.round([rect x]),
    y: Math.round([rect y]),
    width: Math.round([rect width]),
    height: Math.round([rect height])
  };
}

function getParentArtboard(layer){
	if(isArtboard(layer)) return layer;
	var parent = [layer parentGroup];
	while(!isArtboard(parent)) { parent = [parent parentGroup] }
	return parent;
}

function getAllArtboardsInDoc() {
	var pages = [doc pages],
		allArtboards = [NSArray array],
		artboardsInPage;
	var loop = [pages objectEnumerator];
	while (page = [loop nextObject]) {
		artboardsInPage = [page artboards]
		if (artboardsInPage != nil && [artboardsInPage count] != 0) allArtboards = [allArtboards arrayByAddingObjectsFromArray:artboardsInPage]
	}
	return allArtboards;
}

function getAllChildrenInDoc() {
	var pages = [doc pages],
		allChildren = [NSArray array],
		childrenOfPage;
	var loop = [pages objectEnumerator];
	while (page = [loop nextObject]) {
		childrenOfPage = [page children]
		if (childrenOfPage != nil && [childrenOfPage count] != 0) allChildren = [allChildren arrayByAddingObjectsFromArray:childrenOfPage]
	}
	return allChildren;
}

function getAllArtboardsNamesAndIDs() {
	var pages = [doc pages],
		allArtboards = [],
		artboardsInPage, loop2;
	var loop = [pages objectEnumerator];
	while (page = [loop nextObject]) {
		artboardsInPage = [page artboards];

		// Skip pages without artboards
		if (artboardsInPage == nil || [artboardsInPage count] == 0) {
			continue
		}

		loop2 = [artboardsInPage objectEnumerator]
		while (artboard = [loop2 nextObject]) {
			allArtboards.push({
				name: [artboard name],
				ID: [artboard objectID]
			})
		}
	}
	return allArtboards;
}

function getPageAndArtboardNames() {
	var pages = [doc pages],
		allPages = [],
		artboardsInPage, loop2, artboardsArray;

	var loop = [pages objectEnumerator];
	while (page = [loop nextObject]) {
		artboardsInPage = [page artboards];

		// Skip pages without artboards
		if (artboardsInPage == nil || [artboardsInPage count] == 0) {
			continue
		}

		artboardsArray = [];
		loop2 = [artboardsInPage objectEnumerator]
		while (artboard = [loop2 nextObject]) {
			artboardsArray.push({
				name: [artboard name],
				ID: [artboard objectID]
			})
		}
		allPages.push({
			name: [page name],
			ID: [page objectID],
			artboards: artboardsArray
		})
	}
	return allPages;
}

function getAllArtboardNames(withPrefix, includePrefixInName) {
	var artboardNames = [NSArray array],
		pages = [doc pages],
		prefix = withPrefix ? withPrefix : '',
		p, a, name;
		
	var loop = [pages objectEnumerator];
	while (p = [loop nextObject]) {
		var artboards = [p artboards];
		// Skip pages without artboards
		if (artboards == nil || [artboards count] == 0) {
			continue
		}
		var loop2 = [artboards objectEnumerator];
		while (a = [loop2 nextObject]) {
			name = [a name];
			if(prefix != '' && ![name hasPrefix:prefix]) continue;
			if(!includePrefixInName) name = [name substringFromIndex:prefix.length];
			if(![artboardNames containsObject:name]) {
				artboardNames = [artboardNames arrayByAddingObject:name];
			}
		}
	}
	return artboardNames;
}

function getAllArtboardIDs() {
	var artboardIDs = [NSArray array],
		pages = [doc pages],
		p, a, artboards;

	var loop = [pages objectEnumerator];
	while (p = [loop nextObject]) {
		artboards = [p artboards]
		if (artboards == nil || [artboards count] == 0) continue
		var loop2 = [artboards objectEnumerator];
		while (a = [loop2 nextObject]) {
			artboardIDs = [artboardIDs arrayByAddingObject:[a objectID]]
		}
	}
	return artboardIDs
}

function getAllPageNames(withPrefix, includePrefixInName) {
	var pageNames = [NSArray array],
		pages = [doc pages],
		prefix = withPrefix ? withPrefix : '',
		p, name;
		
	var loop = [pages objectEnumerator];
	while (p = [loop nextObject]) {
		name = [p name];
		if(prefix != '' && ![name hasPrefix:prefix]) continue;
		if(!includePrefixInName) name = [name substringFromIndex:prefix.length];
		if(![pageNames containsObject:name]) {
			pageNames = [pageNames arrayByAddingObject:name];
		}
	}
	return pageNames;
}

function getLayersWithPrefix(prefix, inGroup) {
	var group = inGroup ? inGroup : currentPage,
		children = [group children],
		prefixString = [NSString stringWithFormat:@"%@", prefix],
		predicate = [NSPredicate predicateWithFormat:@"name BEGINSWITH[cd] %@", prefixString],
		filteredArray = [children filteredArrayUsingPredicate:predicate];
	
	return filteredArray;
}

//--------------------------------------
//  SET Layer Attributes, Colors, Positions, Sizes etc
//--------------------------------------

function setColor(layer, hex, alpha, blendMode) {
  var color = hexToMSColor(hex),
  	alpha = (typeof alpha !== 'undefined') ? alpha : 1,
	blendMode = (typeof blendMode !== 'undefined') ? blendMode : 0;
  [color setAlpha: alpha];

  if( isText(layer) ) {
    [layer setTextColor: color];
  }
  else if( isShape(layer) ) {
    var fills = [[layer style] fills];
    if([fills count] <= 0) [fills addNewStylePart];
    [[[layer style] fill] setColor: color];
	[[[[layer style] fill] contextSettings] setBlendMode:blendMode];
  }
}

function setBackgroundBlur(layer, amountPx) {
	var blur = [[layer style] blur];
    [blur setType: 3];
    [blur setRadius: amountPx];
    [blur setIsEnabled: true];
	[currentPage deselectAllLayers];
	[layer setIsSelected:true];
}

function setArtboardColor(artboard, hex, alpha, includeInExport) {
	if(!isArtboard(artboard)) {
		showDialog("Not an artboard");
		return;
	}
	var hex = (typeof hex !== 'undefined') ? hex : 'FFFFFF',
		alpha = (typeof alpha !== 'undefined') ? alpha : 1,
		includeInExport = (typeof includeInExport !== 'undefined') ? includeInExport : true,
		color = hexToMSColor(hex);
		
	[color setAlpha: alpha];
	[artboard setHasBackgroundColor:true];
	[artboard setIncludeBackgroundColorInExport:includeInExport];
	[artboard setBackgroundColor:color];
}

function removeArtboardColor(artboard) {
	if(!isArtboard(artboard)) {
		showDialog("Not an artboard");
		return;
	}
	[artboard setHasBackgroundColor:false];
}

function setBorder(layer, thickness, position, hex, alpha, blendMode) {
	var thickness = thickness ? thickness : 1,
		hex = (typeof hex !== 'undefined') ? hex : '000000',
		alpha = (typeof alpha !== 'undefined') ? alpha : 1,
		blendMode = (typeof blendMode !== 'undefined') ? blendMode : 0,
		color = hexToMSColor(hex);
	
	[color setAlpha: alpha];
	if( !isText(layer) ) {
		var borders = [[layer style] borders];
	    if([borders count] <= 0) [borders addNewStylePart];
		var border = [[layer style] border];
	    [border setColor: color];
		[border setPosition: position];
		[border setThickness: thickness];
		[[border contextSettings] setBlendMode:blendMode];
	}
}

function setShadow(layer, offsetX, offsetY, blurRadius, spread, hex, alpha, blendMode) {
	var offsetX = (typeof offsetX !== 'undefined') ? offsetX : 0,
		offsetY = (typeof offsetY !== 'undefined') ? offsetY : 2,
		blurRadius = (typeof blurRadius !== 'undefined') ? blurRadius : 4,
		spread = (typeof spread !== 'undefined') ? spread : 0,
		hex = (typeof hex !== 'undefined') ? hex : '000000',
		color = hexToMSColor(hex),
		alpha = (typeof alpha !== 'undefined') ? alpha : .5,
		blendMode = (typeof blendMode !== 'undefined') ? blendMode : 0;
		
		[color setAlpha: alpha];

		var shadows = [[layer style] shadows];
		if([shadows count] <= 0) [shadows addNewStylePart];
		[[[layer style] shadow] setColor: color];
		[[[[layer style] shadow] contextSettings] setBlendMode:blendMode];
		[[[layer style] shadow] setOffsetX: offsetX];
		[[[layer style] shadow] setOffsetY: offsetY];
		[[[layer style] shadow] setBlurRadius: blurRadius];
		[[[layer style] shadow] setSpread: spread];
		
}

function setSize(layer, width, height, absolute) {
  if(absolute){
    [[layer absoluteRect] setWidth: width];
    [[layer absoluteRect] setHeight: height];
  }
  else{
    [[layer frame] setWidth: width];
    [[layer frame] setHeight: height];
  }

  return layer;
}

function setPosition(layer, x, y, absolute) {
  if(absolute){
    [[layer absoluteRect] setX: x];
    [[layer absoluteRect] setY: y];
  }
  else{
    [[layer frame] setX: x];
    [[layer frame] setY: y];
  }

  return layer;
}


//--------------------------------------
//  Working with Colors
//--------------------------------------

function colorToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + colorToHex(r) + colorToHex(g) + colorToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToNSColor(hex) {
	var rgb = hexToRgb(hex)
	return [NSColor colorWithCalibratedRed:rgb.r/255.0 green:rgb.g/255.0 blue:rgb.b/255.0 alpha:1.0];
}

function NSColorToHex(color) {
	return rgbToHex(parseInt([color redComponent]*255.0), parseInt([color greenComponent]*255.0), parseInt([color blueComponent]*255.0));
}

function rgbToMSColor(rgb) {
	var color = [[MSColor alloc] init],
	      red = rgb.r / 255,
	      green = rgb.g / 255,
	      blue = rgb.b / 255,
	      alpha = (alpha && !isNaN(alpha) && (alpha <= 1 || alpha >= 0))? alpha: 1;

	  [color setRed: red];
	  [color setGreen: green];
	  [color setBlue: blue];
	return color;
}

function hexToMSColor(hex) {
	return rgbToMSColor(hexToRgb(hex));
}

//--------------------------------------
//  Working with Bitmaps
//--------------------------------------

function flattenLayerToBitmap(layer, keepOriginal, scale) {
	var dup = [layer duplicate],
		parent = [layer parentGroup],
		layerRect = getRect(layer),
		keepOriginal = (typeof keepOriginal !== 'undefined') ? keepOriginal : false,
		scale = (typeof scale !== 'undefined') ? scale : 1;
	
	var tempFolderPath = getTempFolderPath();
	var filePath = tempFolderPath + "/temp.png";
	exportLayerToPath(layer, filePath, scale);
	
	var bmp = addBitmap(filePath, parent, "Bitmap");
	setPosition(bmp, layerRect.x, layerRect.y, true);
	
	if(!keepOriginal) removeLayer(layer);
	removeLayer(dup);
	cleanUpTempFolder(tempFolderPath);
	return bmp;
}

function desaturateBitmap(bmpLayer) {
	var colorControls = [[bmpLayer style] colorControls];
	[colorControls setSaturation:0];
	[colorControls setIsEnabled:1];
}

//--------------------------------------
//  Working with Text
//--------------------------------------

function isTextLayerMultiline(textLayer) {
	return (isText(textLayer) && getRect(textLayer).height != [textLayer lineSpacing])
}

//--------------------------------------
//  Exporting Layers and Artboards
//--------------------------------------

function makeExportable(layer, format) {

	var format = (typeof format !== 'undefined') ? format : "png"
	if (getSketchVersionNumber() >= 350) {
		var slice = layer.exportOptions().addExportFormat()
		slice.setFileFormat(format)
		return slice
	}

	var slice = layer.exportOptions().addExportSize()
	slice.setFormat(format)
	return slice
}

function removeExportOptions(layer) {
	[[[layer exportOptions] sizes] removeAllObjects]
}

function exportLayerToPath(layer, path, scale, format, suffix) {

	if(getSketchVersionNumber() >= 350) {

		var rect = layer.absoluteRect().rect(),
			slice = [MSExportRequest requestWithRect:rect scale:scale],
			layerName = layer.name() + ((typeof suffix !== 'undefined') ? suffix : ""),
			format = (typeof format !== 'undefined') ? format : "png";

		slice.setShouldTrim(0)
		slice.setSaveForWeb(1)
		slice.configureForLayer(layer)
		slice.setName(layerName)
		slice.setFormat(format)
		doc.saveArtboardOrSlice_toFile(slice, path)

		return {
		    x: Math.round(rect.origin.x),
		    y: Math.round(rect.origin.y),
		    width: Math.round(rect.size.width),
		    height: Math.round(rect.size.height)
		}
	}

	[[layer exportOptions] addExportSize]
	var exportSize = [[[[layer exportOptions] sizes] array] lastObject],
		rect = [[layer absoluteRect] rect],
		scale = (typeof scale !== 'undefined') ? scale : 1,
		suffix = (typeof suffix !== 'undefined') ? suffix : "",
		format = (typeof format !== 'undefined') ? format : "png"
	exportSize.scale = scale
	exportSize.name = suffix
	exportSize.format = format
	var slice = getSketchVersionNumber() >= 344 ? [MSSliceMaker sliceFromExportSize:exportSize layer:layer inRect:rect useIDForName:false] : [MSSliceMaker sliceFromExportSize:exportSize layer:layer inRect:rect]
	[doc saveArtboardOrSlice:slice toFile: path]
	[exportSize remove]
	slice = nil
	exportSize = nil
	return {
	    x: Math.round(rect.origin.x),
	    y: Math.round(rect.origin.y),
	    width: Math.round(rect.size.width),
	    height: Math.round(rect.size.height)
	}
}


//--------------------------------------
//  Calling Actions
//--------------------------------------

function groupSelection(name) {
	var action=actionWithName("MSGroupAction");
	if(action) action.group(nil);
	var newGroup = [[selection firstObject] parentGroup]
	if (typeof name !== 'undefined') {
		[newGroup setName:name];
	}
	return newGroup;
}

function ungroup(group) {
	var action=actionWithName("MSUngroupAction");
	if(action && action.layerCanBeUngrouped(group)) action.ungroupGroup(group);
}

function actionWithName(name) {
	var action = doc.actionsController().actionWithName(name);
	if(action.validate()) return action;
	return nil;
}

function flattenSelectionToBitmap() {
	var action=actionWithName("MSFlattenSelectionAction");
	if(action) action.flattenSelection(nil);
}


//--------------------------------------
//  Organize Layers and Artboards
//--------------------------------------

function organizeArtboardsInPage(page, spacing, numColumns) {
	var artboards = page ? [page artboards] : [currentPage artboards],
		maxColumns = numColumns ? numColumns : 0,
		spacing = (typeof spacing !== 'undefined') ? spacing : 200,
		i = 0, newX = 0, newY = 0, maxHeight = 0, rect;
	
	var loop = [artboards objectEnumerator];
	while (item = [loop nextObject]) {
		setPosition(item, newX, newY, true);
		rect = getRect(item);
		newX += rect.width+spacing;
		maxHeight = Math.max(rect.height, maxHeight);
		if(maxColumns && (++i == maxColumns)) {
			i = 0;
			newY += maxHeight + (spacing*2);
			newX = maxHeight = 0;
		}
	}
}

function getTopRightCornerOfPage(page, marginX, marginY) {
	var artboards = page ? [page artboards] : [currentPage artboards],
		marginX = (typeof marginX !== 'undefined') ? marginX : 0,
		marginY = (typeof marginY !== 'undefined') ? marginY : 0,
		newX = 0, newY = 0, rect;
		
	var loop = [artboards objectEnumerator];
	while (item = [loop nextObject]) {
		rect = getRect(item);
		newX = Math.max(newX, rect.x+rect.width+marginX);
		newY = Math.min(newY, rect.y+marginY);
	}
	return {x:newX, y:newY};
}

function getOptimalPositionForNewArtboardInPage(page) {
	var page = (typeof page !== 'undefined') ? page : currentPage,
		spacing = 160,
		contentBounds = [page contentBounds],
		right = [contentBounds x] + [contentBounds width] + spacing;
	return {x:right, y:[contentBounds y]};
}


//--------------------------------------
//  Working with files and directories
//--------------------------------------

function getTempFolderPath(withName) {
	var fileManager = [NSFileManager defaultManager],
		cachesURL = [[fileManager URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask] lastObject],
		withName = (typeof withName !== 'undefined') ? withName : (Date.now() / 1000),
		folderName = [NSString stringWithFormat:"%@", withName],
		pluginDomainSlug = [[[pluginDomain stringByReplacingOccurrencesOfString:"/" withString:"_"] stringByReplacingOccurrencesOfString:"." withString:"_"] lowercaseString];
	return [[[cachesURL URLByAppendingPathComponent:pluginDomainSlug] URLByAppendingPathComponent:folderName] path];
}

function createFolderAtPath(pathString) {
	var fileManager = [NSFileManager defaultManager];
	if([fileManager fileExistsAtPath:pathString]) return true;
	return [fileManager createDirectoryAtPath:pathString withIntermediateDirectories:true attributes:nil error:nil];
}

function createTempFolderNamed(name) {
	var tempPath = getTempFolderPath(name);
	createFolderAtPath(tempPath);
	return tempPath;
}

function cleanUpTempFolder(folderPath) {
	[[NSFileManager defaultManager] removeItemAtPath:folderPath error:nil];
}

function writeTextToFile(text, filePath) {
	var t = [NSString stringWithFormat:@"%@", text],
		f = [NSString stringWithFormat:@"%@", filePath];
    return [t writeToFile:f atomically:true encoding:NSUTF8StringEncoding error:nil];
}

function readTextFromFile(filePath) {
	var fileManager = [NSFileManager defaultManager];
	if([fileManager fileExistsAtPath:filePath]) {
		return [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
	}
	return nil;
}

function jsonFromFile(filePath, mutable) {
	var data = [NSData dataWithContentsOfFile:filePath];
	var options = mutable == true ? NSJSONReadingMutableContainers : 0
	return [NSJSONSerialization JSONObjectWithData:data options:options error:nil];
}

//--------------------------------------
//  Cocoa UI
//--------------------------------------

function createAlertBase (addButtons) {
  var alert = [COSAlertWindow new];

  if (!isRemote && typeof iconName !== 'undefined' && iconName != null) {
  	var iconPath = [[plugin urlForResourceNamed:iconName] path];
  	var icon = [[NSImage alloc] initByReferencingFile:iconPath];
  	[alert setIcon:icon];
  }
  
  if (typeof addButtons === 'undefined' || addButtons == true) {
	  [alert addButtonWithTitle: 'OK'];
	  [alert addButtonWithTitle: 'Cancel'];
  }

  return alert;
}

function askForUserInput(question, info, defaultAnswer, onComplete) {
	var alert = createAlertBase();

	[alert setMessageText: question];
	[alert setInformativeText: info];
	[alert addTextFieldWithValue: defaultAnswer];

	var responseCode = [alert runModal];
	handleUserInput(alert, responseCode, onComplete);
}

function handleUserInput(alert, responseCode, onComplete) {
	if (responseCode == "1000") {
		onComplete(valueAtIndex(alert, 0));
	}
}

function createSelect (items, selectedItemIndex, width) {
	width = (typeof width !== 'undefined') ? width : 300
  selectedItemIndex = selectedItemIndex || 0;
  var comboBox = [[NSComboBox alloc] initWithFrame: NSMakeRect(0, 0, width, 25)];
  [comboBox addItemsWithObjectValues: items];
  [comboBox selectItemAtIndex: selectedItemIndex];
  return comboBox;
}

function createDropDown (items, selectedItemIndex, width) {
	width = width || 300
	selectedItemIndex = selectedItemIndex || 0;
	var comboBox = [[NSPopUpButton alloc] initWithFrame: NSMakeRect(0, 0, width, 25) pullsDown:false];
	if(items.indexOf("---") != -1) {
		for (var i = 0; i < items.length; i++) {
		    if (items[i] == "---") items[i] = [NSMenuItem separatorItem];
		}
	}
	[comboBox addItemsWithTitles: items];
	[comboBox selectItemAtIndex: selectedItemIndex];
	return comboBox;
}

function createCheckbox (item, checked) {
  checked = (checked == false)? NSOffState: NSOnState;
  var checkbox = [[NSButton alloc] initWithFrame: NSMakeRect(0, 0, 300, 22)];
  [checkbox setButtonType: NSSwitchButton];
  [checkbox setBezelStyle: 0];
  [checkbox setTitle: item.name];
  [checkbox setTag: item.value];
  [checkbox setState: checked];
  return checkbox;
}

function createTextArea (text, width, height) {
	var width = (typeof width !== 'undefined') ? width : 300,
		height = (typeof height !== 'undefined') ? height : 160,
		text = (typeof text !== 'undefined') ? text : "",
		textArea = [[NSTextField alloc] initWithFrame:NSMakeRect(0, 0, width, height)];
	[textArea setStringValue:text];
	return textArea;
}

function createBox (x, y, width, height) {
	var x = (typeof x !== 'undefined') ? x : 0,
		y = (typeof y !== 'undefined') ? y : 0,
		width = (typeof width !== 'undefined') ? width : 300,
		height = (typeof height !== 'undefined') ? height : 100,
		box = [[NSBox alloc] initWithFrame:NSMakeRect(x, y, width, height)];
	return box;
}

function createSeparator (width) {
	var box = createBox(0,0,width,10);
	[box setBoxType:2];
	return box;
}

function createRadioButtons (items, numRows, numCols, title, defaultSelection) {
	if (typeof items === 'undefined' || items.length == 0) return;
	var buttonCell = [NSButtonCell new],
		title = (typeof title !== 'undefined') ? title : "Radio Buttons",
		numRows = (typeof numRows !== 'undefined') ? numRows : 1,
		numCols = (typeof numCols !== 'undefined') ? numCols : [items count],
		defaultSelection = (typeof defaultSelection !== 'undefined') ? defaultSelection : 0,
		matrixRect = NSMakeRect(0, 0, 300, (numRows*22)),
		numItems = items.length,
		itemName;
		
	[buttonCell setTitle:title];
	[buttonCell setButtonType:NSRadioButton];
	
	var buttonMatrix = [[NSMatrix alloc] initWithFrame:matrixRect mode:NSRadioModeMatrix prototype:buttonCell numberOfRows:numRows numberOfColumns:numCols],
		cells = [buttonMatrix cells];
	
	[buttonMatrix setAutorecalculatesCellSize:true];
	[buttonMatrix setIntercellSpacing:NSMakeSize(10,10)];
	
	for (var i = 0; i<numItems; i++) {
		itemName = items[i];
		[[cells objectAtIndex:i] setTitle:itemName];
		[[cells objectAtIndex:i] setTag:(i+100)];
	}
	
	[buttonMatrix selectCellWithTag:(defaultSelection+100)];
	
	return buttonMatrix;
}

function createButtonMatrix (buttonType, items, numRows, numCols, title, defaultSelection, multipleSelection) {
	if (typeof items === 'undefined' || items.length == 0) return;
	var buttonCell = [NSButtonCell new],
		title = (typeof title !== 'undefined') ? title : "Buttons",
		numRows = (typeof numRows !== 'undefined') ? numRows : 1,
		numCols = (typeof numCols !== 'undefined') ? numCols : [items count],
		defaultSelection = (typeof defaultSelection !== 'undefined') ? defaultSelection : [],
		multipleSelection = (typeof multipleSelection !== 'undefined') ? multipleSelection : false,
		matrixRect = NSMakeRect(0, 0, 300, (numRows*22)),
		numItems = items.length,
		itemName;
		
	[buttonCell setTitle:title];
	[buttonCell setButtonType:buttonType];
	
	var matrixMode = multipleSelection ? NSTrackModeMatrix : NSRadioModeMatrix,
		buttonMatrix = [[NSMatrix alloc] initWithFrame:matrixRect mode:matrixMode prototype:buttonCell numberOfRows:numRows numberOfColumns:numCols],
		cells = [buttonMatrix cells];
	
	[buttonMatrix setAutorecalculatesCellSize:true];
	[buttonMatrix setIntercellSpacing:NSMakeSize(10,10)];
	
	for (var i = 0; i<numItems; i++) {
		itemName = items[i];
		[[cells objectAtIndex:i] setTitle:itemName];
		[[cells objectAtIndex:i] setTag:(i+100)];
	}
	
	var numSelected = defaultSelection.length;
	for (var i = 0; i<numSelected; i++) {
		[buttonMatrix selectCellWithTag:(defaultSelection[i]+100)];
	}
	
	return buttonMatrix;
}


function createColorWell (hex) {
	var colorWell = [[NSColorWell alloc] initWithFrame:NSMakeRect(0,0,44,23)];
	if (typeof hex !== 'undefined' && hex != null) {
		var color = hexToNSColor(hex);
		[colorWell setColor:color];
	}
	return colorWell;
}

function createWebViewWithURL(urlString, x, y, width, height) {
	var x = (typeof x !== 'undefined') ? x : 0,
		y = (typeof y !== 'undefined') ? y : 0,
		width = (typeof width !== 'undefined') ? width : 300,
		height = (typeof height !== 'undefined') ? height : 200,
		webView = [[WebView alloc] initWithFrame:NSMakeRect(x, y, width, height) frameName:nil groupName:nil];
	[webView setMainFrameURL:urlString];
	return webView;
}

function browseForDirectory(title) {
	var openDialog = [NSOpenPanel openPanel];
	[openDialog setCanChooseFiles:false];
	[openDialog setCanChooseDirectories:true];
	[openDialog setAllowsMultipleSelection:false];
	[openDialog setCanCreateDirectories:true];
	[openDialog setTitle:title];
	if( [openDialog runModal] == NSOKButton ) {
		return [[openDialog URLs] firstObject];
	}
	return "";
}

function elementAtIndex (view, index) {
  return [view viewAtIndex: index];
}

function valueAtIndex (view, index) {
  var element = elementAtIndex(view, index);
  return [element stringValue];
}

function checkedAtIndex (view, index) {
  var element = elementAtIndex(view, index);
  return [element state];
}


//--------------------------------------
//  Remembering settings and values
//--------------------------------------

function initDefaults(initialValues) {
	var dVal;
	var defaults = initialValues;
	for (var key in initialValues) {
		dVal = getDefault(key);
		log("initDefaults key "+key);
		if (dVal == nil) {
			setDefault(key, initialValues[key]);
		} else {
			defaults[key] = dVal;
		}
	}
	return defaults;
}

function saveDefaults(newValues) {
	for (var key in newValues) {
		setDefault(key, newValues[key]);
	}
}

function getDefault(key) {
	var defaults = [NSUserDefaults standardUserDefaults],
		defaultValue = [defaults objectForKey: '-' + pluginDomain + '-' + key];
	if (defaultValue != nil && is(defaultValue, NSDictionary)) return [NSMutableDictionary dictionaryWithDictionary:defaultValue];
	return defaultValue;
}

function setDefault(key, value) {
	var defaults = [NSUserDefaults standardUserDefaults], 
		configs  = [NSMutableDictionary dictionary];
	[configs setObject: value forKey: '-' + pluginDomain + '-' + key];
	return [defaults registerDefaults: configs];
}

function syncDefaults() {
	var defaults = [NSUserDefaults standardUserDefaults];
	[defaults synchronize];
}


function loadDefaults(initialValues) {
	var dVal;
	var defaults = initialValues;
	//log("loadDefaults ");
	for (var key in initialValues) {

		 dVal = loadValue(key,typeof defaults[key]);

		 if(dVal != nil){
		  	defaults[key] = dVal;
        log("loadDefaults key "+key+"="+dVal);
     }
		
		//log("loadDefaults key "+key+"="+typeof defaults[key]);
		
	}
	return defaults;
}

var keyPref = 'AppAssetExportSketch';

function saveValue(key, value) {
    key = keyPref + key;
    if (typeof value === "boolean") {
      [[NSUserDefaults standardUserDefaults] setBool:value forKey:key]
    } else {
      [[NSUserDefaults standardUserDefaults] setObject:value forKey:key]
    }

    log("saveValue key "+key+"="+value);
    [[NSUserDefaults standardUserDefaults] synchronize]
  }

  function loadValue(key,valType){
   try {
    var prefs = NSUserDefaults.standardUserDefaults();

    if (valType  === "boolean") {
         return prefs.boolForKey(keyPref + key);
    } else {
      return prefs.stringForKey(keyPref + key);
    }
   
  } catch (e) {
    //log(e);
  }
}

  function saveValues(newValues) {
	for (var key in newValues) {
		saveValue(key, newValues[key]);
	}
}



//--------------------------------------
//  Helpers
//--------------------------------------

function objectTreeAsJSON(obj, prettyPrinted) {
	var tree = obj.treeAsDictionary(),
		prettySetting = prettyPrinted ? NSJSONWritingPrettyPrinted : 0,
		jsonData = [NSJSONSerialization dataWithJSONObject:tree options:prettySetting error:nil];
	return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

function stringify(obj, prettyPrinted) {
	var prettySetting = prettyPrinted ? NSJSONWritingPrettyPrinted : 0,
		jsonData = [NSJSONSerialization dataWithJSONObject:obj options:prettySetting error:nil];
	return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function dateAsReadableString(date) {
	var date = date ? date : new Date(),
		months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
	
}

function getCurrentDateAsString() {
	var formatter = [[NSDateFormatter alloc] init],
		date = [NSDate date];
	[formatter setTimeStyle:NSDateFormatterNoStyle];
	[formatter setDateStyle:NSDateFormatterMediumStyle];
	return [formatter stringFromDate:date];
}

function getUniqueID() {
	return [[NSUUID UUID] UUIDString];
}

function objectsAreEqual(layer1, layer2) {
	var tree1 = layer1.treeAsDictionary(),
		tree2 = layer2.treeAsDictionary();
	return [tree1 isEqualToDictionary:tree2];
}

function setUndoEnabled(enabled) {
	var undoManager = [[doc currentView] undoManager];
	if(enabled) {
		[undoManager enableUndoRegistration];
	} else {
		[undoManager disableUndoRegistration];
	}
}

function escapeString(originalString) {
	var escapedString = [[NSString stringWithFormat:@"%@", originalString] stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLHostAllowedCharacterSet]]
	return (escapedString != nil) ? escapedString : originalString
}

function unescapeString(escapedString) {
	var unescapedString = [[NSString stringWithFormat:@"%@", escapedString] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]
	return (unescapedString != nil) ? unescapedString : escapedString
}

//--------------------------------------
//  Managing manifest.json
//--------------------------------------

function getManifestJSON(mutable) {
	var manifestFilePath = [[plugin url] path] + "/Contents/Sketch/manifest.json";
	return jsonFromFile(manifestFilePath, mutable);
}

function getCommandForIdentifier(identifier) {
	var manifestJSON = getManifestJSON(),
		commands = manifestJSON.commands,
		commandID = [NSString stringWithFormat:@"%@", identifier],
		predicate = [NSPredicate predicateWithFormat:@"identifier == %@", commandID],
		filteredArray = [commands filteredArrayUsingPredicate:predicate];
		return ([filteredArray count] == 0) ? null : [filteredArray firstObject];
}

function getShortcutForIdentifier(identifier) {
	var command = getCommandForIdentifier(identifier);
	if (command != null)  return command.shortcut;
	return null;
}

//--------------------------------------
//  About Sketch
//--------------------------------------

function getSketchInfo() {
	var bundle = [NSBundle mainBundle];
	return {
		bundleID: [bundle bundleIdentifier],
		displayName: [bundle objectForInfoDictionaryKey:@"CFBundleDisplayName"],
		version: [bundle objectForInfoDictionaryKey:@"CFBundleShortVersionString"]
	}
}
