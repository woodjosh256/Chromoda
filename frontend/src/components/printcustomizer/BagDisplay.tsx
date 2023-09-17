import {useEffect, useState} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../../constants";

// could adjust these to be smaller but same aspect ratio
const render_width = BAG_WIDTH
const render_height = BAG_HEIGHT

export interface PrintOptions {
    color_a: string;
    color_b: string;
    gradient: boolean;
    secondary: boolean;
}

interface BagDisplayProps {
    svg: string | null;
    className?: string;
    printOptions: PrintOptions;
}

function parseSvg(svg: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(svg, "image/svg+xml");
}

function styleSvg(svgDoc: Document, printOptions: PrintOptions) {
    const polylines = svgDoc.querySelectorAll("polyline");
    polylines.forEach(polyline => {
        const classAttr = polyline.getAttribute("class") || "";

        if (classAttr.includes('secondary') && printOptions.secondary) {
            polyline.setAttribute("stroke", printOptions.color_b);
        } else {
            polyline.setAttribute("stroke", printOptions.color_a);
        }
    });

}

async function svgToBitmap(svgDoc: Document, printOptions: PrintOptions, width: number, height: number): Promise<string> {
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
        img.src = 'data:image/svg+xml,' + encodeURIComponent(svgDoc.documentElement.outerHTML);

        img.onload = function() {
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

        img.onerror = function() {
            reject("Failed to load image");
        }
    });
}

async function generatePrint(svgDoc: Document, printOptions: PrintOptions): Promise<string> {
    styleSvg(svgDoc, printOptions);
    return await svgToBitmap(svgDoc, printOptions, render_width, render_height);
}

function generateRender(printImageStr: string, printOptions: PrintOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        const imgWidth = 2796;
        const imgHeight = 1182

        const top = 149;
        const left = 708;
        const width = BAG_WIDTH;
        const height = BAG_HEIGHT;

        const canvas = document.createElement("canvas");
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext("2d");
        const printImage = new Image()
        printImage.src = printImageStr;

        printImage.onload = () => {
            if (!ctx) {
                reject("Failed to get canvas context");
                return;
            }

            ctx.fillStyle = "#1f1f1f";
            ctx.fillRect(0, 0, imgWidth, imgHeight);
            ctx?.drawImage(printImage, left, top, width, height);

            const baseImg = new Image();
            baseImg.src = "/BagOverlay.webp";
            baseImg.onload = () => {
                ctx?.drawImage(baseImg, 0, 0, imgWidth, imgHeight);
                resolve(canvas.toDataURL("image/png"));
            }
        }
    });
}

export function BagDisplay(props: BagDisplayProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    let svg : Document;

    useEffect(() => {
        if (!props.svg) return;
        svg = parseSvg(props.svg);
        generatePrint(svg, props.printOptions).then( (printImg: string) => {
            generateRender(printImg, props.printOptions).then( (renderImg: string) => {
                setPreviewImage(renderImg);
            });
        });
    }, [props.svg, props.printOptions]);

    return previewImage ? (
        <img src={previewImage} className={props.className} alt="Bag Preview"/>
    ) : null;
}