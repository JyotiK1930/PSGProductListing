import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getProducts, searchProducts } from '../api/productApi';

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function ProductListScreen() {
const [products, setProducts] = useState([]);
const [total, setTotal] = useState(0);
const [skip, setSkip] = useState(0);

const [query, setQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

const [loading, setLoading] = useState(true); // initial / search load
const [refreshing, setRefreshing] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const [error, setError] = useState(null);

const isFetchingRef = useRef(false);
const debounceTimer = useRef(null);

// Debounce the search input so we don't hit the API on every keystroke
useEffect(() => {
if (debounceTimer.current) clearTimeout(debounceTimer.current);
debounceTimer.current = setTimeout(() => {
setDebouncedQuery(query.trim());
}, SEARCH_DEBOUNCE_MS);
return () => clearTimeout(debounceTimer.current);
}, [query]);

const fetchPage = useCallback(
async ({ skipVal = 0, isRefresh = false, searchTerm = '' } = {}) => {
if (isFetchingRef.current) return;
isFetchingRef.current = true;

try {
if (isRefresh) setRefreshing(true);
else if (skipVal === 0) setLoading(true);
else setLoadingMore(true);

setError(null);

const result = searchTerm
? await searchProducts({ query: searchTerm, limit: PAGE_LIMIT, skip: skipVal })
: await getProducts({ limit: PAGE_LIMIT, skip: skipVal });

setProducts((prev) =>
skipVal === 0 ? result.products : [...prev, ...result.products]
);
setTotal(result.total);
setSkip(skipVal + result.products.length);
} catch (e) {
setError('Failed to load products. Pull down to try again.');
} finally {
setLoading(false);
setRefreshing(false);
setLoadingMore(false);
isFetchingRef.current = false;
}
},
[]
);

// Initial load
useEffect(() => {
fetchPage({ skipVal: 0, searchTerm: '' });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Re-fetch (from page 0) whenever the debounced search term changes
useEffect(() => {
fetchPage({ skipVal: 0, searchTerm: debouncedQuery });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedQuery]);

const onRefresh = useCallback(() => {
fetchPage({ skipVal: 0, isRefresh: true, searchTerm: debouncedQuery });
}, [fetchPage, debouncedQuery]);

const onEndReached = useCallback(() => {
if (loadingMore || loading || refreshing) return;
if (products.length >= total) return; // no more pages
fetchPage({ skipVal: skip, searchTerm: debouncedQuery });
}, [loadingMore, loading, refreshing, products.length, total, skip, debouncedQuery, fetchPage]);

const renderItem = useCallback(
({ item }) => (
<View style={styles.card}>
<Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
<View style={styles.cardBody}>
<Text style={styles.title} numberOfLines={2}>
{item.title}
</Text>
{item.price != null && <Text style={styles.price}>${item.price}</Text>}
</View>
</View>
),
[]
);

const keyExtractor = useCallback((item) => String(item.id), []);

const renderFooter = () => {
if (!loadingMore) return null;
return (
<View style={styles.footer}>
<ActivityIndicator size="small" color="#333" />
</View>
);
};

return (
<SafeAreaProvider>
<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
<StatusBar barStyle="dark-content" />

<View style={styles.header}>
<Text style={styles.headerTitle}>Products</Text>
<TextInput
style={styles.searchInput}
placeholder="Search products by name..."
placeholderTextColor="#999"
value={query}
onChangeText={setQuery}
autoCorrect={false}
clearButtonMode="while-editing"
/>
</View>

{loading && !refreshing ? (
<View style={styles.centered}>
<ActivityIndicator size="large" color="#333" />
</View>
) : error && products.length === 0 ? (
<View style={styles.centered}>
<Text style={styles.errorText}>{error}</Text>
</View>
) : (
<FlatList
data={products}
keyExtractor={keyExtractor}
renderItem={renderItem}
contentContainerStyle={styles.listContent}
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
onEndReached={onEndReached}
onEndReachedThreshold={0.4}
ListFooterComponent={renderFooter}
ListEmptyComponent={
<View style={styles.centered}>
<Text style={styles.emptyText}>No products found.</Text>
</View>
}
initialNumToRender={10}
maxToRenderPerBatch={10}
windowSize={7}
removeClippedSubviews
/>
)}
</SafeAreaView>
</SafeAreaProvider>
);
}

const styles = StyleSheet.create({
safeArea: { flex: 1, backgroundColor: '#fff' },
header: {
paddingHorizontal: 16,
paddingBottom: 12,
borderBottomWidth: StyleSheet.hairlineWidth,
borderBottomColor: '#e0e0e0',
},
headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10, marginTop: 8 },
searchInput: {
height: 42,
borderRadius: 10,
backgroundColor: '#f2f2f2',
paddingHorizontal: 14,
fontSize: 15,
},
listContent: { padding: 12, flexGrow: 1 },
card: {
flexDirection: 'row',
backgroundColor: '#fff',
borderRadius: 12,
marginBottom: 12,
padding: 10,
alignItems: 'center',
shadowColor: '#000',
shadowOpacity: 0.08,
shadowRadius: 6,
shadowOffset: { width: 0, height: 2 },
elevation: 2,
},
thumbnail: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
cardBody: { flex: 1, marginLeft: 12, justifyContent: 'center' },
title: { fontSize: 15, fontWeight: '600', color: '#222' },
price: { marginTop: 4, fontSize: 13, color: '#666' },
centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
errorText: { color: '#c0392b', textAlign: 'center', paddingHorizontal: 20 },
emptyText: { color: '#888' },
footer: { paddingVertical: 20 },
});

