import * as vscode from 'vscode';
import { getRangeOfPid } from './frcmodule';
import { LocalTexts } from './local';

let show_line_colors = false;

export function reg(context: vscode.ExtensionContext,frcSelector:vscode.DocumentSelector){

	let line_color_mem = {
		colorRpid : -1,
		colorGpid : -1,
		colorBpid : -1,
		colorApid : -1
	};
	let line_color_sbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	line_color_sbar.text = show_line_colors ? LocalTexts.LineColorOnTip : LocalTexts.LineColorOffTip;
	line_color_sbar.command = 'flyric.linecolors.toggle';
	line_color_sbar.show();
	context.subscriptions.push(line_color_sbar);
	//命令配置
	context.subscriptions.push(vscode.commands.registerCommand('flyric.linecolors.toggle',()=>{
		show_line_colors = !show_line_colors;
		vscode.window.showInformationMessage(show_line_colors ? LocalTexts.LineColorOn:LocalTexts.LineColorOff);
		line_color_sbar.text = show_line_colors ? LocalTexts.LineColorOnTip : LocalTexts.LineColorOffTip;
		
	}));
	context.subscriptions.push(vscode.languages.registerColorProvider(frcSelector, {
		provideColorPresentations(color, context, token) {
			let txt = context.document.lineAt(context.range.start.line).text;

			let arr:{ r: number[]; c: number; }[] = [];

			function parse(pid:number,val:number){
				if(pid < 0){
					return;
				}
				let range = null;
				while(true){
					range = getRangeOfPid(txt,pid,false);
					if(range){
						break;
					}
					txt += ',';
				}
				arr.push({r:range,c:val});
			}
			parse(line_color_mem.colorRpid,color.red);
			parse(line_color_mem.colorGpid,color.green);
			parse(line_color_mem.colorBpid,color.blue);
			parse(line_color_mem.colorApid,1 - color.alpha);

			arr.sort((b,a)=>a.r[0] - b.r[0]);
			arr.forEach(r=>{
				txt = txt.substr(0,r.r[0]) + r.c.toFixed(7) + txt.substr(r.r[1]);
			});
			
			return [new vscode.ColorPresentation(txt)];
		}
		, provideDocumentColors(doc, token) {
			if(!show_line_colors){
				return null;
			}
			let ret:vscode.ColorInformation[] = [];
			let i = 0;
			while(i < doc.lineCount){
				for(;i<doc.lineCount;i++){
					if(doc.lineAt(i).text[0] === '['){
						break;
					}
				}
	
				if(doc.lineAt(i).text === '[flyc]'){
					i++;
					 
					line_color_mem.colorRpid = -1,
					line_color_mem.colorGpid = -1,
					line_color_mem.colorBpid = -1,
					line_color_mem.colorApid = -1;
					let colorR = 1,colorG = 1,colorB = 1,colorA = 1;
					if(i < doc.lineCount){
						//this is title
						let arr = doc.lineAt(i).text.split(',');
						line_color_mem.colorRpid = arr.indexOf('ColorR'),
						line_color_mem.colorGpid = arr.indexOf('ColorG'),
						line_color_mem.colorBpid = arr.indexOf('ColorB'),
						line_color_mem.colorApid = arr.indexOf('ColorA');
					}
					for(i++;i < doc.lineCount;i++){
						let txt = doc.lineAt(i).text;
						if(txt.startsWith('#') || txt.length === 0){
							continue;
						}else if(txt.startsWith('[')){
							break;
						}
						let r = getRangeOfPid(txt,line_color_mem.colorRpid,false);
						if(r && r[0] !== r[1]){
							colorR = Number.parseFloat(txt.substr(r[0],r[1] - r[0]));
						}
						r = getRangeOfPid(txt,line_color_mem.colorGpid,false);
						if(r && r[0] !== r[1]){
							colorG = Number.parseFloat(txt.substr(r[0],r[1] - r[0]));
						}
						r = getRangeOfPid(txt,line_color_mem.colorBpid,false);
						if(r && r[0] !== r[1]){
							colorB = Number.parseFloat(txt.substr(r[0],r[1] - r[0]));
						}
						r = getRangeOfPid(txt,line_color_mem.colorApid,false);
						if(r && r[0] !== r[1]){
							colorA =1 - Number.parseFloat(txt.substr(r[0],r[1] - r[0]));
						}
						ret.push(new vscode.ColorInformation(doc.lineAt(i).range,new vscode.Color(colorR,colorG,colorB,colorA)));
					}
				}else{
					i++;
				}
			}
			return ret;
		}
	}));
}