import { useState, useEffect } from 'react';
import PLACEHOLDER_BOOK_IMAGE from '../utils/placeholderImage.js';

interface BookModalProps {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BookDetails {
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

function BookModal({ book, isOpen, onClose }: BookModalProps) {
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      fetchBookDetails(book.key);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Add keyboard listener for Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup function to restore scrolling and remove event listener
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, book, onClose]);

  const fetchBookDetails = async (bookKey: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://openlibrary.org${bookKey}.json`);
      const data = await response.json();
      setBookDetails(data);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !book) return null;

  const coverUrl = book.cover_i 
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    : PLACEHOLDER_BOOK_IMAGE;

  const getDescription = () => {
    if (!bookDetails?.description) return 'No description available.';
    
    if (typeof bookDetails.description === 'string') {
      return bookDetails.description;
    }
    
    if (bookDetails.description.value) {
      return bookDetails.description.value;
    }
    
    return 'No description available.';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="modal-loading">Loading book details...</div>
        ) : (
          <div className="modal-body">
            <div className="modal-cover">
              <img 
                src={coverUrl} 
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_BOOK_IMAGE;
                }}
              />
            </div>
            
            <div className="modal-info">
              <h1>{book.title}</h1>
              
              {book.author_name && (
                <p className="modal-authors">
                  <strong>Author(s):</strong> {book.author_name.join(', ')}
                </p>
              )}
              
              {book.first_publish_year && (
                <p><strong>First Published:</strong> {book.first_publish_year}</p>
              )}
              
              {bookDetails?.publish_date && (
                <p><strong>Publication Date:</strong> {bookDetails.publish_date}</p>
              )}
              
              {book.publisher && book.publisher.length > 0 && (
                <p><strong>Publisher:</strong> {book.publisher.join(', ')}</p>
              )}
              
              {(book.number_of_pages_median || bookDetails?.number_of_pages) && (
                <p><strong>Pages:</strong> {book.number_of_pages_median || bookDetails?.number_of_pages}</p>
              )}
              
              {bookDetails?.physical_format && (
                <p><strong>Format:</strong> {bookDetails.physical_format}</p>
              )}
              
              {book.isbn && book.isbn.length > 0 && (
                <p><strong>ISBN:</strong> {book.isbn[0]}</p>
              )}
              
              <div className="modal-description">
                <strong>Description:</strong>
                <p>{getDescription()}</p>
              </div>
              
              {book.subject && book.subject.length > 0 && (
                <div className="modal-subjects">
                  <strong>Subjects:</strong>
                  <div className="subject-tags">
                    {book.subject.slice(0, 10).map((subject, index) => (
                      <span key={index} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookModal;
