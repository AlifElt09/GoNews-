// 🔑 Replace with your GNews API key
const API_KEY = 'YOUR_GNEWS_API_KEY';
const BASE_URL = 'https://gnews.io/api/v4';

const articlesContainer = document.getElementById('articles');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');

document.addEventListener('DOMContentLoaded', () => {
  fetchNews();
  setupEventListeners();
  applyStoredTheme();
});

function setupEventListeners() {
  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim();
    fetchNews(query || 'latest');
  }, 500));

  darkModeToggle.addEventListener('click', toggleDarkMode);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.contains('dark-mode');
  if (isDark) {
    body.classList.replace('dark-mode', 'light-mode');
    localStorage.setItem('theme', 'light');
    darkModeToggle.textContent = '🌙';
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    localStorage.setItem('theme', 'dark');
    darkModeToggle.textContent = '☀️';
  }
}

function applyStoredTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = savedTheme + '-mode';
  darkModeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

async function fetchNews(query = 'latest') {
  articlesContainer.innerHTML = '<div class="col-12 text-center"><p class="loading">Loading news...</p></div>';

  let url;
  if (query === 'latest') {
    url = `${BASE_URL}/top-headlines?token=${API_KEY}&lang=en&country=us`;
  } else {
    url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}&lang=en`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.articles?.length > 0) {
      renderArticles(data.articles.slice(0, 12));
    } else {
      articlesContainer.innerHTML = '<div class="col-12 text-center"><p class="error">No articles found.</p></div>';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    articlesContainer.innerHTML = '<div class="col-12 text-center"><p class="error">Failed to load news. Check your API key.</p></div>';
  }
}

function renderArticles(articles) {
  articlesContainer.innerHTML = '';
  articles.forEach(article => {
    const publishedAt = new Date(article.publishedAt).toLocaleDateString();

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-xl-3';

    col.innerHTML = `
      <div class="card h-100">
        <img src="${article.image || 'https://placehold.co/600x400?text=No+Image'}" 
             class="card-img-top" 
             alt="${article.title}"
             onerror="this.src='https://placehold.co/600x400?text=Image+Not+Found'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${article.title.length > 80 ? article.title.substring(0, 80) + '...' : article.title}</h5>
          <p class="card-text flex-grow-1">${article.description?.length > 100 ? article.description.substring(0, 100) + '...' : article.description || ''}</p>
          <div class="mt-auto">
            <small class="text-muted">${article.source.name} • ${publishedAt}</small><br>
            <a href="${article.url}" target="_blank" class="card-link mt-2">Read more →</a>
          </div>
        </div>
      </div>
    `;
    articlesContainer.appendChild(col);
  });
}