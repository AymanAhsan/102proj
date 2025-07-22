

import { useNavigate } from 'react-router-dom';
import PLACEHOLDER_BOOK_IMAGE from '../utils/placeholderImage.js';

interface BookProps {
  book: {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    subject?: string[];
    isbn?: string[];
    number_of_pages_median?: number;
    cover_i?: number;
  };
}

function Book({ book }: BookProps) {
  const navigate = useNavigate();
  
  const coverUrl = book.cover_i 
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : PLACEHOLDER_BOOK_IMAGE;

  const handleClick = () => {
    // Remove the leading slash and encode the book key for URL safety
    const cleanKey = book.key.startsWith('/') ? book.key.slice(1) : book.key;
    const encodedKey = encodeURIComponent(cleanKey);
    
    // Add cover_i as a query parameter to preserve cover info
    const searchParams = new URLSearchParams();
    if (book.cover_i) {
      searchParams.set('cover_i', book.cover_i.toString());
    }
    
    const url = `/book/${encodedKey}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    navigate(url);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover">
        <img 
          src={coverUrl} 
          alt={book.title}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_BOOK_IMAGE;
          }}
        />
      </div>
      <h2>{book.title}</h2>
      <p>{book.author_name?.join(', ') || 'Unknown Author'}</p>
      {book.first_publish_year && (
        <p className="publish-year">Published: {book.first_publish_year}</p>
      )}
    </div>
  );
}

export default Book;