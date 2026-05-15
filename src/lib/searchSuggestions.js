const normalizeText = (value = '') => (
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
);

const tokenize = (value) => normalizeText(value).split(' ').filter(Boolean);

const levenshteinDistance = (left, right) => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
};

const similarity = (left, right) => {
  const longest = Math.max(left.length, right.length);
  if (!longest) return 1;
  return 1 - (levenshteinDistance(left, right) / longest);
};

const bestTokenScore = (queryToken, candidateTokens) => (
  candidateTokens.reduce((best, token) => {
    if (token === queryToken) return Math.max(best, 1);
    if (token.startsWith(queryToken)) return Math.max(best, 0.92);
    if (token.includes(queryToken)) return Math.max(best, 0.78);
    return Math.max(best, similarity(queryToken, token));
  }, 0)
);

const scoreCandidate = (query, candidate) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const terms = candidate.terms.filter(Boolean).join(' ');
  const haystack = normalizeText(terms);
  if (!haystack) return 0;

  const exactIndex = haystack.indexOf(normalizedQuery);
  if (exactIndex >= 0) {
    return 150 - Math.min(exactIndex, 40);
  }

  const queryTokens = tokenize(normalizedQuery);
  const candidateTokens = tokenize(haystack);
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const tokenScores = queryTokens.map((token) => bestTokenScore(token, candidateTokens));
  const average = tokenScores.reduce((sum, score) => sum + score, 0) / tokenScores.length;
  const allUseful = tokenScores.every((score) => score >= 0.5);
  return allUseful ? average * 100 : average * 72;
};

const exactMatch = (query, terms) => {
  const normalizedQuery = normalizeText(query);
  return terms.some((term) => normalizeText(term).includes(normalizedQuery));
};

const addUniqueFilter = (map, value, suggestion) => {
  if (!value) return;
  const key = normalizeText(`${suggestion.type}-${value}`);
  if (!key || map.has(key)) return;
  map.set(key, suggestion);
};

export const buildSearchSuggestions = ({ query, products = [], brands = [], limit = 8 }) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const filterSuggestions = new Map();
  products.forEach((product) => {
    addUniqueFilter(filterSuggestions, product.category, {
      id: `category-${product.category}`,
      type: 'Category',
      title: product.category,
      subtitle: 'Browse matching category',
      to: `/collections?category=${encodeURIComponent(product.category)}`,
      terms: [product.category, product.subcategory, product.occasion]
    });
    addUniqueFilter(filterSuggestions, product.subcategory, {
      id: `subcategory-${product.subcategory}`,
      type: 'Style',
      title: product.subcategory,
      subtitle: `${product.category} pieces`,
      to: `/collections?subcategory=${encodeURIComponent(product.subcategory)}`,
      terms: [product.subcategory, product.category, ...(product.tags || [])]
    });
    addUniqueFilter(filterSuggestions, product.occasion, {
      id: `occasion-${product.occasion}`,
      type: 'Occasion',
      title: product.occasion,
      subtitle: 'Filter by occasion',
      to: `/collections?occasion=${encodeURIComponent(product.occasion)}`,
      terms: [product.occasion, ...(product.vibes || [])]
    });
  });

  const pool = [
    ...products.map((product) => ({
      id: `product-${product.id}`,
      type: 'Product',
      title: product.name,
      subtitle: `${product.brand} · ${product.category} · ${product.color}`,
      image: product.image,
      meta: product.fitMatch ? `${product.fitMatch}% fit` : product.recommendedSize,
      to: `/product/${product.id}`,
      terms: [
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.color,
        product.fabric,
        product.occasion,
        product.collection,
        ...(product.tags || []),
        ...(product.vibes || [])
      ]
    })),
    ...brands.map((brand) => ({
      id: `brand-${brand.id}`,
      type: 'Brand',
      title: brand.name,
      subtitle: brand.specialty,
      image: brand.image,
      meta: brand.fitScore ? `${brand.fitScore}% brand fit` : `${brand.productCount || 0} pieces`,
      to: `/brands/${brand.id}`,
      terms: [brand.name, brand.specialty, ...(brand.tags || [])]
    })),
    ...filterSuggestions.values()
  ];

  const scored = pool
    .map((suggestion) => ({
      ...suggestion,
      score: scoreCandidate(trimmedQuery, suggestion),
      matchType: exactMatch(trimmedQuery, suggestion.terms) ? 'Exact match' : 'Fuzzy match'
    }))
    .filter((suggestion) => suggestion.score >= 48)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const priority = { Product: 3, Brand: 2, Category: 1, Style: 1, Occasion: 1 };
      return (priority[right.type] || 0) - (priority[left.type] || 0);
    });

  const searchAll = {
    id: `search-all-${trimmedQuery}`,
    type: 'Search',
    title: `Search "${trimmedQuery}"`,
    subtitle: 'Open full catalog results',
    meta: 'All matches',
    to: `/collections?search=${encodeURIComponent(trimmedQuery)}`,
    matchType: 'Search all'
  };

  return [...scored.slice(0, limit - 1), searchAll].slice(0, limit);
};
