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
exports.AiClient = void 0;
exports.createAiClient = createAiClient;
const vscode = __importStar(require("vscode"));
const termUtils_1 = require("../utils/termUtils");
class AiClient {
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl;
        this.accessToken = accessToken;
    }
    async analyzeTerm(input) {
        const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/ai/analyze-term`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...input,
                parts: (0, termUtils_1.splitIdentifier)(input.originalText),
                context: input.surroundingCode,
            }),
        });
        const payload = (await response.json());
        if (!response.ok || payload.code !== 0)
            throw new Error(payload.message || `HTTP ${response.status}`);
        return payload.data;
    }
}
exports.AiClient = AiClient;
function createAiClient() {
    const config = vscode.workspace.getConfiguration('termrepoplugin-vscode');
    const baseUrl = config.get('cloudSync.apiBaseUrl')?.trim() || 'http://localhost:3000/api/v1';
    const accessToken = config.get('cloudSync.accessToken')?.trim();
    if (!accessToken)
        return undefined;
    return new AiClient(baseUrl, accessToken);
}
//# sourceMappingURL=aiClient.js.map