import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';


//vscode弹窗打印信息
export function activate(context: vscode.ExtensionContext) {
	console.log('扩展已激活');



	const storagePath = context.globalStorageUri.fsPath;
	const wordsFilePath = path.join(storagePath, 'words.json');

	// 确保存储目录存在
	async function ensureStorageDir() {
		try {
			await fs.mkdir(storagePath, { recursive: true });
		} catch (err) {
			console.error('创建存储目录失败', err);
		}
	}

	//调用ensureStorageDir确保储存目录
	ensureStorageDir();


	//加载存储文件
	async function loadWords(): Promise<string[]> {
		try {
			const data = await fs.readFile(wordsFilePath, 'utf-8');
			return JSON.parse(data);
		} catch (err) {
			// 文件不存在或解析失败，返回空数组
			return [];
		}
	}

	// 保存单词列表
	async function saveWords(words: string[]): Promise<void> {
		await fs.writeFile(wordsFilePath, JSON.stringify(words, null, 2), 'utf-8');
	}


	// 添加一个新单词
	async function addWord(word: string): Promise<void> {
		const words = await loadWords();
		if (!words.includes(word)) {
			words.push(word);
			await saveWords(words);
			vscode.window.showInformationMessage(`已添加单词: ${word}`);
		} else {
			vscode.window.showInformationMessage(`单词 "${word}" 已存在`);
		}
	}

	// 获取并输出 CPU 信息（激活时执行一次）
	const osCpusInfo = os.cpus();
	console.log(`CPU 核心数: ${osCpusInfo.length}`);
	console.log(`CPU 型号: ${osCpusInfo[0].model}`);



	// 注册vscode弹窗打印命令
	const registerMessageNotification = vscode.commands.registerCommand('termrepoplugin-vscode.helloworld', () => {
		console.log('命令 termrepoplugin-vscode.helloWorld 已执行');
		vscode.window.showInformationMessage('Hello World fromtermrepoplugin-vscode!');
		vscode.window.showInformationMessage('没错，第一个插件跑起来了');
		vscode.window.showInformationMessage(`CPU 型号: ${osCpusInfo[0].model}`);
	});

	//注册CPU信息函数
	const RegisterLogCpusInfo = vscode.commands.registerCommand('termrepoplugin-vscode.showCPUInfo', () => {
		const cpus = os.cpus();
		const cpuModel = cpus[0]?.model || '未知';
		const cpuCount = cpus.length;
		vscode.window.showInformationMessage(`CPU: ${cpuModel} (${cpuCount} 核心)`);
	});

	//注册CPU核心数
	const RegisterCpusNum = vscode.commands.registerCommand('termrepoplugin-vscode.showCPUNum', () => {
		const cpus = os.cpus();
		const cpuCount = cpus.length;
		vscode.window.showInformationMessage(`CPU核心数: ${cpuCount} 核`);
	});

	//选中文字打印模块
	const printSelectionCmd = vscode.commands.registerCommand('termrepoplugin-vscode.printSelection', async () => {
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

		// 弹出消息框显示
		vscode.window.showInformationMessage(`选中内容: ${selectedText}`);

		// 保存到全局存储文件
		await addWord(selectedText);
	});

	// 将命令注册添加到上下文订阅中
	context.subscriptions.push(registerMessageNotification, RegisterLogCpusInfo, RegisterCpusNum, printSelectionCmd);
}

export function deactivate() {
	console.log('扩展被停用');

}