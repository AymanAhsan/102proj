import { useEffect, useState } from 'react'
import Book from './Book';

const api_url = 'https://openlibrary.org';

function Dashboard() {
  const [trendingBooks, setTrendingBooks] = useState([]);

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      const response = await fetch(`${api_url}/subjects/best_sellers.json`);
      const data = await response.json();
      setTrendingBooks(data.works || []);
    }
    fetchTrendingBooks();
  }, []);

  return (
    <div className='Dashboard'>
      <h1>Welcome to the Book Dashboard</h1>
      <p>Explore a vast collection of books and authors.</p>
      <div className='trending'>
        <h2>Trending Books</h2>
        {trendingBooks.length > 0 ? (
          <div className='trending-books'>
            {trendingBooks.slice(0, 10).map(book => (
              <Book 
                key={book.key} 
                book={book}
              />
            ))}
          </div>
        ) : (
          <p>No trending books available.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard;
