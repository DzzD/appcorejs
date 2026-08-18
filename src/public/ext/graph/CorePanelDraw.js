import { Component } from "../../../app/js/Component.js";

export class CorePanelDraw extends Component
{
    static appcoreClass = "ext.graph.panel-draw";
    static appcoreCss = "ext.graph.panel-draw";

    #canvas = null;
    #context = null;
    #bufferCanvas = null;
    #bufferContext = null;
    #isDrawing = false;
    #lastX = 0;
    #lastY = 0;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    async onLoad()
    {
        this.#canvas = this.find("[data-panel-draw-canvas]");

        if (!this.#canvas)
        {
            this.#canvas = document.createElement("canvas");
            this.#canvas.dataset.panelDrawCanvas = "";
            this.node.appendChild(this.#canvas);
        }

        this.#context = this.#canvas.getContext("2d");
        this.#bufferCanvas = document.createElement("canvas");
        this.#bufferContext = this.#bufferCanvas.getContext("2d");

        this.#initBuffer();
        this.#applyDrawStyle();

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
        this.#bufferCanvas = null;
        this.#bufferContext = null;
    }

    clear()
    {
        if (!this.#bufferContext)
        {
            return;
        }

        this.#bufferContext.clearRect(0, 0, this.#bufferCanvas.width, this.#bufferCanvas.height);
        this.#render();
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

        this.#bufferContext.beginPath();
        this.#bufferContext.moveTo(this.#lastX, this.#lastY);
        this.#bufferContext.lineTo(position.x, position.y);
        this.#bufferContext.stroke();

        this.#lastX = position.x;
        this.#lastY = position.y;

        this.#render();
    };

    #handlePointerUp = (event) =>
    {
        this.#isDrawing = false;

        if (this.#canvas.hasPointerCapture(event.pointerId))
        {
            this.#canvas.releasePointerCapture(event.pointerId);
        }
    };

    #initBuffer()
    {
        this.#bufferCanvas.width = Math.max(
            1,
            Math.floor(Number(this.node.dataset.panelDrawWidth ?? this.#canvas.dataset.panelDrawWidth ?? 1024))
        );

        this.#bufferCanvas.height = Math.max(
            1,
            Math.floor(Number(this.node.dataset.panelDrawHeight ?? this.#canvas.dataset.panelDrawHeight ?? 768))
        );
    }

    #applyDrawStyle()
    {
        this.#bufferContext.lineCap = "round";
        this.#bufferContext.lineJoin = "round";
        this.#bufferContext.strokeStyle = "#111111";
        this.#bufferContext.lineWidth = 2;
    }

    #getPointerPosition(event)
    {
        const rect = this.#canvas.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0)
        {
            return { x: 0, y: 0 };
        }

        return {
            x: (event.clientX - rect.left) * this.#bufferCanvas.width / rect.width,
            y: (event.clientY - rect.top) * this.#bufferCanvas.height / rect.height
        };
    }

    #resizeCanvas()
    {
        if (!this.#canvas || !this.#context)
        {
            return;
        }

        const rect = this.node.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        if (width <= 0 || height <= 0)
        {
            return;
        }

        if (this.#canvas.width !== width)
        {
            this.#canvas.width = width;
        }

        if (this.#canvas.height !== height)
        {
            this.#canvas.height = height;
        }

        this.#render();
    }

    #render()
    {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#context.drawImage(
            this.#bufferCanvas,
            0,
            0,
            this.#bufferCanvas.width,
            this.#bufferCanvas.height,
            0,
            0,
            this.#canvas.width,
            this.#canvas.height
        );
    }
}