import * as vscode from 'vscode';


export class MyWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    // 允许 Webview 运行脚本
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    // 设置 HTML 内容（包含一个按钮和弹窗逻辑）
    webviewView.webview.html = this._getHtml();

    // 监听来自 Webview 的消息
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'buttonClicked') {
        vscode.window.showInformationMessage('侧边栏webview中的按钮被触发！');
      }
    });
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Webview 面板</title>
            <style>
                body {
                    padding: 20px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 2px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <button id="myButton">点击触发弹窗</button>
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    const button = document.getElementById('myButton');
                    button.addEventListener('click', () => {
                        vscode.postMessage({ command: 'buttonClicked' });
                    });
                })();
            </script>
        </body>
        </html>`;
  }
}
