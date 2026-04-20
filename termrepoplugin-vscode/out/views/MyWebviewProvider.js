"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
class MyWebviewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
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
    _getHtml() {
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
exports.MyWebviewProvider = MyWebviewProvider;
//# sourceMappingURL=MyWebviewProvider.js.map