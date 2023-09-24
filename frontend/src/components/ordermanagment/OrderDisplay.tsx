import React, {useEffect, useState} from "react";
import {LoadingCircle} from "../common/LoadingCircle";
import {BAG_WIDTH} from "../../constants";
import {Modal} from "../common/Modal";

interface OrderDisplayProps {
    className?: string;
    done: () => void;
}

export const getOrderID = (): string => {
    const path = window.location.pathname;

    return path.substring(path.lastIndexOf('/') + 1);
};

async function getOrderState() {
    const orderId = getOrderID();

    if (orderId === "" || true) {
        return "invalid";
    }

    let params = {
        "order_id": orderId
    }


    let query: string = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
    }).join('&');

    let url = "https://v9d5jpgnsf.execute-api.us-east-1.amazonaws.com/dev/generateTopo" + "?" + query;

    console.log(url);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export default function OrderDisplay(props: OrderDisplayProps) {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [orderState, setOrderState] = useState<string>("none");

    useEffect(() => {
        getOrderState().then(state => {
            setLoaded(true);
            // order ID can be invalid, none, open or closed
            // invalid => Redirect to none
            // none => This is a demo!
            // closed => show bag and dont let them continue
            // open => tell them they can customize and allow them to continue
            let parsedOrderState = ""
            if (parsedOrderState === "invalid") {
                window.location.href = "https://www.acromoda.com/customizer-demo";
            }
            setOrderState(parsedOrderState);
        })
    }, []);

    return (
        <div className={`w-full h-full flex justify-center items-center absolute ${props.className}`}>
            {loaded ?
                <Modal>

                    <p>my modal</p>
                    <button onClick={props.done}>close</button>
                </Modal>
                : <LoadingCircle/>
            }
        </div>
    );
}