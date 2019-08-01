import * as vscode from 'vscode';
import { makeTextOfLine } from './frcmodule';
import { LocalTexts } from './local';
import { readFile, writeFile } from 'fs';


enum frc_convert_line_relative_type {
	absolute, priv_line
}
enum frc_covert_node_relative_type {
	absolute, relative_line, relative_node
}
enum frc_covert_duration_type {
	solid, between
}
enum frc_covert_node_duration_type {
	solid_next_node, solid_end_of_line, between
}

class FormatConfigReader{
	public relative_line_time: frc_convert_line_relative_type;
	public relative_node_time: frc_covert_node_relative_type;
	public duration_time: frc_covert_duration_type;
	public node_duration_time: frc_covert_node_duration_type;
	 
	constructor(){
		let conf = vscode.workspace.getConfiguration('flyric.convert');
		this.relative_line_time = Number.parseInt(conf.LineStartTime);
		this.relative_node_time = Number.parseInt(conf.NodeStartTime);
		this.duration_time = Number.parseInt(conf.LineDuration);
		this.node_duration_time = Number.parseInt(conf.NodeDuration);
	}
}
const lrc_label_reg = /\[([0-9]+):([0-9]+.[0-9]+)\]/g;

function getIds(editor:vscode.TextEditor){
	let type_id: number, start_time_id: number, duration_id: number, text_id: number;
		{
			let doc = editor.document;
			//find seg flyc
			let i = 0;
			while (i < doc.lineCount && doc.lineAt(i).text !== '[flyc]') {
				i++;
			}
			if (i >= doc.lineCount || doc.lineAt(i).text !== '[flyc]') {
				//error no segment
				vscode.window.showErrorMessage(LocalTexts.NeedFlycSegment);
				return null;
			}
			i++;
			if (i >= doc.lineCount) {
				//error 
				vscode.window.showErrorMessage(LocalTexts.FlycNoProperty);
				return null;
			}

			let txts = doc.lineAt(i).text.split(',');
			type_id = txts.indexOf('Type');
			if (type_id < 0) {
				vscode.window.showErrorMessage(LocalTexts.FlycNoTypeProperty);
				return null;
			}
			start_time_id = txts.indexOf('StartTime');
			if (start_time_id < 0) {
				vscode.window.showErrorMessage(LocalTexts.FlycNoStartTimeProperty);
				return null;
			}
			duration_id = txts.indexOf('Duration');
			if (duration_id < 0) {
				vscode.window.showErrorMessage(LocalTexts.FlycNoDurationProperty);
				return null;
			}
			text_id = txts.indexOf('Text');
			if (text_id < 0) {
				vscode.window.showErrorMessage(LocalTexts.FlycNoTextProperty);
				return null;
			}
		}
		return [type_id,start_time_id,duration_id,text_id];
}

function absDataToFrc(data: { time: number, node: { time: number, txt: string }[] }[], type_id: number, start_time_id: number, duration_id: number, text_id: number): string | null {


	let frc_convert_config =new FormatConfigReader();

	let ret = "";

	let last_line_time: number | null = null;
	data.sort((a, b) => a.time - b.time).forEach((linedata, index) => {
		if (linedata.node.length === 0) {
			return;//return ForEach
		}
		let curLineTimeText;
		let duringText;
		if (last_line_time === null || frc_convert_config.relative_line_time === frc_convert_line_relative_type.absolute) {
			last_line_time = linedata.time;
			curLineTimeText = linedata.time.toFixed(0);
		} else if (frc_convert_config.relative_line_time === frc_convert_line_relative_type.priv_line) {
			curLineTimeText = ">" + (linedata.time - last_line_time).toFixed(0);
		} else {
			curLineTimeText = "0";
		}


		if (frc_convert_config.duration_time === frc_covert_duration_type.between) {
			duringText = "between";
		} else {
			let dur = 2000;
			if (index + 1 < data.length) {
				dur = (data[index + 1].time - linedata.time);
			}
			duringText = dur.toFixed(0);
		}
		//insert line here
		if (ret !== "") {
			ret += '\n';
		}
		ret += makeTextOfLine([
			{ pid: type_id, text: 'line' },
			{ pid: start_time_id, text: curLineTimeText },
			{ pid: duration_id, text: duringText },
			//			{pid : text_id,text : 'N'}
		]);

		let last_node_time = linedata.time;

		linedata.node.forEach((nodedata, nindex, arr) => {
			let nodeStartText: string;
			let nodeDurationText;
			if (frc_convert_config.node_duration_time === frc_covert_node_duration_type.between) {
				nodeDurationText = "between";
			} else if (nindex + 1 >= arr.length || frc_convert_config.node_duration_time === frc_covert_node_duration_type.solid_end_of_line) {
				let lineend = nodedata.time + 2000;
				if (index + 1 < data.length) {
					lineend = data[index + 1].time;
				}
				let ndur = lineend - nodedata.time;
				if (ndur < 0) {
					ndur = 0;
				}
				nodeDurationText = ndur.toFixed(0);
			} else if (frc_convert_config.node_duration_time === frc_covert_node_duration_type.solid_next_node) {
				nodeDurationText = (arr[nindex + 1].time - nodedata.time).toFixed(0);
			} else {
				nodeDurationText = "between";
			}

			if (frc_convert_config.relative_node_time === frc_covert_node_relative_type.absolute) {
				nodeStartText = nodedata.time.toFixed(0);
			} else if (frc_convert_config.relative_node_time === frc_covert_node_relative_type.relative_line) {
				nodeStartText = ">" + (nodedata.time - linedata.time).toFixed(0);
			} else if (frc_convert_config.relative_node_time === frc_covert_node_relative_type.relative_node) {
				nodeStartText = ">>" + (nodedata.time - last_node_time).toFixed(0);
				last_node_time = nodedata.time;
			} else {
				nodeStartText = "";
			}

			//insert node here
			if (ret !== "") {
				ret += '\n';
			}
			ret += makeTextOfLine([
				{
					pid: type_id,
					text: 'word'
				},
				{
					pid: start_time_id,
					text: nodeStartText
				}, {
					pid: duration_id,
					text: nodeDurationText
				}, {
					pid: text_id,
					text: nodedata.txt
				}
			]);
		});


		last_line_time = linedata.time;
	});


	return ret;
}



