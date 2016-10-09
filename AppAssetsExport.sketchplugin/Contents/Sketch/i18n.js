
var Resources = {
 I18N: (function(){
    var language = [[[NSUserDefaults standardUserDefaults] objectForKey:@'AppleLanguages'] objectAtIndex:0];
    //多语言配置
    var I18N = {
      'zh-cn': {
        'language': 'cn',
        'EXPORT_IOS_ICON': '导出iOS图标到',
        'EXPORT_ANDROID_ICON': '导出Android图标到',
        'EXPORT_STORE_ICON': '输出应用市场图标到',
        'INPUT_XCODE_FLODER':'输入Xcode项目Assets.xcassets目录名',
        'INPUT_ANDROID_FLODER':'输入Android资源(res)目录',
        'INPUT_STORE_FLODER':'输入应用市场图标目录',
        'EXPORT_DIRCTORY':'App Asset输出目录',
        'CANCEL':'取消',
        'CLOSE':'关闭',
        'SAVE_PREF':'保存配置',
        'PLEASE_SELECT_LAYER':'请选择一个层来输出',
        'NONE_ICON_EXPORT':'没有图标输出',


      
      },
      'en': {
        'language': 'en',
        'EXPORT_IOS_ICON': 'export iOS icon to ',
        'EXPORT_ANDROID_ICON': 'export Android icon to ',
        'EXPORT_STORE_ICON': 'export App Store icon to ',
        'INPUT_XCODE_FLODER':'Input XCode Assets.xcassets folder',
        'INPUT_ANDROID_FLODER':'Input Android Resource (res) folder',
        'INPUT_STORE_FLODER':' Input app store icon directory',
        'EXPORT_DIRCTORY':'App Asset export directory',
        'CANCEL':'Cancel',
        'CLOSE':'Close',
        'SAVE_PREF':'Save preferences',
        'PLEASE_SELECT_LAYER':'please select a layer to export.',
        'NONE_ICON_EXPORT':'none icon export.',
        
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

 