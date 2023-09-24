import React, {useRef, useState} from "react";
import {Modal} from "../common/Modal";
import {SelectorButton} from "../common/SelectorButton";
import {LoadingCircle} from "../common/LoadingCircle";

interface ConfirmLocationProps {
    locationConfirmed: () => Promise<boolean>;
    cancel: () => void;
}

export function ConfirmLocation(props: ConfirmLocationProps) {
    const [confirmed, setConfirmed] = useState<boolean>(false);
    const [problem, setProblem] = useState<boolean>(false);
    const [yesButtonDisabled, setYesButtonDisabled] = useState<boolean>(false);

    function confirm() {
        setYesButtonDisabled(true);

        props.locationConfirmed().then((confirmed: boolean) => {
            setConfirmed(true);
            if (!confirmed) {
                setProblem(true);
            }
        });
    }

    return (
        <Modal className={"flex flex-col items-center justify-center"}>
            {!confirmed ?
                <div className={`flex flex-col items-center justify-center`}>
                    {yesButtonDisabled ?
                        <LoadingCircle/>
                        :
                        <div className={'flex flex-col items-center justify-center'}>
                            <h3>Are you sure you want to confirm your design?</h3>
                            <div className={'flex flex-row items-center justify-center space-x-4 mt-4'}>
                                <SelectorButton handler={confirm}>Yes</SelectorButton>
                                <SelectorButton handler={props.cancel}>No</SelectorButton>
                            </div>
                        </div>
                    }
                </div>
                :
                (problem ?
                        <div>
                            <h3>There was a problem saving your design. Please try refreshing the page and contact us if
                                the issue persists.</h3>
                        </div>
                        :
                        <div>
                            <h3>Your design has been saved. You can safely close this page.</h3>
                        </div>
                )
            }
        </Modal>
    );
}