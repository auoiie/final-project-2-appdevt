import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div>
      <h1>You're IT 💅</h1>
      <main>
        <Outlet /> {/* Child pages will be rendered here */}
      </main>
    </div>
  )
}

export default App