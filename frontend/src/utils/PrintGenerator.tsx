import {BAG_HEIGHT, BAG_WIDTH, SHITTY_SCALE} from "../constants";
import {IconTypes} from "../components/printcustomizer/LocationPicker";
import React, {ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {flushSync} from "react-dom";
import {MdFavorite, MdHome, MdHomeFilled, MdLocationOn, MdMonitorHeart, MdPin, MdStar} from "react-icons/md";
import {text} from "stream/consumers";

type Nullable<T> = T | null;

export interface PrintOptions {
    color_a: string;
    color_b: string;
    gradient: boolean;
    secondary: boolean;
    text: Nullable<string>;
    coordinates: boolean;
    center?: [number, number]; // lon, lat
}

export class PrintGenerator {
    private svg: Document;
    private scale: number;

    // could adjust these to be smaller but same aspect ratio
    private readonly render_width: number;
    private readonly render_height: number;

    constructor(svg: string, scale = 1) {
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

    // private async generateBitmap(printOptions: PrintOptions, width: number, height: number, showText: boolean): Promise<string> {
    //     // higher scaling means the generated image will be look better
    //     // (but will be the same size)
    //     let scalingFactor = 2;
    //     let iconScale = this.scale;
    //
    //     return new Promise((resolve, reject) => {
    //         const canvas = document.createElement("canvas");
    //         canvas.width = width * scalingFactor; // Higher resolution
    //         canvas.height = height * scalingFactor; // Higher resolution
    //         const ctx = canvas.getContext("2d");
    //         if (!ctx) {
    //             reject("Failed to get canvas context");
    //             return;
    //         }
    //
    //         resolve(canvas.toDataURL("image/png"))
    //
    //         const img = new Image(width * scalingFactor, height * scalingFactor);
    //         img.src = 'data:image/svg+xml,' + encodeURIComponent(this.svg.documentElement.outerHTML);
    //
    //         console.log(this.svg)
    //
    //         img.onload = () => {
    //             ctx.drawImage(img, 0, 0, width * scalingFactor, height * scalingFactor);
    //
    //             // Downscale if needed
    //             if (scalingFactor !== 1) {
    //                 const tempCanvas = document.createElement("canvas");
    //                 tempCanvas.width = width;
    //                 tempCanvas.height = height;
    //                 const tempCtx = tempCanvas.getContext("2d");
    //                 if (tempCtx) {
    //                     tempCtx.drawImage(canvas, 0, 0, width, height);
    //                 }
    //                 resolve(tempCanvas.toDataURL("image/png"));
    //             } else {
    //                 resolve(canvas.toDataURL("image/png"));
    //             }
    //         }
    //
    //
    //         //
    //         // img.onload = function () {
    //         //     ctx.drawImage(img, 0, 0, width * scalingFactor, height * scalingFactor);
    //         //
    //         //     let reactComponent: ReactNode;
    //         //     switch (printOptions.locationIcon) {
    //         //         case IconTypes.Heart:
    //         //             reactComponent = <MdFavorite color={printOptions.locationColor}/>
    //         //             break;
    //         //         case IconTypes.Home:
    //         //             reactComponent = <MdHomeFilled color={printOptions.locationColor}/>
    //         //             break;
    //         //         case IconTypes.Star:
    //         //             reactComponent = <MdStar color={printOptions.locationColor}/>
    //         //             break;
    //         //         default:
    //         //             reactComponent = <MdLocationOn color={printOptions.locationColor}/>
    //         //             break
    //         //     }
    //         //
    //         //     const tempDiv = document.createElement('div');
    //         //     const root = createRoot(tempDiv);
    //         //     flushSync(() => {
    //         //         root.render(reactComponent)
    //         //     })
    //         //
    //         //     const svgElement = tempDiv.querySelector('svg');
    //         //     if (!svgElement) return;
    //         //     const svgString = new XMLSerializer().serializeToString(svgElement);
    //         //     const locImg = new Image();
    //         //     locImg.src = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    //         //     locImg.onload = () => {
    //         //         if (printOptions.gradient && printOptions.secondary) {
    //         //             ctx.globalCompositeOperation = "source-in";
    //         //             const gradient = ctx.createLinearGradient(0, height * scalingFactor * .4, width * scalingFactor, height * scalingFactor * .6);
    //         //             gradient.addColorStop(0, printOptions.color_a);
    //         //             gradient.addColorStop(1, printOptions.color_b);
    //         //             ctx.fillStyle = gradient;
    //         //             ctx.fillRect(0, 0, width * scalingFactor, height * scalingFactor);
    //         //         }
    //         //
    //         //         // Downscale if needed
    //         //         if (scalingFactor !== 1) {
    //         //             const tempCanvas = document.createElement("canvas");
    //         //             tempCanvas.width = width;
    //         //             tempCanvas.height = height;
    //         //             const tempCtx = tempCanvas.getContext("2d");
    //         //             if (tempCtx) {
    //         //                 tempCtx.drawImage(canvas, 0, 0, width, height);
    //         //             }
    //         //             resolve(tempCanvas.toDataURL("image/png"));
    //         //         } else {
    //         //             resolve(canvas.toDataURL("image/png"));
    //         //         }
    //         //     };
    //         //
    //         //     img.onerror = function () {
    //         //         reject("Failed to load image");
    //         //     }
    //         // }
    //     });
    // }

    async generateBitmap(printOptions: PrintOptions, width: number, height: number, front: boolean): Promise<string> {
        const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, text_size: number) => {
            ctx.globalCompositeOperation = "source-over";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.font = `bold ${text_size}px Verdana`;
            ctx.fillText(text.toUpperCase(), x, y);
        }

        const drawCoords = (ctx: CanvasRenderingContext2D, coords: string, x: number, y: number, text_size: number) => {
            ctx.globalCompositeOperation = "source-over";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.font = `${text_size}px Courier`;
            ctx.fillText(coords.toUpperCase(), x, y);
        }

        const formatCoordinates = (lon: number, lat: number) => {
            // Helper function to convert decimal degrees to DMS
            const decimalToDMS = (decimal: number) => {
                const degrees = Math.floor(decimal);
                const minutesDecimal = (decimal - degrees) * 60;
                const minutes = Math.floor(minutesDecimal);
                const seconds = Math.floor((minutesDecimal - minutes) * 60);
                return `${Math.abs(degrees)}° ${minutes}' ${seconds}''`;
            }

            // Determine the cardinal directions
            const latCardinal = lat >= 0 ? 'N' : 'S';
            const longCardinal = lon >= 0 ? 'E' : 'W';

            // Convert decimal degrees to DMS
            const latDMS = decimalToDMS(lat);
            const longDMS = decimalToDMS(lon);

            // Format the string
            return `${Math.abs(lat).toFixed(3)}° ${latCardinal}   ${Math.abs(lon).toFixed(3)}° ${longCardinal}`;
        }



        // higher scaling means the generated image will be look better
        // (but will be the same size)
        let scalingFactor = 2;

        if (printOptions.text == "null") {
            printOptions.text = "";
        }

        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            canvas.width = width * scalingFactor; // Higher resolution
            canvas.height = height * scalingFactor; // Higher resolution
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("Failed to get canvas context");
                return;
            }

            // ctx.fillStyle = "#000000";
            // ctx.fillRect(0, 0, canvas.width, canvas.height);


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

                const text_scale = SHITTY_SCALE;
                const outer_padding = 40 * text_scale;
                const inner_padding = 40 * text_scale;
                const text_size = 55 * text_scale;
                const coord_text_size = 45 * text_scale


                let bottomHeight = 0;

                ctx.globalCompositeOperation = "source-over";

                if (printOptions.text && printOptions.coordinates) {
                    bottomHeight = outer_padding * 2 + inner_padding + text_size + coord_text_size;
                    ctx.fillStyle = "black"
                    ctx.fillRect(0, height * scalingFactor - bottomHeight*scalingFactor, width * scalingFactor, bottomHeight*scalingFactor);

                    if (front) {
                        if (!printOptions.center) {
                            console.log("need to set center!");
                            return;
                        }
                        drawText(ctx, printOptions.text, width * scalingFactor / 2, height * scalingFactor - (outer_padding + inner_padding + coord_text_size) * scalingFactor, text_size * scalingFactor);
                        drawCoords(ctx, formatCoordinates(printOptions.center[0], printOptions.center[1]), width * scalingFactor / 2, height * scalingFactor - (outer_padding * 1.5) * scalingFactor, coord_text_size * scalingFactor);
                    }
                } else if (printOptions.text) {
                    bottomHeight = outer_padding * 2 + text_size;
                    ctx.fillStyle = "black"
                    ctx.fillRect(0, height * scalingFactor - bottomHeight*scalingFactor, width * scalingFactor, bottomHeight*scalingFactor);
                    if (front) {
                        drawText(ctx, printOptions.text, width * scalingFactor / 2, height * scalingFactor - (bottomHeight / 2 - text_size / 4) * scalingFactor, text_size * scalingFactor);
                    }
                } else if (printOptions.coordinates) {
                    bottomHeight = outer_padding * 2 + coord_text_size;
                    ctx.fillStyle = "black"
                    ctx.fillRect(0, height * scalingFactor - bottomHeight*scalingFactor, width * scalingFactor, bottomHeight*scalingFactor);
                    if (front) {
                        if (!printOptions.center) {
                            console.log("need to set center!");
                            return;
                        }

                        drawCoords(ctx, formatCoordinates(printOptions.center[0], printOptions.center[1]), width * scalingFactor / 2, height * scalingFactor - (bottomHeight / 2 - coord_text_size / 4) * scalingFactor, coord_text_size * scalingFactor);
                    }
                } else {
                    // no bar at the bottom
                }

                ctx.globalCompositeOperation = 'destination-over'; // This sets new drawings behind existing content
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, width * scalingFactor, height * scalingFactor); // Fill the canvas with black

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
            }

        });
    }

    async generatePrint(printOptions: PrintOptions, front: boolean): Promise<string> {
        this.updateStyle(printOptions);
        return await this.generateBitmap(printOptions, this.render_width, this.render_height, front);
    }

}