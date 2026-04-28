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
exports.CloudSyncClient = void 0;
exports.createCloudSyncClient = createCloudSyncClient;
const vscode = __importStar(require("vscode"));
class CloudSyncClient {
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.accessToken = accessToken;
    }
    async status() {
        return this.request('/sync/status', { method: 'GET' });
    }
    async enable() {
        return this.request('/sync/toggle', {
            method: 'POST',
            body: JSON.stringify({ enabled: true }),
        });
    }
    async exportSnapshot() {
        return this.request('/sync/snapshot/export', { method: 'GET' });
    }
    async importSnapshot(mode, snapshot) {
        return this.request('/sync/snapshot/import', {
            method: 'POST',
            body: JSON.stringify({ mode, snapshot }),
        });
    }
    async request(path, init) {
        const url = `${this.baseUrl}${path}`;
        let response;
        try {
            response = await fetch(url, {
                ...init,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    ...(init.headers ?? {}),
                },
            });
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            throw new Error(`无法连接 TermRepo 后端：${url}。请确认后端已启动、地址配置正确。原始错误：${reason}`);
        }
        let payload;
        try {
            payload = (await response.json());
        }
        catch {
            throw new Error(`TermRepo 后端返回了非 JSON 响应：HTTP ${response.status}`);
        }
        if (!response.ok || payload.code !== 0) {
            throw new Error(payload.message || `HTTP ${response.status}`);
        }
        return payload.data;
    }
}
exports.CloudSyncClient = CloudSyncClient;
function createCloudSyncClient() {
    const config = vscode.workspace.getConfiguration('termrepoplugin-vscode');
    const baseUrl = config.get('cloudSync.apiBaseUrl')?.trim() || 'http://localhost:3000/api/v1';
    const accessToken = config.get('cloudSync.accessToken')?.trim();
    if (!accessToken) {
        void vscode.window.showWarningMessage('请先在设置中配置 TermRepo 云同步 Access Token。');
        return undefined;
    }
    return new CloudSyncClient(baseUrl, accessToken);
}
//# sourceMappingURL=cloudSyncClient.js.map