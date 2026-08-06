# Product Dashboard (React Native / Expo)

A simple product dashboard app — **Product List** and **Product Details**
screens — with live API integration via plain `fetch`. No extra libraries,
no architecture layers: just screens calling an API file directly.

Data comes from [fakestoreapi.com](https://fakestoreapi.com) (free, no API key
needed), so it works immediately.

## Project structure

```
ProductDashboard/
├── App.js                       # Navigation setup (stack navigator)
├── screens/
│   ├── ProductListScreen.js     # List: search, category filter, pull-to-refresh
│   └── ProductDetailScreen.js   # Single product: image, description, quantity, add-to-cart
├── api/
│   └── productApi.js            # All fetch() calls live here
├── app.json                     # Expo app config
├── babel.config.js              # Required by Metro/Expo
└── package.json
```

## Run it

You need Node.js installed. From the `ProductDashboard` folder:

```bash
npm install
npx expo start
```

This starts the Expo dev server and shows a QR code in your terminal. From there:
- Scan the QR code with the **Expo Go** app on your phone (install it from the
  App Store / Play Store first) — easiest option
- Press `i` for the iOS Simulator (Mac only)
- Press `a` for an Android emulator

## How the API calls work

`api/productApi.js` exports three plain async functions built on `fetch`:

```js
fetchProducts(category)   // GET /products or /products/category/:category
fetchProductById(id)      // GET /products/:id
fetchCategories()         // GET /products/categories
```

Each screen calls these directly inside a `useEffect`, with its own
`loading` / `error` / data `useState`s — no shared client, no dependency
injection, no separate business-logic layer. This keeps the whole app in
5 files, which is the right size while there's one feature (products).

## Connecting your own API

Open `api/productApi.js` and change `BASE_URL` and the endpoint paths.
Expected response shapes:

**GET /products** → array of:
```json
{
  "id": 1,
  "title": "string",
  "price": 10.99,
  "description": "string",
  "category": "string",
  "image": "https://...",
  "rating": { "rate": 4.5, "count": 120 }
}
```

**GET /products/:id** → a single object of the same shape.

**GET /products/categories** → array of category name strings (used for the filter chips).

If your API's field names differ, adjust the JSX in `ProductListScreen.js` /
`ProductDetailScreen.js` where it reads `item.title`, `item.price`, etc.
