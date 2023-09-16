import {useEffect, useState} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../../constants";

const render_width = 505
const render_height = 337

interface PrintOptions {
    color_a: string;
    color_b: string;
}

interface BagDisplayProps {
    svg: string;
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

        if (classAttr.includes('secondary')) {
            polyline.setAttribute("stroke", printOptions.color_b);
        } else {
            polyline.setAttribute("stroke", printOptions.color_a);
        }
    });

}

async function svgToBitmap(svgDoc: Document, width: number, height: number): Promise<string> {
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
    return await svgToBitmap(svgDoc, render_width, render_height);
}

function generateRender(printImageStr: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const imgWidth = 1080;
        const imgHeight = 871

        const top = 304;
        const left = 285;
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

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, imgWidth, imgHeight);
            ctx?.drawImage(printImage, left, top, width, height);

            const baseImg = new Image();
            baseImg.src = "/BagOverlay.png";
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
        svg = parseSvg(props.svg);
    }, [props.svg]);

    useEffect(() => {
        generatePrint(svg, props.printOptions).then( (printImg: string) => {
            generateRender(printImg).then( (renderImg: string) => {
                setPreviewImage(renderImg);
            });
        });
    }, [props.svg, props.printOptions]);

    return previewImage ? (
        <img src={previewImage} className={props.className} alt="Bag Preview"/>
    ) : null;
}