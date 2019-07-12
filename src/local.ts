import { env } from "vscode";

export let LocalTexts = {
    LineColorOn:"Flyric Line colors enabled",
    LineColorOff:"Flyric Line colors disabled",
    LineColorOnTip:"Line Colors:show",
    LineColorOffTip:"Line Colors:hide",
    Property:"Property",
    UnknownProperty:"Unknown property",
    DefaultValue:"Default value",
    InhertedFromLine:"Inhert from line",
    FlycSegDesc:"The lyric segment.",
    CurveSegDesc:"The curve segment",
    AnimSegDesc:"The anim segment",
    UnknownSegDesc:"unknwon",
    NeedFlycSegment:"flyc segment is need",
    FlycNoProperty:"flyc segment need property",
    FlycNoTypeProperty:"flyc segment need 'Type' property",
    FlycNoStartTimeProperty:"flyc segment need 'StartTime' property",
    FlycNoDurationProperty:"flyc segment need 'Duration' property",
    FlycNoTextProperty:"flyc segment need 'Text' property",
    ConvertLineStartToAbs:"todo",
    ConvertLineStartToPrivLine:"todo",
    ConvertLineDurToSolid:"todo",
    ConvertLineDurToBetween:"todo",
    UnsupportSegmentFunction:"The command dose not support current segment",
    PropertyLineNeed:"Need a property line",
    TipSaveSuccess:"Save success."
};

if(env.language === 'zh-cn'){
    LocalTexts.LineColorOn = "编辑歌词行颜色已开启";
    LocalTexts.LineColorOff = "编辑歌词行颜色已关闭";
    LocalTexts.Property = "属性";
    LocalTexts.UnknownProperty = "未知属性";
    LocalTexts.DefaultValue = "默认值";
    LocalTexts.InhertedFromLine = "继承自行";
    LocalTexts.FlycSegDesc = "歌词段，所有的歌词信息都放在这个段之中";
    LocalTexts.CurveSegDesc = "曲线段，定义了动画中可能用到的一部分曲线函数";
    LocalTexts.AnimSegDesc = "动画段，描述歌词中使用的动画的全部信息";
    LocalTexts.UnknownSegDesc = "未知段，语法编辑器不支持这个段的解析，这些段或许只能在某些新版本的软件中被解析";
    LocalTexts.LineColorOnTip = "行颜色:有";
    LocalTexts.LineColorOffTip = "行颜色:无";
    LocalTexts.NeedFlycSegment = "需要flyc段来提供属性信息才可以转换格式";
    LocalTexts.FlycNoProperty = "flyc段没有属性行";
    LocalTexts.FlycNoTypeProperty = "flyc段没有Type属性";
    LocalTexts.FlycNoStartTimeProperty= "flyc段没有StartTime属性";
    LocalTexts.FlycNoDurationProperty= "flyc段没有Duration属性";
    LocalTexts.FlycNoTextProperty= "flyc段没有Text属性";
    LocalTexts.ConvertLineStartToAbs = "转换器输出的行StartTime属性设置为绝对时间";
    LocalTexts.ConvertLineStartToPrivLine = "转换器输出的行StartTime属性设置为与前一行的相对时间";
    LocalTexts.ConvertLineDurToSolid = "转换器输出的行Duration属性设置为固定数值";
    LocalTexts.ConvertLineDurToBetween = "转换器输出的行Duration属性设置为Between占位";
    LocalTexts.UnsupportSegmentFunction = "此指令不支持光标所在的段";
    LocalTexts.PropertyLineNeed = "需要属性定义行";
    LocalTexts.TipSaveSuccess = "保存成功";
}