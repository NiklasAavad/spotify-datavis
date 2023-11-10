import { createContext, useContext, useState } from "react";

type BrushContextType = {
	brushedIds: Set<number> | undefined; // TODO consider using a set if performance is bad
	setBrushedIds: React.Dispatch<React.SetStateAction<Set<number> | undefined>>;
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
	const [brushSelection, setBrushSelection] = useState<Set<number> | undefined>(undefined);

	return (
		<BrushContext.Provider value={{ brushedIds: brushSelection, setBrushedIds: setBrushSelection }}>
			{children}
		</BrushContext.Provider>
	)
}
