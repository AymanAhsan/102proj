import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PLACEHOLDER_BOOK_IMAGE from '../utils/placeholderImage.js';

const api_url = 'https://openlibrary.org';

interface BookDetails {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
  covers?: number[];
  description?: {
    value?: string;
    type?: string;
  } | string;
  subjects?: string[];
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  physical_format?: string;
  languages?: Array<{ key: string }>;
}

function BookDetails() {
  const { bookKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookKey) {
      fetchBookDetails(bookKey);
    }
  }, [bookKey]);

  const fetchBookDetails = async (key: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Decode the book key since it comes from URL params
      const decodedKey = decodeURIComponent(key);
      // Ensure the key starts with a slash for the API
      const bookKey = decodedKey.startsWith('/') ? decodedKey : `/${decodedKey}`;
      const response = await fetch(`${api_url}${bookKey}.json`);
      
      if (!response.ok) {
        throw new Error('Book not found');
      }
      
      const data = await response.json();
      console.log('Book details response:', data);
      console.log('Available cover info:', {
        covers: data.covers,
        cover_i: data.cover_i,
        isbn: data.isbn
      });
      setBook(data);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDescription = () => {
    if (!book?.description) return 'No description available.';
    
    if (typeof book.description === 'string') {
      return book.description;
    }
    
    if (book.description.value) {
      return book.description.value;
    }
    
    return 'No description available.';
  };

  const getCoverUrl = () => {
    // First try to get cover from URL query params (from search results)
    const coverIdFromUrl = searchParams.get('cover_i');
    if (coverIdFromUrl) {
      return `https://covers.openlibrary.org/b/id/${coverIdFromUrl}-L.jpg`;
    }
    
    // Try to get cover from covers array (from book details API)
    if (book?.covers && book.covers.length > 0) {
      return `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
    }
    
    // Try to get cover from cover_i (from search API)
    if (book?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    }
    
    // Try to get cover from ISBN
    if (book?.isbn && book.isbn.length > 0) {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-L.jpg`;
    }
    
    // Fall back to placeholder
    return PLACEHOLDER_BOOK_IMAGE;
  };

  const coverUrl = getCoverUrl();

  if (loading) {
    return (
      <div className="book-details-loading">
        <h1>Loading book details...</h1>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-details-error">
        <h1>Error</h1>
        <p>{error || 'Book not found'}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>
      
      <div className="book-details-content">
        <div className="book-details-cover">
          <img 
            src={coverUrl} 
            alt={book.title}
            onError={(e) => {
              console.log('Cover image failed to load:', coverUrl);
              e.currentTarget.src = PLACEHOLDER_BOOK_IMAGE;
            }}
          />
        </div>
        
        <div className="book-details-info">
          <h1>{book.title}</h1>
          
          {book.author_name && book.author_name.length > 0 && (
            <p className="book-authors">
              <strong>Author(s):</strong> {book.author_name.join(', ')}
            </p>
          )}
          
          {book.first_publish_year && (
            <p><strong>First Published:</strong> {book.first_publish_year}</p>
          )}
          
          {book.publish_date && (
            <p><strong>Publication Date:</strong> {book.publish_date}</p>
          )}
          
          {book.publisher && book.publisher.length > 0 && (
            <p><strong>Publisher:</strong> {book.publisher.join(', ')}</p>
          )}
          
          {(book.number_of_pages_median || book.number_of_pages) && (
            <p><strong>Pages:</strong> {book.number_of_pages_median || book.number_of_pages}</p>
          )}
          
          {book.physical_format && (
            <p><strong>Format:</strong> {book.physical_format}</p>
          )}
          
          {book.isbn && book.isbn.length > 0 && (
            <p><strong>ISBN:</strong> {book.isbn[0]}</p>
          )}
          
          <div className="book-description">
            <h3>Description</h3>
            <p>{getDescription()}</p>
          </div>
          
          {book.subject && book.subject.length > 0 && (
            <div className="book-subjects">
              <h3>Subjects</h3>
              <div className="subject-tags">
                {book.subject.slice(0, 15).map((subject, index) => (
                  <span key={index} className="subject-tag">{subject}</span>
                ))}
              </div>
            </div>
          )}
          
          {book.languages && book.languages.length > 0 && (
            <div className="book-languages">
              <h3>Languages</h3>
              <p>{book.languages.map(lang => lang.key.replace('/languages/', '')).join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
