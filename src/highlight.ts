import * as vscode from 'vscode';
import { getTextPid, getRangeOfPid } from './frcmodule';

let label_reg = new RegExp('^\\[(.*)\\]$');

export let highlightProvider:vscode.DocumentHighlightProvider = {
    provideDocumentHighlights(doc, pos, tok) {
        let higharr: vscode.DocumentHighlight[] = [];
        let type = null;
        let labelline = pos.line;
        for (; labelline >= 0; labelline--) {
            if (doc.lineAt(labelline).text.match(label_reg)) {
                type = doc.lineAt(labelline).text;
                break;
            }
        }
        if (type === '[flyc]' || type === '[anim]') {
            let use_level_comma = type === '[anim]';
            //highlight comma
            let pid = 0;
            let txt = doc.getText(new vscode.Range(pos.line, 0, pos.line, pos.character));
            pid = getTextPid(txt, use_level_comma);

            function highlight(line: number) {
                let text = doc.lineAt(line).text;
                let range = getRangeOfPid(text,pid,use_level_comma);
                if(!range){
                    return;
                }
                if(text[range[1]] === ','){
                    range[1]++;
                }
                if (line === labelline + 1) {
                    higharr.push(new vscode.DocumentHighlight(new vscode.Range(line, range[0], line, range[1]), vscode.DocumentHighlightKind.Read));
                } else {
                    higharr.push(new vscode.DocumentHighlight(new vscode.Range(line, range[0], line, range[1]), vscode.DocumentHighlightKind.Write));
                }
            }
            if (pos.line !== labelline + 1) {
                highlight(labelline + 1);
                let from = pos.line - 10;
                let to = pos.line + 10;
                if (from < labelline + 2) {
                    from = labelline + 2;
                }
                for (let i = from; i <= to; i++) {
                    if (i > pos.line && (i >= doc.lineCount || doc.lineAt(i).text.match(label_reg))) {
                        break;
                    }
                    highlight(i);
                }
            } else {
                //highlight all
                for (let i = labelline + 1; i < doc.lineCount && !doc.lineAt(i).text.match(label_reg); i++) {
                    highlight(i);
                }
            }

        }
        return higharr;
    }
};