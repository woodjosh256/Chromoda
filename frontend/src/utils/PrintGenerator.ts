import {BAG_HEIGHT, BAG_WIDTH} from "../constants";

export interface PrintOptions {
    color_a: string;
    color_b: string;
    gradient: boolean;
    secondary: boolean;
}

export class PrintGenerator {
    private svg: Document;

    // could adjust these to be smaller but same aspect ratio
    private render_width = BAG_WIDTH
    private render_height = BAG_HEIGHT

    constructor(svg: string) {
        this.svg = PrintGenerator.parseSvg(svg);
    }

    private static parseSvg(svg: string): Document {
        const parser = new DOMParser();
        return parser.parseFromString(svg, "image/svg+xml");
    }

    private updateStyle(printOptions: PrintOptions) {
        const polylines = this.svg.querySelectorAll("polyline");
        polylines.forEach(polyline => {
            const classAttr = polyline.getAttribute("class") || "";

            if (classAttr.includes('secondary') && printOptions.secondary) {
                polyline.setAttribute("stroke", printOptions.color_b);
            } else {
                polyline.setAttribute("stroke", printOptions.color_a);
            }
        });
    }

    private async generateBitmap(printOptions: PrintOptions, width: number, height: number): Promise<string> {
        // higher scaling means the generated image will be look better
        // (but will be the same size)
        let scalingFactor = 2;

        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            canvas.width = width * scalingFactor; // Higher resolution
            canvas.height = height * scalingFactor; // Higher resolution
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("Failed to get canvas context");
                return;
            }

            const img = new Image(width * scalingFactor, height * scalingFactor);
            img.src = 'data:image/svg+xml,' + encodeURIComponent(this.svg.documentElement.outerHTML);

            img.onload = function () {
                ctx.drawImage(img, 0, 0, width * scalingFactor, height * scalingFactor);

                if (printOptions.gradient && printOptions.secondary) {
                    ctx.globalCompositeOperation = "source-in";
                    const gradient = ctx.createLinearGradient(0, height * scalingFactor * .4, width * scalingFactor, height * scalingFactor * .6);
                    gradient.addColorStop(0, printOptions.color_a);
                    gradient.addColorStop(1, printOptions.color_b);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width * scalingFactor, height * scalingFactor);
                }

                // Downscale if needed
                if (scalingFactor !== 1) {
                    const tempCanvas = document.createElement("canvas");
                    tempCanvas.width = width;
                    tempCanvas.height = height;
                    const tempCtx = tempCanvas.getContext("2d");
                    if (tempCtx) {
                        tempCtx.drawImage(canvas, 0, 0, width, height);
                    }
                    resolve(tempCanvas.toDataURL("image/png"));
                } else {
                    resolve(canvas.toDataURL("image/png"));
                }
            };

            img.onerror = function () {
                reject("Failed to load image");
            }
        });
    }

    async generatePrint(printOptions: PrintOptions): Promise<string> {
        this.updateStyle(printOptions);
        return await this.generateBitmap(printOptions, this.render_width, this.render_height);
    }

}