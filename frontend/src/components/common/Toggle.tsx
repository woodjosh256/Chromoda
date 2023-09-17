interface ToggleProps {
    className?: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

export function Toggle(props: ToggleProps) {
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${props.className}`}>
            <input type="checkbox"
                   checked={props.checked}
                   disabled={props.disabled}
                   onChange={props.onChange}
                   value=""
                   className="sr-only peer"/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <p className={`text-white ml-2`}>{props.label}</p>
        </label>
    );
}
