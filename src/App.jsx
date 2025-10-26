import './App.css'
import { Outlet } from 'react-router-dom'
import BackgroundImage from './assets/images/background.png';

function App() {
  const appStyle = {
    container: {
      backgroundImage: `url(${BackgroundImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      minHeight: '100vh',
      color: 'white',
      position: 'relative',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
    }
  };

  return (
    <div style={appStyle.container}>
      <div style={appStyle.overlay}></div>
      <main style={appStyle.content}>
        <Outlet />
      </main>
    </div>
  )
}

export default App