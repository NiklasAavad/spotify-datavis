import { Map } from './map'
import { countries } from './countries.ts'
import './App.css'

function App() {
	return (
		<>
			<Map countries={countries as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
		</>
	)
}

export default App
