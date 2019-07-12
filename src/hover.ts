import * as vscode from 'vscode';
import { LocalTexts } from './local';
import { getRangeOfPid, getTextPid } from './frcmodule';

let label_reg = new RegExp('^\\[(.*)\\]$');

export let hoverProvider:vscode.HoverProvider = {
    provideHover(doc, pos, token) {
        if(doc.lineAt(pos.line).text[0] === '#'){
            //comment
            return null;
        }
        let type = null;
        let labelline = pos.line;
        for (; labelline >= 0; labelline--) {
            if (doc.lineAt(labelline).text.match(label_reg)) {
                type = doc.lineAt(labelline).text;
                break;
            }
        }
        if(labelline === pos.line){
            let tip = LocalTexts.UnknownSegDesc;
            if(type === '[flyc]'){
                tip = LocalTexts.FlycSegDesc;
            }
            if(type === '[anim]'){
                tip = LocalTexts.AnimSegDesc;
            }
            if(type === '[curve]'){
                tip = LocalTexts.CurveSegDesc;
            }
            return {
                contents : [tip]
            };
        }
        if (type === '[flyc]' || type === '[anim]') {
            let use_level_comma = type === '[anim]';
            //highlight comma
            let pid = getTextPid(doc.getText(new vscode.Range(pos.line,0,pos.line,pos.character)),use_level_comma);
            let pid_text = doc.lineAt(labelline + 1).text;
            
            let pidname_range = getRangeOfPid(pid_text,pid,use_level_comma);
            if(pidname_range){
                pid_text = pid_text.substr(pidname_range[0],pidname_range[1] - pidname_range[0]); 
            }else{
                return new vscode.Hover(`${LocalTexts.UnknownProperty}[${pid}]`);
            }
            if(pos.line === labelline + 1){
                return {
                    contents:[
                        new vscode.MarkdownString().appendText(`${LocalTexts.Property} [${pid}] `).appendMarkdown("`" + pid_text + "`"),
                    ]
                };
            }
            
            let usingline = pos.line;

            let text = doc.lineAt(pos.line).text;
            let range = getRangeOfPid(text,pid,use_level_comma);
            while(true){
                if(range && range[0] !== range[1]){
                    break;
                }
                usingline--;
                if(usingline > labelline + 1){
                    text = doc.lineAt(usingline).text;
                    range = getRangeOfPid(text,pid,use_level_comma);
                }else{
                    range = [0,0];
                    break;
                }
            }
            if(range){
                if(usingline === labelline + 1){
                    return {
                        contents:[
                            new vscode.MarkdownString().appendText(`${LocalTexts.Property} [${pid}] `).appendMarkdown("`" + pid_text + "`"),
                            LocalTexts.DefaultValue
                        ]
                    };
                }else if(usingline === pos.line){
                    text = text.substr(range[0],range[1] - range[0]);
                    return {
                        contents:[
                            new vscode.MarkdownString().appendText(`${LocalTexts.Property} [${pid}] `).appendMarkdown("`" + pid_text + "`").appendCodeblock(text),
                        ]
                    };
                }else{
                    text = text.substr(range[0],range[1] - range[0]);
                    return {
                        contents:[
                            new vscode.MarkdownString().appendText(`${LocalTexts.Property} [${pid}] `).appendMarkdown("`" + pid_text + "`").appendCodeblock(text),
                            `${LocalTexts.InhertedFromLine} [${usingline + 1}]`
                        ]
                    };
                }
            }else{
                return {
                    contents: [new vscode.MarkdownString().appendText(`${LocalTexts.Property} [${pid}] `).appendMarkdown("`" + pid_text + "`"),
                        "unknown"
                    ]
                };
            }
        }

        return null;
    }
};