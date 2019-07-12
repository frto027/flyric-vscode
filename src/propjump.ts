import * as vscode from 'vscode';
import { LocalTexts } from './local';
import { getRangeOfPid } from './frcmodule';

export function jumpProp(texteditor:vscode.TextEditor,edit:vscode.TextEditorEdit){
    let i = texteditor.selection.start.line;
    let j = i;
    while(j >= 0 && ['[flyc]','[anim]'].indexOf(texteditor.document.lineAt(j).text) < 0){
        j--;
    }
    if(j < 0){
        vscode.window.showErrorMessage(LocalTexts.UnsupportSegmentFunction);
        return;
    }
    let use_level_comma = texteditor.document.lineAt(j).text === '[anim]';
    j++;
    if(texteditor.document.lineCount <= j){
        vscode.window.showErrorMessage(LocalTexts.PropertyLineNeed);
        return;
    }
    let values = texteditor.document.lineAt(j).text.split(',');
    vscode.window.showQuickPick(values).then((s)=>{
        if(s){
            let pid = values.indexOf(s);
            let txt = texteditor.document.lineAt(i).text;
            let update_txt = false;
            let range: number[] | null = null;
            while(true){
                range = getRangeOfPid(txt,pid,use_level_comma);
                if(range){
                    break;
                }
                txt += ',';
                update_txt = true;
            }
            if(update_txt){
                texteditor.edit((edit)=>{
                    edit.replace(texteditor.document.lineAt(i).range,txt);
                    if(range){
                        texteditor.selection = new vscode.Selection(
                            new vscode.Position(i,range[0]),
                            new vscode.Position(i,range[1])
                        );
                    }
                });
            }
            if(range){
                texteditor.selection = new vscode.Selection(
                    new vscode.Position(i,range[0]),
                    new vscode.Position(i,range[1])
                );
            }
        }
    });
}