function lrcTofrc(lrc: string, type_id: number, start_time_id: number, duration_id: number, text_id: number) {
	let maps: { time: number, node: { time: number, txt: string }[] }[] = [];
	lrc.split('\n').forEach(s => {
		s = s.replace('\r','');
		let str = s.replace(lrc_label_reg, '').replace('\\', '\\\\').replace(',', '\\,');
		s = s.replace(/\[:\].*/, '');
		let linetimes;
		// tslint:disable-next-line: triple-equals
		while ((linetimes = lrc_label_reg.exec(s)) != null) {
			let timems = (Number.parseFloat(linetimes[1]) * 60 + Number.parseFloat(linetimes[2])) * 1000;
			maps.push({
				time: timems,
				node: [{
					time: timems,
					txt: str
				}]
			});
		}
	});


	let txt = absDataToFrc(maps, type_id, start_time_id, duration_id, text_id);
	return txt;
}

function lrcToFrcFile(text: string) {
	let title = `[flyc]\nType,StartTime,Text,Duration,ColorR,ColorG,ColorB,ColorA,AnchorX,AnchorY,SelfAnchorX,SelfAnchorY\n`;

	let defValue = `line,0,N,0,1,1,1,0,.5,.5,.5,.5\n`;

	let frc = lrcTofrc(text,0,1,3,2);
	return title + defValue + frc;
}

export function reg(context: vscode.ExtensionContext, frcSelector: vscode.DocumentSelector) {
	//从lrc行到frc行
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('flyric.lrcext.linefromlrc', (editor, edit) => {
		let range = new vscode.Range(
			editor.document.lineAt(editor.selection.start.line).range.start,
			editor.document.lineAt(editor.selection.end.line).range.end
		);

		let txt = editor.document.getText(range);

		let ids = getIds(editor);
		if(!ids){
			return null;
		}
		
		let ntxt = lrcTofrc(txt, ids[0],ids[1],ids[2],ids[3]);

		if (ntxt) {
			edit.replace(range, ntxt);
		}
	}));

	//从lrc文件到frc文件
	context.subscriptions.push(vscode.commands.registerCommand('flyric.lrcext.filefromlrc',(s)=>{
		let fpath : string = s && s.fsPath;
		if(fpath){
			let txt = readFile(fpath,"utf8",(err,data)=>{
				if(err){
					vscode.window.showErrorMessage("File open failed.\n" + err.message);
					return;
				}
				data = lrcToFrcFile(data);
				data += '\n';
				vscode.window.showSaveDialog({
					defaultUri : vscode.Uri.file(fpath.substr(0,fpath.length - 4) + '.frc')
				}).then(value=>{
					if(value){
						writeFile(value.fsPath,data,{encoding:'utf8'},err=>{
							if(err){
								vscode.window.showErrorMessage("save file failed.\n"+err.message);
							}else{
								vscode.window.showInformationMessage(LocalTexts.TipSaveSuccess);
							}
						});
					}
				});
			});
		}
	}));

	let csv_reg = /([0-9]+),(("([^"]|"")+")|[^,]+)/g;

	//从csv时间标记到flyric
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('flyric.csvext.toflyc',(editor,edit)=>{
		let range = new vscode.Range(
			editor.document.lineAt(editor.selection.start.line).range.start,
			editor.document.lineAt(editor.selection.end.line).range.end
		);

		let txt = editor.document.getText(range);
		
		let ids = getIds(editor);
		if(!ids){
			return;
		}

		let data :{ time: number, node: { time: number, txt: string }[] }[]= [];
		
		txt.split('\n').forEach((linetxt,i)=>{
			linetxt = linetxt.replace('\r','');
			if(linetxt.length === 0){
				return;
			}
			

			//the first number is line start
			let cpos = linetxt.search(',');
			let line_time = cpos < 0 ? Number.parseInt(linetxt) : Number.parseInt(linetxt.substr(0,cpos));

			let x: { time: number; node: { time: number, txt: string }[]; } = {
				time : line_time,
				node : []
			};
		
			if(cpos > 0){
				let nodetxt = linetxt.substr(cpos);
				let txt;
				// tslint:disable-next-line: triple-equals
				while((txt = csv_reg.exec(nodetxt)) != null){
					let tim = Number.parseInt(txt[1]);
					let text = txt[2];
					if(text.startsWith('"')){
						text = text.substr(1,text.length - 2).replace('""','"');
					}

					x.node.push({
						time:tim,
						txt:text.replace('\\','\\\\').replace(',','\\,')
					});
				}
			}
			data.push(x);
	
		});
		let newtxt = absDataToFrc(data,ids[0],ids[1],ids[2],ids[3]);
		if(newtxt){
			edit.replace(range,newtxt);
		}

	}));
}