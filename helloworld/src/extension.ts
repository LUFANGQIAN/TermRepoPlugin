import * as vscode from 'vscode';
import * as os from 'os';






//vscode弹窗打印信息
export function activate(context: vscode.ExtensionContext) {
	console.log('扩展已激活');

	// 获取并输出 CPU 信息（激活时执行一次）
	const osCpusInfo = os.cpus();
	console.log(`CPU 核心数: ${osCpusInfo.length}`);
	console.log(`CPU 型号: ${osCpusInfo[0].model}`);

	// console.log(osCpusInfo);
	// console.log(typeof (osCpusInfo)); 

	// 注册vscode弹窗打印命令
	const registerMessageNotification = vscode.commands.registerCommand('helloworld.helloworld', () => {
		console.log('命令 helloworld.helloWorld 已执行');
		vscode.window.showInformationMessage('Hello World from helloworld!');
		vscode.window.showInformationMessage('没错，第一个插件跑起来了');
		vscode.window.showInformationMessage(`CPU 型号: ${osCpusInfo[0].model}`);
	});

	//注册CPU信息函数
	const RegisterLogCpusInfo = vscode.commands.registerCommand('helloworld.showCPUInfo', () => {
		const cpus = os.cpus();
		const cpuModel = cpus[0]?.model || '未知';
		const cpuCount = cpus.length;
		vscode.window.showInformationMessage(`CPU: ${cpuModel} (${cpuCount} 核心)`);
	});

	//注册CPU核心数
	const RegisterCpusNum = vscode.commands.registerCommand('helloworld.showCPUNum', () => {
		const cpus = os.cpus();
		const cpuCount = cpus.length;
		vscode.window.showInformationMessage(`CPU核心数: ${cpuCount} 核`);
	});

	//选中文字打印模块
	const printSelectionCmd = vscode.commands.registerCommand('helloworld.printSelection', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('没有活动的编辑器');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showWarningMessage('没有选中任何文本');
			return;
		}

		const selectedText = editor.document.getText(selection);
		// 打印到控制台
		console.log('选中的内容:', selectedText);
		// 可选：弹出消息框显示
		vscode.window.showInformationMessage(`选中内容: ${selectedText}`);
	});

	// 将命令注册添加到上下文订阅中
	context.subscriptions.push(registerMessageNotification, RegisterLogCpusInfo, RegisterCpusNum, printSelectionCmd);
}

export function deactivate() {
	console.log('扩展被停用');

}