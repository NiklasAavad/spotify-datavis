import { Map } from './map'
import './App.css'
import { countries } from './countries.ts'

function App() {
	return (
		<>
			<Map countries={countries} />
		</>
	)
}

export default App
