import * as vscode from 'vscode';
  
//创建打印选中命令模块并导出
export function printSelectionCommand() {

  //业务实现部分 返回此对象
  //extension主入口导入此命令模块 注册即可使用
  return vscode.commands.registerCommand('termrepoplugin-vscode.printSelection', async () => {
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
    // await addWord(selectedText);
  });
}

