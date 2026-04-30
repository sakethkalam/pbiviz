"use strict";

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions      = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual                  = powerbi.extensibility.visual.IVisual;
import IVisualHost              = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstance     = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
    backgroundColor: "#162844",
    borderColor:     "#2a4a72",
    fontColor:       "#e8edf5",
    fontSize:        13,
    fontFamily:      "Segoe UI"
};

// ── Available font families ───────────────────────────────────────────────────
const FONT_OPTIONS: string[] = [
    "Segoe UI",
    "Arial",
    "Calibri",
    "Cambria",
    "Courier New",
    "Georgia",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS",
    "Verdana"
];

export class MBRCommentVisual implements IVisual {

    private host:      IVisualHost;
    private container: HTMLElement;
    private textarea:  HTMLTextAreaElement;
    private charCount: HTMLElement;

    // Format pane state
    private bgColor:    string = DEFAULTS.backgroundColor;
    private bdColor:    string = DEFAULTS.borderColor;
    private fontColor:  string = DEFAULTS.fontColor;
    private fontSize:   number = DEFAULTS.fontSize;
    private fontFamily: string = DEFAULTS.fontFamily;

    constructor(options: VisualConstructorOptions) {
        this.host      = options.host;
        this.container = options.element;
        this.buildDOM();
    }

    // ── Build DOM ─────────────────────────────────────────────────────────────
    private buildDOM(): void {

        const style = document.createElement("style");
        style.textContent = [
            "*{box-sizing:border-box;margin:0;padding:0}",
            ".wrap{width:100%;height:100%;padding:10px;background:transparent;display:flex;flex-direction:column;gap:6px}",
            ".lbl{font-size:11px;font-weight:600;color:#7a95b8;text-transform:uppercase;letter-spacing:0.8px}",
            ".ta{width:100%;flex:1;border-radius:6px;padding:10px 12px;resize:none;outline:none;transition:border-color 0.2s,background 0.2s,color 0.2s}",
            ".ta::placeholder{opacity:0.4}",
            ".cc{font-size:10px;color:#7a95b8;text-align:right}",
            ".cc-warn{color:#f5a623}",
            ".cc-over{color:#e05a5a}"
        ].join("");
        this.container.appendChild(style);

        const wrap = document.createElement("div");
        wrap.className = "wrap";

        // Label
        const lbl       = document.createElement("div");
        lbl.className   = "lbl";
        lbl.textContent = "Comments";
        wrap.appendChild(lbl);

        // Textarea
        this.textarea             = document.createElement("textarea");
        this.textarea.className   = "ta";
        this.textarea.placeholder = "Type your comment here...";
        this.textarea.maxLength   = 1000;
        this.applyStyles();

        this.textarea.addEventListener("input", () => {
            const len = this.textarea.value.length;
            this.charCount.textContent = len + " / 1000";
            if (len > 900) {
                this.charCount.className = "cc cc-over";
            } else if (len > 700) {
                this.charCount.className = "cc cc-warn";
            } else {
                this.charCount.className = "cc";
            }
        });

        wrap.appendChild(this.textarea);

        // Character count
        this.charCount             = document.createElement("div");
        this.charCount.className   = "cc";
        this.charCount.textContent = "0 / 1000";
        wrap.appendChild(this.charCount);

        this.container.appendChild(wrap);
    }

    // ── Apply all format pane styles to textarea ──────────────────────────────
    private applyStyles(): void {
        if (!this.textarea) { return; }
        this.textarea.style.background  = this.bgColor;
        this.textarea.style.border      = "1.5px solid " + this.bdColor;
        this.textarea.style.color       = this.fontColor;
        this.textarea.style.fontSize    = this.fontSize + "px";
        this.textarea.style.fontFamily  = this.fontFamily + ", sans-serif";
        this.charCount.style.fontFamily = this.fontFamily + ", sans-serif";
    }

    // ── Power BI calls this on every slicer / format pane change ─────────────
    public update(options: VisualUpdateOptions): void {
        const dataViews = options.dataViews;

        if (dataViews && dataViews[0] && dataViews[0].metadata) {
            const objects = dataViews[0].metadata.objects;

            if (objects && objects["commentBoxSettings"]) {
                const s = objects["commentBoxSettings"];

                // Background color
                if (s["backgroundColor"] && s["backgroundColor"]["solid"]) {
                    this.bgColor = s["backgroundColor"]["solid"]["color"] || DEFAULTS.backgroundColor;
                } else {
                    this.bgColor = DEFAULTS.backgroundColor;
                }

                // Border color
                if (s["borderColor"] && s["borderColor"]["solid"]) {
                    this.bdColor = s["borderColor"]["solid"]["color"] || DEFAULTS.borderColor;
                } else {
                    this.bdColor = DEFAULTS.borderColor;
                }

                // Font color
                if (s["fontColor"] && s["fontColor"]["solid"]) {
                    this.fontColor = s["fontColor"]["solid"]["color"] || DEFAULTS.fontColor;
                } else {
                    this.fontColor = DEFAULTS.fontColor;
                }

                // Font size
                if (s["fontSize"]) {
                    this.fontSize = Number(s["fontSize"]) || DEFAULTS.fontSize;
                } else {
                    this.fontSize = DEFAULTS.fontSize;
                }

                // Font family
                if (s["fontFamily"]) {
                    const selected = String(s["fontFamily"]);
                    this.fontFamily = FONT_OPTIONS.indexOf(selected) >= 0
                        ? selected
                        : DEFAULTS.fontFamily;
                } else {
                    this.fontFamily = DEFAULTS.fontFamily;
                }
            }
        }

        this.applyStyles();
    }

    // ── Expose comment value ──────────────────────────────────────────────────
    public getComment(): string {
        return this.textarea ? this.textarea.value.trim() : "";
    }

    // ── Power BI format pane ──────────────────────────────────────────────────
    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions
    ): VisualObjectInstance[] {

        if (options.objectName === "commentBoxSettings") {
            return [{
                objectName: "commentBoxSettings",
                selector:   null,
                properties: {
                    backgroundColor: { solid: { color: this.bgColor   } },
                    borderColor:     { solid: { color: this.bdColor    } },
                    fontColor:       { solid: { color: this.fontColor  } },
                    fontSize:        this.fontSize,
                    fontFamily:      this.fontFamily
                }
            }];
        }
        return [];
    }
}