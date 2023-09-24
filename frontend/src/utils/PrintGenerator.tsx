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

                    if (printOptions.location) {
                        ctx.globalCompositeOperation = "source-over";
                        const w = 100 * scalingFactor;
                        const h = w;
                        ctx.drawImage(locImg, printOptions.location[0] * canvas.width - w / 2,
                            printOptions.location[1] * canvas.height - h / 2, w, h);
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
            }

        });
    }

    async generatePrint(printOptions: PrintOptions): Promise<string> {
        this.updateStyle(printOptions);
        return await this.generateBitmap(printOptions, this.render_width, this.render_height);
    }

}