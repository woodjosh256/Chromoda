// import React, {useRef} from "react";
// import {BAG_HEIGHT, BAG_WIDTH} from "../constants";
// import {PrintGenerator, PrintOptions} from "./PrintGenerator";
//
// export const InternalOrderPrinter = () => {
//     let print_input = useRef<HTMLInputElement | null>(null);
//     let myImg = useRef<HTMLImageElement | null>(null);
//
//     async function queryMapAPI(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]): Promise<Response> {
//         let params = {
//             "tl_lon": topLeft[0],
//             "tl_lat": topLeft[1],
//             "tr_lon": topRight[0],
//             "tr_lat": topRight[1],
//             "bl_lon": bottomLeft[0],
//             "bl_lat": bottomLeft[1],
//             "br_lon": bottomRight[0],
//             "br_lat": bottomRight[1],
//             "width": BAG_WIDTH / 2,
//             "lines": 25,
//         }
//
//         let query: string = Object.keys(params).map((key) => {
//             return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
//         }).join('&');
//
//         let url = "https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/generateTopo" + "?" + query;
//
//         return fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         })
//     }
//
//     /**
//      * Function to overlay an image with a black background
//      * @param {string} base64Image - Base64 encoded image string
//      * @returns {Promise<string>} - Promise that resolves with the new Base64 image string
//      */
//     const overlayWithBlackBackground = async (base64Image: string): Promise<string> => {
//         return new Promise((resolve, reject) => {
//             // Step 1: Create a canvas element and a 2D context
//             const canvas = document.createElement('canvas');
//             const ctx = canvas.getContext('2d');
//             if (!ctx) {
//                 reject(new Error('Failed to get canvas context.'));
//                 return;
//             }
//
//             // Create a new Image object
//             const img = new Image();
//             img.src = base64Image;
//
//             // Step 2: Load the image onto canvas
//             img.onload = () => {
//                 // Set the canvas dimensions to the image dimensions
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//
//                 // Step 3: Draw a black background
//                 ctx.fillStyle = 'black';
//                 ctx.fillRect(0, 0, canvas.width, canvas.height);
//
//                 // Step 4: Draw the original image over the black background
//                 ctx.drawImage(img, 0, 0);
//
//                 // Convert the canvas back to a Base64 string
//                 const newBase64Image = canvas.toDataURL();
//                 resolve(newBase64Image);
//             };
//
//             img.onerror = () => {
//                 reject(new Error('Failed to load image.'));
//             };
//         });
//     };
//
//
//     function submitPrint() {
//         if (print_input.current && print_input.current.value !== '') {
//             console.log("Requesting print " + print_input.current.value + "...");
//             let print_id = print_input.current.value;
//             fetch("https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/getOrder?print_id=" + print_id)
//                 .then(response => response.json())
//                 .then(data => {
//                         console.log(data);
//                         queryMapAPI([Number(data.tl_lon), Number(data.tl_lat)],
//                             [Number(data.tr_lon), Number(data.tr_lat)],
//                             [Number(data.bl_lon), Number(data.bl_lat)],
//                             [Number(data.br_lon), Number(data.br_lat)])
//                             .then(query_response => query_response.json())
//                             .then(query_data => {
//                                 console.log(query_data)
//                                 let svg = query_data["svg"];
//                                 let printOptions: PrintOptions = {
//                                     color_a: data.color_a,
//                                     color_b: data.color_b,
//                                     secondary: data.secondary,
//                                     gradient: data.gradient,
//                                     text: data.text,
//                                     coordinates: data.coordinates,
//                                 }
//
//                                 let printGenerator = new PrintGenerator(svg, 3);
//                                 printGenerator.generatePrint(printOptions).then(print => overlayWithBlackBackground(print))
//                                     .then(print => {
//                                         if (myImg.current) {
//                                             myImg.current.src = print;
//                                         }
//                                     })
//                             })
//                             })
//                 .catch(error => {
//                     console.log(error);
//                 });
//         } else {
//             alert("No order ID entered.")
//         }
//     }
//
//     return (
//         <div>
//             <h1>Internal Print Printer</h1>
//             <label className={''}>Print ID</label>
//             <input className='border-solid border-2 border-black mx-2' type="text" ref={print_input}/>
//             <button className='border-solid border-2 border-black px-2' type="submit" onClick={submitPrint}>Submit
//             </button>
//             <img ref={myImg} className={"cursor-pointer"}/>
//         </div>
//     );
// }
export {}