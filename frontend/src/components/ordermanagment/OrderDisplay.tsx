import React, {useEffect, useState} from "react";
import {LoadingCircle} from "../common/LoadingCircle";
import {BAG_WIDTH} from "../../constants";
import {Modal} from "../common/Modal";
import {SelectorButton} from "../common/SelectorButton";

interface OrderDisplayProps {
    className?: string;
    done: () => void;
}

export const getPrintId = (): string => {
    const path = window.location.pathname;

    return path.substring(path.lastIndexOf('/') + 1);
};

async function getOrderState() {
    const printId = getPrintId();

    if (printId === "") {
        return "none";
    }

    let params = {
        "print_id": printId
    }

    let query: string = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
    }).join('&');

    let url = "https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/checkOrderState" + "?" + query;

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
            if (state === "none") {
                setOrderState("none");
                setLoaded(true);
                return;
            }
            let response = state.json();
            response.then(data => {
                console.log(data);
                let parsedOrderState = data["state"];
                // order ID can be invalid, none, open or closed
                // invalid => Redirect to none
                // none => This is a demo!
                // closed => show bag and dont let them continue
                // open => tell them they can customize and allow them to continue
                if (parsedOrderState === "invalid") {
                    window.location.href = "https://www.acromoda.com/customizer-demo";
                } else {
                    setOrderState(parsedOrderState);
                    setLoaded(true);
                }
            })
        })
    }, []);

    return (
        <div className={`w-full h-full flex justify-center items-center absolute ${props.className}`}>
            {loaded ?
                <Modal>
                    {orderState == "none" ?
                        <div className={"flex flex-col space-y-4"}>
                            <p>This is a demo of our product customizer. You can test out designs, but will not be able
                                to place an order without a unique link.</p>
                            <div className={"flex flex-row justify-center items-center"}>
                                <SelectorButton handler={props.done}>OK</SelectorButton>
                            </div>
                        </div>
                        : orderState == "closed" ?
                            <div className={"flex flex-col space-y-4"}>
                                <p>Your order has already been placed. Please contact us if you need to change
                                    anything.</p>
                            </div>
                            : orderState == "open" ?
                                <div className={"flex flex-col space-y-4"}>
                                    <p>This is the order form for your custom fanny pack. Here you can test out multiple
                                        designs, then confirm your order.</p>
                                    <div className={"flex flex-row justify-center items-center"}>
                                        <SelectorButton handler={props.done}>GET STARTED</SelectorButton>
                                    </div>
                                </div>
                                : <p>Something went wrong. Please refresh the page.</p>
                    }
                </Modal>
                : <LoadingCircle/>
            }
        </div>
    );
}