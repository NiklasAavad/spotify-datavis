import { createContext, useContext, useState } from "react";

type BrushSelection = [[number, number], [number, number]] | null;

type BrushContextType = {
	brushSelection: BrushSelection;
	setBrushSelection: React.Dispatch<React.SetStateAction<BrushSelection>>;
}

const BrushContext = createContext<BrushContextType | undefined>(undefined);

export const useBrushContext = () => {
	const context = useContext(BrushContext);

	if (!context) {
		throw new Error('useBrushContext must be used within a BrushProvider');
	}

	return context;
}

type Props = {
	children?: React.ReactNode;
}

export const BrushProvider: React.FC<Props> = ({ children }) => {
	const [brushSelection, setBrushSelection] = useState<BrushSelection>(null);

	return (
		<BrushContext.Provider value={{ brushSelection, setBrushSelection }}>
			{children}
		</BrushContext.Provider>
	)
}
