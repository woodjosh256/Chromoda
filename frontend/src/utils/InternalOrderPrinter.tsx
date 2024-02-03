import React, {useEffect, useRef, useState} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../constants";
import {PrintGenerator, PrintOptions} from "./PrintGenerator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const InternalOrderPrinter = () => {
    let print_input = useRef<HTMLInputElement | null>(null);
    let myImg = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false);

    const height = 6.375;
    const width = 8.625;

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

                const center_w = canvas.width / 2;
                const center_h = canvas.height / 2;
                // add 18px wide, 10px long white ticks at center of each edge
                ctx.fillStyle = 'red';
                const w = 18
                const l = 15
                ctx.fillRect(center_w - w / 2, canvas.height - l, w, l);
                ctx.fillStyle = 'white';
                ctx.fillRect(center_w - w / 2, 0, w, l);
                ctx.fillRect(canvas.width * 0.0425, center_h - w / 2, l, w);
                ctx.fillRect(canvas.width * .9575 - l, center_h - w / 2, l, w);

                // Convert the canvas back to a Base64 string
                const newBase64Image = canvas.toDataURL();
                resolve(newBase64Image);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image.'));
            };
        });
    };



    function getName(print_id: string) {
        // if this is ever committed and public.. i know this is terrible.
        const data = [
            {
                "name": "Anna",
                "id": "7697D371552E01B1"
            },
            {
                "name": "Zachary",
                "id": "D1D8528C5350C2BF"
            },
            {
                "name": "Alex",
                "id": "0BDB75022679011A"
            },
            {
                "name": "Joshua",
                "id": "83F142B2B0F7C6E8"
            },
            {
                "name": "Christopher",
                "id": "276EEF08555DE9DA"
            },
            {
                "name": "Laura",
                "id": "F1D8CD8DAFAFB3DF"
            },
            {
                "name": "Sarah",
                "id": "0B5A66A28B9280D4"
            },
            {
                "name": "Monica",
                "id": "64E2B7906DF1BE86"
            },
            {
                "name": "Maia",
                "id": "4216DE3B288AECCF"
            },
            {
                "name": "Andrew",
                "id": "7BADB331F2A684A2"
            },
            {
                "name": "Joey",
                "id": "FCEB1A5F563DE8EF"
            },
            {
                "name": "Christopher",
                "id": "AD1A0B85322CC5A3"
            },
            {
                "name": "Dave",
                "id": "765095B4130E825A"
            },
            {
                "name": "Haley",
                "id": "CDB963FB0B4EAA27"
            },
            {
                "name": "Max",
                "id": "2B5285BFF9FD6C2E"
            },
            {
                "name": "Steven",
                "id": "67C9817535679DF1"
            },
            {
                "name": "Steve",
                "id": "E60C28E13F3CB741"
            },
            {
                "name": "Joshua",
                "id": "B011CA5F4BBA006C"
            },
            {
                "name": "mv",
                "id": "8A0E0C236C49B02E"
            },
            {
                "name": "Doug",
                "id": "726A386060AAF811"
            },
            {
                "name": "Jim",
                "id": "E6AEC3D774846DB1"
            },
            {
                "name": "Deborah",
                "id": "A7C9C696ADF86C69"
            },
            {
                "name": "Chase",
                "id": "1FFBDF79E8D91A5F"
            },
            {
                "name": "Naomi",
                "id": "F081C392D72FAB57"
            },
            {
                "name": "Madison",
                "id": "81B0FE3D44E0CCE3"
            },
            {
                "name": "Stephanie",
                "id": "86A2A3E2F4725A9B"
            },
            {
                "name": "Michael",
                "id": "15EEFEC28494C1F9"
            },
            {
                "name": "Scott",
                "id": "5FA976B63B54B754"
            },
            {
                "name": "Adam",
                "id": "C5FC39AE6B002313"
            },
            {
                "name": "Alice",
                "id": "95B76959A0136691"
            },
            {
                "name": "Alice",
                "id": "6F4384174D17A15A"
            },
            {
                "name": "Shelby",
                "id": "371FCE9285326144"
            },
            {
                "name": "Jocelyn",
                "id": "19855C8EAC82D6EE"
            },
            {
                "name": "Gerty",
                "id": "05EA008A5AF41C22"
            },
            {
                "name": "Clark",
                "id": "E2858929545A2EF4"
            },
            {
                "name": "Mathieu",
                "id": "3A7BA2F22D009A75"
            },
            {
                "name": "Victoria",
                "id": "4EE5338320BBCFBF"
            },
            {
                "name": "Kristen",
                "id": "D09E950916C5D2AA"
            },
            {
                "name": "Deborah",
                "id": "29607230A71D63D4"
            },
            {
                "name": "Elie",
                "id": "F6C14FCF67ED0466"
            },
            {
                "name": "Lindsey",
                "id": "D719FF58E1F1812B"
            },
            {
                "name": "Robert",
                "id": "372781E2902DDF6D"
            },
            {
                "name": "Robert",
                "id": "8198D4B9283068C9"
            },
            {
                "name": "Allison",
                "id": "83E91FD5ABB4D825"
            },
            {
                "name": "Patrick",
                "id": "16E1BACA062E3D73"
            },
            {
                "name": "Tom",
                "id": "BFCF96CC4F40F526"
            },
            {
                "name": "Chris",
                "id": "D65E29AF2870694E"
            },
            {
                "name": "Andrea",
                "id": "E489A9A3DA8690C1"
            },
            {
                "name": "JEFF",
                "id": "E7A4683E3591F920"
            },
            {
                "name": "JEFF",
                "id": "F05DEC810EDC8725"
            },
            {
                "name": "Philip",
                "id": "C66A35B8A3117035"
            },
            {
                "name": "Ed",
                "id": "5E8E57B41F5D3553"
            },
            {
                "name": "Diet",
                "id": "A7F4D31B35F7D52B"
            },
            {
                "name": "Diet",
                "id": "DCAA0AE161537B97"
            },
            {
                "name": "KD",
                "id": "17900D622A6F1221"
            },
            {
                "name": "Jazzie",
                "id": "23E80B5BBF178004"
            },
            {
                "name": "Jason",
                "id": "91E0CF550273B708"
            },
            {
                "name": "Michael",
                "id": "C5A99C1ACDC23ED8"
            },
            {
                "name": "John",
                "id": "82172016293B98C5"
            },
            {
                "name": "Blake",
                "id": "5446CC153F3C0DC0"
            },
            {
                "name": "Erica",
                "id": "F289DBC46D2B2052"
            },
            {
                "name": "Jack",
                "id": "687AD0B801ACC949"
            },
            {
                "name": "Denise",
                "id": "5F0865A761C6E446"
            },
            {
                "name": "xyzMO",
                "id": "C26D405A54676C6E"
            },
            {
                "name": "Jeannine",
                "id": "99BBE192AB5E7131"
            },
            {
                "name": "Daniel",
                "id": "F81A995724A8E2DE"
            },
            {
                "name": "RANDY",
                "id": "428640F9091C2F4F"
            },
            {
                "name": "Maxx",
                "id": "854CB61000DA15C1"
            },
            {
                "name": "taizosugaya",
                "id": "DB81A5BD1BE9343C"
            },
            {
                "name": "taizosugaya",
                "id": "9A0B388D0ADEEE19"
            },
            {
                "name": "Jordan",
                "id": "C8D3A418E9B53296"
            },
            {
                "name": "Wilster",
                "id": "66B8EB0A5A143423"
            },
            {
                "name": "Vivian",
                "id": "7AC038677543D6EB"
            },
            {
                "name": "Elizabeth",
                "id": "86A965926552A33B"
            },
            {
                "name": "Gullaume",
                "id": "F720FDC2D7A68D61"
            },
            {
                "name": "Kevin",
                "id": "F1EA507DE5376EA1"
            },
            {
                "name": "Nick",
                "id": "86F7CA84C81E953A"
            },
            {
                "name": "Corentin",
                "id": "59A999180B8AD64E"
            },
            {
                "name": "Lana",
                "id": "A466D3FB9A3AC116"
            },
            {
                "name": "Thomas",
                "id": "3ABBD2E44E8FEA19"
            },
            {
                "name": "Michelle",
                "id": "D765773B80707217"
            },
            {
                "name": "Hunter",
                "id": "3630416D447D0EC1"
            },
            {
                "name": "Joselito",
                "id": "E53DCD452302FEE4"
            },
            {
                "name": "Heath",
                "id": "FA0E190F2AE5E88F"
            },
            {
                "name": "Heath",
                "id": "22835CD7AA2954B3"
            },
            {
                "name": "Orion",
                "id": "597B6130322BA5F0"
            },
            {
                "name": "Brendan",
                "id": "FFBD9912E1670866"
            },
            {
                "name": "Andy",
                "id": "59F6A38A4956D61B"
            },
            {
                "name": "David",
                "id": "542B0F76191E1FDD"
            },
            {
                "name": "Daniel",
                "id": "EEFB08A199A725B3"
            },
            {
                "name": "Heinz",
                "id": "A04D0D2449722908"
            },
            {
                "name": "David",
                "id": "748642A2A71F043A"
            },
            {
                "name": "Laura",
                "id": "3A612294962C0C24"
            },
            {
                "name": "Leanna",
                "id": "4CF742F2FADC6B5B"
            },
            {
                "name": "Leanna",
                "id": "4481D2408D420CB6"
            },
            {
                "name": "James",
                "id": "764BC4B49AAA5979"
            },
            {
                "name": "James",
                "id": "F176F11478FDF456"
            },
            {
                "name": "Dakota",
                "id": "7F476AE8C8E22FA6"
            },
            {
                "name": "Robyn",
                "id": "E089E0F48A2FA499"
            },
            {
                "name": "Robyn",
                "id": "F9A85D6072EFDF68"
            },
            {
                "name": "Nathan",
                "id": "84E5752DD8C1271E"
            },
            {
                "name": "Tommy",
                "id": "60E53E2FAD5258F3"
            },
            {
                "name": "Nam",
                "id": "7E8A1C4229DBCD48"
            },
            {
                "name": "Jon",
                "id": "786649B205465BD1"
            },
            {
                "name": "Tara",
                "id": "A57A7A6DF2B03B23"
            },
            {
                "name": "Natalia",
                "id": "CFBDC5CE5BE71806"
            },
            {
                "name": "Gabe",
                "id": "AB4C9C5DBFC0D23E"
            },
            {
                "name": "Bob",
                "id": "F13B4C523372BA8C"
            },
            {
                "name": "Katy",
                "id": "95CCDBA17DA18125"
            },
            {
                "name": "Marcin",
                "id": "46973AE7F0E22BD0"
            },
            {
                "name": "Randy",
                "id": "AE2A11E22406C41B"
            },
            {
                "name": "Nicole",
                "id": "E85DAFDE5F17980F"
            },
            {
                "name": "Whmm",
                "id": "E0C3DD30A684360C"
            },
            {
                "name": "M\u2019s",
                "id": "CC0C96F8B925884E"
            },
            {
                "name": "Alan",
                "id": "99CCF535BB5CB03A"
            },
            {
                "name": "Robert",
                "id": "AE36C44D30308A1D"
            },
            {
                "name": "James",
                "id": "BF338EE4F305FA7B"
            },
            {
                "name": "Julie",
                "id": "AE3E236C2FAD685C"
            },
            {
                "name": "Sean",
                "id": "CBC60A7B8DAE5D7E"
            },
            {
                "name": "Ryan",
                "id": "A1E4D9E9BDF5CB07"
            },
            {
                "name": "John",
                "id": "DC0C4682C5D51971"
            },
            {
                "name": "Ivan",
                "id": "1436A11942E779D3"
            },
            {
                "name": "Eric",
                "id": "42F0E63DDE575E01"
            },
            {
                "name": "Carol",
                "id": "231370E3A24966F9"
            },
            {
                "name": "Richie",
                "id": "9ADD0D4FC1142962"
            },
            {
                "name": "Timothy",
                "id": "4D4E2F668193F020"
            },
            {
                "name": "Sandy",
                "id": "A03A517DC737D8AA"
            },
            {
                "name": "Tyson",
                "id": "C661C010AE57F560"
            },
            {
                "name": "Blake",
                "id": "8946555DBC3A530A"
            },
            {
                "name": "Gene",
                "id": "3891E89C18270AAE"
            },
            {
                "name": "Yong",
                "id": "E50D76687649C085"
            },
            {
                "name": "Camie",
                "id": "BF9444C8C02136D1"
            },
            {
                "name": "Alex",
                "id": "795E8805EF23D39C"
            },
            {
                "name": "James",
                "id": "FEB34AD9F74A44FC"
            },
            {
                "name": "Tonguechewer",
                "id": "FFC9A087669FA015"
            },
            {
                "name": "Levi",
                "id": "E19D60DE8708A4DB"
            },
            {
                "name": "Sarah",
                "id": "D1FBF6393E6A05C4"
            },
            {
                "name": "Roxann",
                "id": "8B51FF8CA96FDBE5"
            },
            {
                "name": "Ricky",
                "id": "8E0ACAEEECB6A76A"
            },
            {
                "name": "Marisa",
                "id": "32DEE9930938846F"
            },
            {
                "name": "Zoe",
                "id": "7B7F692799E7738D"
            },
            {
                "name": "Gabrielle",
                "id": "31DF6CCE5B87DF27"
            },
            {
                "name": "Jacob",
                "id": "023630F5BB6CBD38"
            },
            {
                "name": "Beatriz",
                "id": "54EFB97087E8F38F"
            },
            {
                "name": "Beatriz",
                "id": "9C1E3A5CF5D261A7"
            },
            {
                "name": "Gina",
                "id": "D462B2B2445FE431"
            },
            {
                "name": "Denise",
                "id": "928644B7BD194051"
            },
            {
                "name": "Denise",
                "id": "E6C2A4D11993C3DD"
            },
            {
                "name": "Denise",
                "id": "759E40629AB93C9C"
            },
            {
                "name": "Kelly",
                "id": "854ADE13D29A8E09"
            },
            {
                "name": "William",
                "id": "A8E53E57438AFB8E"
            },
            {
                "name": "Daniel",
                "id": "268B3CB0954C6DFF"
            },
            {
                "name": "Daniel",
                "id": "F30CC923995B4BE6"
            },
            {
                "name": "Dale",
                "id": "C816151558BEE3F0"
            },
            {
                "name": "S",
                "id": "2DF63EC388519D1A"
            },
            {
                "name": "Douglas",
                "id": "59210B31E0D79FA4"
            },
            {
                "name": "Giacomo",
                "id": "566098CC05CB849A"
            },
            {
                "name": "Darren",
                "id": "27F2D99C4608AF41"
            },
            {
                "name": "Andres",
                "id": "65ECAF249DBE53CB"
            },
            {
                "name": "Dan",
                "id": "B1A2664E6FC2ECF1"
            },
            {
                "name": "Becky",
                "id": "C4A711D899B50AD8"
            },
            {
                "name": "Nick",
                "id": "1D08885955C09BD9"
            },
            {
                "name": "Jmefrancis86",
                "id": "96860B7590AE11D5"
            },
            {
                "name": "Raul",
                "id": "6FDBDB5155530AE0"
            }
        ]

        let name = "Unknown";
        for (let i = 0; i < data.length; i++) {
            if (data[i].id === print_id) {
                name = data[i].name;
                break;
            }
        }

        return name;
    }

    const createPdfAndPrint = async (print_id: string) => {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'in',
            format: 'letter'
        });

        // @ts-ignore
        const addImageToPDF = async (imgRef, pageNumber, name, ID) => {
            const canvas = await html2canvas(imgRef.current);

            // Convert the canvas back to a Base64 string
            const imgData = canvas.toDataURL('image/png');

            // Margins and dimensions (8.5x11 inches page with 0.25 inch margin)
            const margin = 0.25;

            const targetWidth = 9.58;
            const targetHeight = 6.387;
            const seamAllowance = 0.25;
            const shrinkage = - 0.02;

            // const width = Math.round(BAG_WIDTH / 140);
            // const height = Math.round(BAG_HEIGHT / 140);
            const width = (targetWidth + seamAllowance * 2) * (1 + shrinkage);
            const height = (targetHeight + seamAllowance * 2) * (1 + shrinkage);

            if (pageNumber > 1) pdf.addPage();
            pdf.addImage(imgData, 'PNG', -0.25, margin, width, height);

            pdf.setFontSize(10);
            pdf.text("Name: " + name + " ID: " + ID, 10.75, 8.25, {angle: 90});
        };

        await addImageToPDF(myImg, 1, getName(print_id), print_id);

        // Save PDF or open it in a new window
        // pdf.save('document.pdf'); // To save the PDF
        const pdfURL = pdf.output('bloburl');
        window.open(pdfURL);
    };


    function submitPrint(print_id: string) {
        if (loaded) return;
        setLoaded(true);
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
                                    }).then(() => createPdfAndPrint(print_id))
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