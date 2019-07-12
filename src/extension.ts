// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {LocalTexts} from './local';
import { getTextPid,getRangeOfPid,makeTextOfLine } from './frcmodule';
import { highlightProvider } from './highlight';
import { hoverProvider } from './hover';

import * as colorEdit from './coloredit';
import * as propjump from './propjump';
import * as formatconvert from './formatconvert';




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let frcSelector:vscode.DocumentSelector = { scheme: 'file', language: 'frc' };


	/* 功能：编辑行颜色 */
	colorEdit.reg(context,frcSelector);
	/* 功能：鼠标悬浮提示信息 */
	context.subscriptions.push(vscode.languages.registerHoverProvider(frcSelector, hoverProvider));
	/* 功能：点击内容后高亮相邻段和标题 */
	context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider(frcSelector, highlightProvider));
	/* 属性快速跳转 */
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('flyric.jump_to_property',propjump.jumpProp));
	/* 歌词格式互转 */
	formatconvert.reg(context,frcSelector);



	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
