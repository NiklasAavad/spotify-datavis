import './App.css'
import { Entrypoint } from './Entrypoint'
import { QueryClient, QueryClientProvider } from 'react-query';

function App() {
	const queryClient = new QueryClient();

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<Entrypoint />
			</QueryClientProvider>
		</>
	)
}

export default App
