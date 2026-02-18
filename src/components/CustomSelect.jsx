import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    placeholder = "Selecciona una opción",
    icon = "expand_more",
    name,
    showIcon = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Map categories to icons
    const getIconForCategory = (name) => {
        const lowerName = name?.toLowerCase() || "";
        if (lowerName.includes("incendio") || lowerName.includes("fire")) return "local_fire_department";
        if (lowerName.includes("flora") || lowerName.includes("árbol") || lowerName.includes("tala")) return "nature";
        if (lowerName.includes("fauna") || lowerName.includes("animal") || lowerName.includes("trampa")) return "pets";
        if (lowerName.includes("infraestructura") || lowerName.includes("obra")) return "construction";
        if (lowerName.includes("basura") || lowerName.includes("pollu") || lowerName.includes("contam")) return "water_drop";
        if (lowerName.includes("seguridad") || lowerName.includes("evento")) return "notifications";
        return "label";
    };

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.label === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option.value } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-[#102216]/80 border ${isOpen ? 'border-[#13ec5b]' : 'border-[#13ec5b]/30'} rounded-xl px-4 py-3.5 text-sm cursor-pointer transition-all hover:bg-[#102216] group`}
            >
                <div className="flex items-center gap-3">
                    {showIcon && selectedOption && (
                        <span className="material-icons text-[#13ec5b]/70 text-lg">
                            {getIconForCategory(selectedOption.label)}
                        </span>
                    )}
                    <span className={selectedOption ? "text-white" : "text-slate-500"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <span className={`material-icons text-[#13ec5b] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                </span>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#102216] border border-[#13ec5b]/30 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                className={`flex items-center justify-between px-4 py-3.5 hover:bg-[#13ec5b]/10 cursor-pointer transition-colors group ${value === option.value ? 'bg-[#13ec5b]/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    {showIcon && (
                                        <span className={`material-icons text-lg ${value === option.value ? 'text-[#13ec5b]' : 'text-[#13ec5b]/50 group-hover:text-[#13ec5b]/80'}`}>
                                            {getIconForCategory(option.label)}
                                        </span>
                                    )}
                                    <span className={`text-sm ${value === option.value ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                                        {option.label}
                                    </span>
                                </div>
                                {value === option.value && (
                                    <div className="w-1.5 h-1.5 bg-[#13ec5b] rounded-full shadow-[0_0_8px_#13ec5b]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
