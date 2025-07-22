import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <div className='navbar'>
      <Link to="/">
        <button className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </button>
      </Link>
      <Link to="/search">
        <button className={location.pathname === '/search' ? 'active' : ''}>
          Search
        </button>
      </Link>
      <Link to="/about">
        <button className={location.pathname === '/about' ? 'active' : ''}>
          About
        </button>
      </Link>
    </div>
  )
}

export default Navigation;
