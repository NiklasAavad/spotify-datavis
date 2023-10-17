import { Audio } from "react-loader-spinner";

import './Spinner.css'

type SpinnerProps = {
	isLoading: boolean;
}

export const Spinner: React.FC<SpinnerProps> = (props) => {
	return (
		<Audio
			height="100"
			width="100"
			color="#4fa94d"
			ariaLabel="audio-loading"
			wrapperStyle={{}}
			wrapperClass="spinner"
			visible={props.isLoading}
		/>
	);
}
