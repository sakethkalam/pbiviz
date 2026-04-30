import { MBRCommentVisual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var MBRCommentVisual1A2B3C4D5E6F: IVisualPlugin = {
    name: 'MBRCommentVisual1A2B3C4D5E6F',
    displayName: 'MBR Monthly Entry Form',
    class: 'MBRCommentVisual',
    apiVersion: '5.11.0',
    create: (options?: VisualConstructorOptions) => {
        if (MBRCommentVisual) {
            return new MBRCommentVisual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["MBRCommentVisual1A2B3C4D5E6F"] = MBRCommentVisual1A2B3C4D5E6F;
}
export default MBRCommentVisual1A2B3C4D5E6F;