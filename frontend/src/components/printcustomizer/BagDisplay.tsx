import {useEffect, useState} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../../constants";
import {PrintGenerator, PrintOptions} from "../../utils/PrintGenerator";





interface BagDisplayProps {
    className?: string;
    printGenerator: PrintGenerator;
    printOptions: PrintOptions;
}

function generateRender(printImageStr: string): Promise<string> {
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

    useEffect(() => {
        props.printGenerator.generatePrint(props.printOptions).then( (printImg: string) => {
            generateRender(printImg).then( (renderedImg: string) => {
                setPreviewImage(renderedImg);
            });
        });
    }, [props.printOptions]);

    return previewImage ? (
        <img src={previewImage} className={props.className} alt="Bag Preview"/>
    ) : null;
}