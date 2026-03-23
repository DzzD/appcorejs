import { Component } from "../../../app/js/Component.js";

export class CorePanelDraw extends Component
{
    #canvas = null;
    #context = null;
    #isDrawing = false;
    #lastX = 0;
    #lastY = 0;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    async onLoad()
    {
        await Loader.loadStyle("ext/graph/panel-draw.css");

        this.#canvas = this.find("[data-panel-draw-canvas]");

        if (!this.#canvas)
        {
            this.#canvas = document.createElement("canvas");
            this.node.appendChild(this.#canvas);
        }

        this.#context = this.#canvas.getContext("2d");

        
        this.#canvas.addEventListener("pointerdown", this.#handlePointerDown);
        this.#canvas.addEventListener("pointermove", this.#handlePointerMove);
        this.#canvas.addEventListener("pointerup", this.#handlePointerUp);
        this.#canvas.addEventListener("pointerleave", this.#handlePointerUp);
        this.#canvas.addEventListener("pointercancel", this.#handlePointerUp);

        this.#resizeCanvas();
    }

    onResize()
    { 
        this.#resizeCanvas();
    }

    onUnload()
    {
        if (!this.#canvas)
        {
            return;
        }

        this.#canvas.removeEventListener("pointerdown", this.#handlePointerDown);
        this.#canvas.removeEventListener("pointermove", this.#handlePointerMove);
        this.#canvas.removeEventListener("pointerup", this.#handlePointerUp);
        this.#canvas.removeEventListener("pointerleave", this.#handlePointerUp);
        this.#canvas.removeEventListener("pointercancel", this.#handlePointerUp);

        this.#canvas = null;
        this.#context = null;
    }

    clear()
    {
        if (!this.#canvas || !this.#context)
        {
            return;
        }

        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #bindEvents()
    {
    }

    #handlePointerDown = (event) =>
    {
        const position = this.#getPointerPosition(event);

        this.#isDrawing = true;
        this.#lastX = position.x;
        this.#lastY = position.y;

        this.#canvas.setPointerCapture(event.pointerId);
    };

    #handlePointerMove = (event) =>
    {
        if (!this.#isDrawing)
        {
            return;
        }

        const position = this.#getPointerPosition(event);

        this.#context.beginPath();
        this.#context.moveTo(this.#lastX, this.#lastY);
        this.#context.lineTo(position.x, position.y);
        this.#context.stroke();

        this.#lastX = position.x;
        this.#lastY = position.y;
    };

    #handlePointerUp = (event) =>
    {
        this.#isDrawing = false;

        if (this.#canvas.hasPointerCapture(event.pointerId))
        {
            this.#canvas.releasePointerCapture(event.pointerId);
        }
    };

    #getPointerPosition(event)
    {
        const rect = this.#canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left),
            y: (event.clientY - rect.top)
        };
    }

    #resizeCanvas()
    {
        if (!this.#canvas || !this.#context)
        {
            return;
        }
        const rect = this.node.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width)) ;
        const height = Math.max(1, Math.floor(rect.height)) ;

        let tempCanvas = null;

        if (this.#canvas.width > 0 && this.#canvas.height > 0)
        {
            tempCanvas = document.createElement("canvas");
            tempCanvas.width = this.#canvas.width;
            tempCanvas.height = this.#canvas.height;
            tempCanvas.getContext("2d").drawImage(this.#canvas, 0, 0);
        }

        this.#canvas.width = width;
        this.#canvas.height = height;

        this.#context = this.#canvas.getContext("2d");
        this.#context.lineCap = "round";
        this.#context.lineJoin = "round";
        this.#context.strokeStyle = "#111111";
        this.#context.lineWidth = 2;

        if (tempCanvas)
        {
            this.#context.drawImage(tempCanvas, 0, 0, width, height);
        }
    }
}
