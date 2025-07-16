import { useEffect, useState } from 'react'
import ToggleButton from  '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './App.css'

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
              <div key={book.key} className='book-card'>
                <h3>{book.title}</h3>
                <p>{book.author_name?.join(', ')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No trending books available.</p>
        )}
      </div>
    </div>
  )
}

function Search() {
  
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchType, setSearchType] = useState('title'); // New state for search type
  const [selectedTags, setSelectedTags] = useState([]); // New state for selected tags
  const [tagInput, setTagInput] = useState(''); // New state for tag input
  const resultsPerPage = 40; // 4 columns × 10 rows

  const fetchBooks = async (query) => {
    // Modify the query based on search type
    let searchQuery = query;
    if (searchType === 'title') {
      searchQuery = `title:${query}`;
    } else if (searchType === 'author') {
      searchQuery = `author:${query}`;
    }
    
    // Add tag filtering to the query
    if (selectedTags.length > 0) {
      const tagQuery = selectedTags.map(tag => `subject:${tag}`).join(' AND ');
      searchQuery = query ? `${searchQuery} AND ${tagQuery}` : tagQuery;
    }
    
    const response = await fetch(`${api_url}/search.json?q=${searchQuery}`);
    const data = await response.json();
    setTotalResults(data.numFound || 0);
    return data.docs;
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = Math.min(5, totalPages); // Don't show more pages than exist
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = e.target.elements[0].value;
    // Allow search with just tags or just query or both
    if (query.trim() || selectedTags.length > 0) {
      const results = await fetchBooks(query);
      setSearchResults(results);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handleSearchTypeChange = (event, newSearchType) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTagAdd(e);
    }
  };

  return (
    <div className='Search'>
      <h1>Search for Books</h1>
      <ToggleButtonGroup
        value={searchType}
        exclusive
        onChange={handleSearchTypeChange}
        aria-label="search type"
      >
        <ToggleButton value="title">Title</ToggleButton>
        <ToggleButton value="author">Author</ToggleButton>
      </ToggleButtonGroup>
      
      <div className="tag-filter">
        <h3>Filter by Tags</h3>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Add tags (e.g., fiction, mystery, romance)"
          />
          <button type="button" onClick={handleTagAdd}>Add Tag</button>
        </div>
        
        {selectedTags.length > 0 && (
          <div className="selected-tags">
            <p>Selected tags:</p>
            <div className="tag-list">
              {selectedTags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleTagRemove(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder={`Enter book ${searchType} (optional if using tags)`} 
        />
        <button type="submit">Search</button>
      </form>

      {totalResults > 0 && (
        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(endIndex, totalResults)} of {totalResults} results
        </div>
      )}

      <div className='results'>
        {currentResults.map((book) => (
          <div key={book.key} className='book-card'>
            <h2>{book.title}</h2>
            <p>{book.author_name?.join(', ')}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

    </div>
  )
}

function About(){
  return (
    <div className='About'>
      <h1>About Us</h1>
      <p>This application allows you to search for books and authors from the Open Library API.</p>
    </div>
  )
}

function App() {
  
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <>
      <div className='navbar'>
        <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentPage('search')}>Search</button>
        <button onClick={() => setCurrentPage('about')}>About</button>
      </div>

      <div className='content'>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'search' && <Search />}
        {currentPage === 'about' && <About />}
      </div>
    </>
  )
}

export default App
