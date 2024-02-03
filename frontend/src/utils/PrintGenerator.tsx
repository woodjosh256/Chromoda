import {BAG_HEIGHT, BAG_WIDTH} from "../constants";
import {IconTypes} from "../components/printcustomizer/LocationPicker";
import React, {ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {flushSync} from "react-dom";
import {MdFavorite, MdHome, MdHomeFilled, MdLocationOn, MdMonitorHeart, MdPin, MdStar} from "react-icons/md";

export interface PrintOptions {
    color_a: string;
    color_b: string;
    gradient: boolean;
    secondary: boolean;
    location?: [number, number];
    locationIcon: IconTypes;
    locationColor: string;
}

const drawHeartOnCanvas = async (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = "./logo192.png";

        img.onload = () => {
            ctx.drawImage(img, x, y, width, height);
            resolve();
        };

        img.onerror = () => {
            reject(new Error('Image failed to load.'));
        };
    });
};

function MdPinF(props: { color: string }) {
    return null;
}

export class PrintGenerator {
    private svg: Document;
    private scale: number;

    // could adjust these to be smaller but same aspect ratio
    private readonly render_width: number;
    private readonly render_height: number;

    constructor(svg: string, scale=1) {
        this.svg = PrintGenerator.parseSvg(svg);
        this.scale = scale;
        this.render_width = BAG_WIDTH * scale
        this.render_height = BAG_HEIGHT * scale;
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
        let iconScale = this.scale;

        const updatedWidth = 8.625;
        const updatedHeight = 6.375;

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

                let reactComponent: ReactNode;
                switch (printOptions.locationIcon) {
                    case IconTypes.Heart:
                        reactComponent = <MdFavorite color={printOptions.locationColor}/>
                        break;
                    case IconTypes.Home:
                        reactComponent = <MdHomeFilled color={printOptions.locationColor}/>
                        break;
                    case IconTypes.Star:
                        reactComponent = <MdStar color={printOptions.locationColor}/>
                        break;
                    default:
                        reactComponent = <MdLocationOn color={printOptions.locationColor}/>
                        break
                }

                const tempDiv = document.createElement('div');
                const root = createRoot(tempDiv);
                flushSync(() => {
                    root.render(reactComponent)
                })

                const svgElement = tempDiv.querySelector('svg');
                if (!svgElement) return;
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const locImg = new Image();
                locImg.src = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
                locImg.onload = () => {
                    if (printOptions.gradient && printOptions.secondary) {
                        ctx.globalCompositeOperation = "source-in";
                        const gradient = ctx.createLinearGradient(0, height * scalingFactor * .4, width * scalingFactor, height * scalingFactor * .6);
                        gradient.addColorStop(0, printOptions.color_a);
                        gradient.addColorStop(1, printOptions.color_b);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, width * scalingFactor, height * scalingFactor);
                    }

                    ctx.globalCompositeOperation = "source-over";

                    if (printOptions.location) {
                        const w = 100 * scalingFactor * iconScale
                        const h = w;
                        ctx.drawImage(locImg, printOptions.location[0] * canvas.width - w / 2,
                            printOptions.location[1] * canvas.height - h / 2, w, h);
                    }

                    // const realAspectRatio = updatedWidth / updatedHeight;
                    // const canvasAspectRatio = canvas.width / canvas.height;
                    // const percent_wider = canvasAspectRatio / realAspectRatio;
                    // // canvas has a wider aspect ratio than the bag. Need to add white bars to the left and right side of canvas
                    const whiteBarWidth = canvas.width * 0.0425;
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, whiteBarWidth, canvas.height);
                    ctx.fillRect(canvas.width - whiteBarWidth, 0, whiteBarWidth, canvas.height);

                    // draw red bezier curves at each corner, starting 1/4 of the canvas width from each corner
                    ctx.fillStyle = 'red';
                    const radius = canvas.width / 8;
                    ctx.beginPath();
                    ctx.moveTo(whiteBarWidth, radius);
                    ctx.bezierCurveTo(whiteBarWidth, radius / 2, whiteBarWidth + radius / 2, 0, whiteBarWidth + radius, 0);
                    ctx.moveTo(canvas.width - whiteBarWidth, radius);
                    ctx.bezierCurveTo(canvas.width - whiteBarWidth, radius / 2, canvas.width - whiteBarWidth - radius / 2, 0, canvas.width - whiteBarWidth - radius, 0);
                    ctx.moveTo(whiteBarWidth, canvas.height - radius);
                    ctx.bezierCurveTo(whiteBarWidth, canvas.height - radius / 2, whiteBarWidth + radius / 2, canvas.height, whiteBarWidth + radius, canvas.height);
                    ctx.moveTo(canvas.width - whiteBarWidth, canvas.height - radius);
                    ctx.bezierCurveTo(canvas.width - whiteBarWidth, canvas.height - radius / 2, canvas.width - whiteBarWidth - radius / 2, canvas.height, canvas.width - whiteBarWidth - radius, canvas.height);


                    // ctx.moveTo(canvas.width - whiteBarWidth, radius);
                    // ctx.bezierCurveTo(canvas.width - whiteBarWidth, radius, canvas.width - whiteBarWidth, 0, canvas.width - whiteBarWidth - radius, 0);
                    // ctx.moveTo(whiteBarWidth, canvas.height - radius);
                    // ctx.bezierCurveTo(whiteBarWidth, canvas.height - radius, whiteBarWidth, canvas.height, whiteBarWidth + radius, canvas.height);
                    // ctx.moveTo(canvas.width - whiteBarWidth, canvas.height - radius);
                    // ctx.bezierCurveTo(canvas.width - whiteBarWidth, canvas.height - radius, canvas.width - whiteBarWidth, canvas.height, canvas.width - whiteBarWidth - radius, canvas.height);


                    // stroke with red that's 8 px wide
                    ctx.lineWidth = 12;
                    ctx.strokeStyle = 'white';
                    ctx.stroke();

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
            }

        });
    }

    async generatePrint(printOptions: PrintOptions): Promise<string> {
        this.updateStyle(printOptions);
        return await this.generateBitmap(printOptions, this.render_width, this.render_height);
    }

}