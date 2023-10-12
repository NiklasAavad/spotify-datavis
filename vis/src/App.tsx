import { Map } from './map'
import { countries } from './countries.ts'
import './App.css'

function App() {
	return (
		<>
			<Map countries={countries} />
		</>
	)
}

export default App
