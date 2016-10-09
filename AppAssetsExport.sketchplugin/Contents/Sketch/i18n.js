
var Resources = {
 I18N: (function(){
    var language = [[[NSUserDefaults standardUserDefaults] objectForKey:@'AppleLanguages'] objectAtIndex:0];
    //多语言配置
    var I18N = {
      'zh-cn': {
        'language': 'cn',
        'EXPORT': '导出',
        'EXPORTTO': '导出到：',
        'EXPORTING': '正在导出，请稍候...',
        'NOARTBOARD': '没有选择任何画板',
        'EXPORTSUCCESS': '打包导出成功',
        'EXPORTFAIL': '打包导出失败',
        'NEWVERSION': '发现版本（{newversion}），从Toolbox中删除后重新安装可以获取新版本',
        'LAETVERSION': '已经是最新版本了',
        'NETERROR': '无法访问更新服务器，请稍后再试',
        'SELECTEXPORTARTBOARD': '请选择要导出的画板',
        'SELECTEDARTBOARD': '当前选中的画板',
        'ARTBOARDONPAGE': '当前页面上的全部画板',
        'ALLARTBOARD': '所有画板(会比较慢)',
        'EXPORTEVERYLAYER': '把每个图层作为图片导出',
        'SAVESKETCHSOURCE': '保存sketch源文件',
        'CONFIRM': '确认',
        'CANCEl': '取消',
        //预览页面多语言
        'MarketchPreview': {
          'UNIT': '单位',
          'SIZE': '尺寸',
          'SHOWSLICE': '显示切片',
          'DRAGTOSAVE': '右键或拖拽到桌面保存',
          'WIDTH': '宽',
          'HEIGHT': '高',
          'BORDER': '边框',
          'COLOR': '颜色',
          'FILLCOLOR': '填充色',
          'RADIUS': '圆角',
          'LAYERTEXT': '图层内容',
          'FONTSIZE': '字号',
          'CODE': '代码',
          'EXPORT': '导出',
          'FORMAT': '格式',
          'EXPORTLAYER': '导出选中图层',
          'COPYSUCCESS': '复制成功',
          'TEXTSHAREDSTYLE': '文字样式',
          'SHAPESHAREDSTYLE': '图层样式'
        }
      },
      'en': {
        'language': 'en',
        'EXPORT': 'Export',
        'EXPORTTO': 'Export to',
        'NOARTBOARD': 'No artboards found.',
        'EXPORTING': 'Exporting...',
        'EXPORTSUCCESS': 'Successfully Exported.',
        'EXPORTFAIL': 'Failed to Export.',
        'NEWVERSION': 'Marketch has a newer version({newversion}). Please reinstall from Sketch Toolbox.',
        'LAETVERSION': 'is currently the newest version available.',
        'NETERROR': 'Service is not available.',
        'SELECTEXPORTARTBOARD': 'Which artboard would you like to export?',
        'SELECTEDARTBOARD': 'Selected Artboard(s)',
        'ARTBOARDONPAGE': 'Artboards on Current Page',
        'ALLARTBOARD': 'All Artboards',
        'EXPORTEVERYLAYER': 'Export all layers as image',
        'SAVESKETCHSOURCE': 'Save Sketch file',
        'CONFIRM': 'Confirm',
        'CANCEl': 'Cancel',
        //预览页面多语言
        'MarketchPreview': {
          'UNIT': 'Unit',
          'SIZE': 'Size',
          'SHOWSLICE': 'Show slices',
          'DRAGTOSAVE': 'Drag to desktop to save.',
          'WIDTH': 'Width',
          'HEIGHT': 'Height',
          'BORDER': 'Border',
          'COLOR': 'Color',
          'FILLCOLOR': 'Fill',
          'RADIUS': 'Radius',
          'LAYERTEXT': 'Content',
          'FONTSIZE': 'Font Size',
          'CODE': 'Code',
          'EXPORT': 'Export',
          'FORMAT': 'Format',
          'EXPORTLAYER': 'Export Activity Layer',
          'COPYSUCCESS': 'Copy Success',
          'TEXTSHAREDSTYLE': 'Text Styles',
          'SHAPESHAREDSTYLE': 'Layer Styles'
        }
      }
    }
    //获取到语言后重新设置I18N变量，以简化操作
    //log("current lang "+new String(language).toString());
    if(new String(language).toString() !== 'zh-Hans-CN'){
      return I18N['en'];
    }else{
      return I18N['zh-cn'];
    }
  })()

  }

 