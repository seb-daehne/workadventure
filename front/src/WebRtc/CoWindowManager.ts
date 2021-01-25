import {HtmlUtils} from "./HtmlUtils";

export type CoWindowStateChangedCallback = () => void;

enum iframeStates {
    closed = 1,
    loading, // loading an iframe can be slow, so we show some placeholder until it is ready
    opened,
}

class CoWindowManager {
    

    private observers = new Array<CoWindowStateChangedCallback>();
    /**
     * Quickly going in and out of an iframe trigger can create conflicts between the iframe states.
     * So we use this promise to queue up every cowebsite state transition
     */
    private currentOperationPromise: Promise<void> = Promise.resolve();

    private windowRef: Window | null;
    private windowId: string;
    
    constructor() {
        this.windowId = "workadventure-co-window-id";
        this.windowRef = null;
    }
    
    private close(): void {
    }

    private load(): void {
    }

    private open(): void {
    }

    public loadCoWindow(url: string): void {
        this.load();
        this.windowRef = window.open(url, this.windowId);
    }


    public closeCoWindow(): void {
        this.windowRef?.close();
    }


    //todo: is it still useful to allow any kind of observers? 
    public onStateChange(observer: CoWindowStateChangedCallback) {
        this.observers.push(observer);
    }

    private fire(): void {
        for (const callback of this.observers) {
            callback();
        }
    }
}

export const coWindowManager = new CoWindowManager();