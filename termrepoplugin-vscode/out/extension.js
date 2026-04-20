"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const commands_1 = require("./commands");
const StorageManager_1 = require("./storage/StorageManager");
const views_1 = require("./views");
async function activate(context) {
    const storage = new StorageManager_1.StorageManager(context.globalStorageUri.fsPath);
    await storage.init();
    (0, commands_1.registerCommands)(context, storage);
    (0, views_1.registerWebviewView)(context, storage);
}
function deactivate() {
    // no-op
}
//# sourceMappingURL=extension.js.map