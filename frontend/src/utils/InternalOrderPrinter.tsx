import React, {useEffect, useRef} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../constants";
import {PrintGenerator, PrintOptions} from "./PrintGenerator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const InternalOrderPrinter = () => {
    let print_input = useRef<HTMLInputElement | null>(null);
    let myImg = useRef<HTMLImageElement | null>(null);

    async function queryMapAPI(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]): Promise<Response> {
        let params = {
            "tl_lon": topLeft[0],
            "tl_lat": topLeft[1],
            "tr_lon": topRight[0],
            "tr_lat": topRight[1],
            "bl_lon": bottomLeft[0],
            "bl_lat": bottomLeft[1],
            "br_lon": bottomRight[0],
            "br_lat": bottomRight[1],
            "width": BAG_WIDTH / 2,
            "lines": 25,
        }

        let query: string = Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
        }).join('&');

        let url = "https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/generateTopo" + "?" + query;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * Function to overlay an image with a black background
     * @param {string} base64Image - Base64 encoded image string
     * @returns {Promise<string>} - Promise that resolves with the new Base64 image string
     */
    const overlayWithBlackBackground = async (base64Image: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Step 1: Create a canvas element and a 2D context
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context.'));
                return;
            }

            // Create a new Image object
            const img = new Image();
            img.src = base64Image;

            // Step 2: Load the image onto canvas
            img.onload = () => {
                // Set the canvas dimensions to the image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Step 3: Draw a black background
                ctx.fillStyle = 'black'; // here
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Step 4: Draw the original image over the black background
                ctx.drawImage(img, 0, 0);

                // Convert the canvas back to a Base64 string
                const newBase64Image = canvas.toDataURL();
                resolve(newBase64Image);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image.'));
            };
        });
    };


    const createPdfAndPrint = async () => {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'in',
            format: 'letter'
        });

        // @ts-ignore
        const addImageToPDF = async (imgRef, pageNumber) => {
            const canvas = await html2canvas(imgRef.current);
            const imgData = canvas.toDataURL('image/png');

            // Margins and dimensions (8.5x11 inches page with 0.25 inch margin)
            const margin = 0.125;
            const width = Math.round(BAG_WIDTH / 140);
            const height = Math.round(BAG_HEIGHT / 140);

            if (pageNumber > 1) pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, margin, width, height);
        };

        await addImageToPDF(myImg, 1);

        // Save PDF or open it in a new window
        // pdf.save('document.pdf'); // To save the PDF
        const pdfURL = pdf.output('bloburl');
        window.open(pdfURL);
    };



    function submitPrint(print_id: string) {
        console.log("Requesting print " + print_id + "...");
        try {
            fetch("https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/getOrder?print_id=" + print_id)
                .then(response => response.json())
                .then(data => {
                        console.log(data);
                        queryMapAPI([Number(data.tl_lon), Number(data.tl_lat)],
                            [Number(data.tr_lon), Number(data.tr_lat)],
                            [Number(data.bl_lon), Number(data.bl_lat)],
                            [Number(data.br_lon), Number(data.br_lat)])
                            .then(query_response => query_response.json())
                            .then(query_data => {
                                console.log(query_data)
                                let svg = query_data["svg"];
                                let printOptions: PrintOptions = {
                                    color_a: data.color_a,
                                    color_b: data.color_b,
                                    secondary: data.secondary,
                                    gradient: data.gradient,
                                    locationColor: data.locationColor,
                                    locationIcon: Number(data.locationIcon),
                                }
                                if (data.location_x && data.location_y) {
                                    printOptions.location = [data.location_x, data.location_y];
                                }
                                console.log(printOptions);
                                let printGenerator = new PrintGenerator(svg, 3);
                                printGenerator.generatePrint(printOptions).then(print => overlayWithBlackBackground(print))
                                    .then(print => {
                                        if (myImg.current) {
                                            myImg.current.src = print;
                                        }
                                    }).then(() => createPdfAndPrint())
                            })
                            })
                .catch(error => {
                    console.log(error);
                });
            } catch (error) {
                console.log(error);
            }

    }

    useEffect(() => {

        const order_id = window.location.pathname.substring(1);

        submitPrint(order_id);
    }, []);

    return (
        <div>
            <h1>Loading...</h1>
            <img ref={myImg} src="" alt="Print"/>
        </div>
    );
}