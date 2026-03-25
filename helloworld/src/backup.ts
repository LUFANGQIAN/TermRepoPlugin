// The module 'vscode' contains the VS Code extensibility API
// 'vscode' 模块包含了 VS Code 扩展性 API
// Import the module and reference it with the alias vscode in your code below
// 导入该模块，并在下方代码中使用别名 vscode 引用它
import * as vscode from 'vscode';

// This method is called when your extension is activated
// 当你的扩展被激活时，会调用此方法
// Your extension is activated the very first time the command is executed
// 你的扩展在命令首次执行时被激活
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// 使用控制台输出诊断信息 (console.log) 和错误 (console.error)
	// This line of code will only be executed once when your extension is activated
	// 这行代码只会在扩展激活时执行一次
	console.log('Congratulations, your extension "helloworld" is now active!');
	console.log('恭喜，您的扩展程序“helloworld”现已激活！');

	// The command has been defined in the package.json file
	// 该命令已在 package.json 文件中定义
	// Now provide the implementation of the command with registerCommand
	// 现在使用 registerCommand 提供命令的实现
	// The commandId parameter must match the command field in package.json
	// commandId 参数必须与 package.json 中的 command 字段匹配
	const disposable = vscode.commands.registerCommand('helloworld.helloworld', () => {
		// The code you place here will be executed every time your command is executed
		// 你在此处编写的代码将在每次执行命令时运行
		// Display a message box to the user
		// 向用户显示一个消息框

		let message: string = '这是变量输入的消息';
		vscode.window.showInformationMessage('Hello World from helloworld!');
		vscode.window.showInformationMessage('没错 第一个插件跑起来了');
		vscode.window.showInformationMessage(message);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// 当你的扩展被停用时，会调用此方法
export function deactivate() {
	console.log('扩展被停用');

}