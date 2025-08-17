// App.js
import React, { useEffect, useMemo, useState } from 'react';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import LoginModal from './LoginModal';


// 👉 Put your Clarifai API key here
const CLARIFAI_API_KEY = '69060d7da28e4391986f1e97df36cf03';

function App() {
  // ===== App State =====
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [user, setUser] = useState(null);

  // Auth modal + fields
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Checkout fields
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  // UI/UX
  const [darkMode, setDarkMode] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [location, setLocation] = useState('your area');

  // Image scan
  const [scannedImage, setScannedImage] = useState(null);

  // Replacement form
  const [showReplacementForm, setShowReplacementForm] = useState(false);
  const [replacementOrderId, setReplacementOrderId] = useState('');
  const [replacementReason, setReplacementReason] = useState('');

  // Search / Filters / Sorting
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default'); // default | lowToHigh | highToLow | newest | popular

  // AI personalization
  const [prefs, setPrefs] = useState(null); // {categoryCount:{}, brandCount:{}}

  // ===== Sample Catalog (you can replace with your API/DB) =====
  const sampleProducts = [
    // Electronics
    { id: 1, name: 'Samsung Galaxy S21', category: 'Electronics', price: 699, image: '/samsung.png.avif', rating: 4.5 },
    { id: 2, name: 'Sony WH-1000XM4', category: 'Electronics', price: 299, image: 'OPAC.jpg', rating: 4.7 },
    { id: 3, name: 'iPad Pro', category: 'Electronics', price: 999, image: 'OIP.webp', rating: 4.6 },
    { id: 4, name: 'MacBook Air', category: 'Electronics', price: 1299, image: 'opl.jpg', rating: 4.8 },
    { id: 5, name: 'Dell XPS 13', category: 'Electronics', price: 1099, image: 'a.jpg', rating: 4.4 },
    { id: 6, name: 'Canon EOS 1500D', category: 'Electronics', price: 549, image: 'b.webp', rating: 4.3 },
    { id: 7, name: 'Bose SoundLink', category: 'Electronics', price: 199, image: 'c.jpg', rating: 4.2 },
    { id: 8, name: 'Fitbit Versa 3', category: 'Electronics', price: 229, image: 'fitbit-versa-3.png', rating: 4.1 },
    { id: 9, name: 'Logitech MX Master 3', category: 'Electronics', price: 99, image: 'download.webp', rating: 4.6 },
    { id: 10, name: 'Apple AirPods Pro', category: 'Electronics', price: 249, image: 'airpodsmirror.jpg', rating: 4.7 },

    // Clothing
    { id: 11, name: "Levi's Denim Jacket", category: 'Clothing', price: 59, image: '3115ac46f729461192db3e959330922e.webp', rating: 4.0 },
    { id: 12, name: 'Nike Running Shoes', category: 'Clothing', price: 89, image: 'Nike-Running-Shoes.webp', rating: 4.3 },
    { id: 13, name: 'Adidas Hoodie', category: 'Clothing', price: 70, image: 'Fit-Hoodie.avif', rating: 4.1 },
    { id: 14, name: 'Puma Track Pants', category: 'Clothing', price: 45, image: 'Pants.avif', rating: 4.2 },
    { id: 15, name: 'Zara T-Shirt', category: 'Clothing', price: 30, image: 'zara.webp', rating: 3.9 },
    { id: 16, name: 'H&M Shorts', category: 'Clothing', price: 25, image: 'R.jpg', rating: 3.8 },
    { id: 17, name: 'Uniqlo Jacket', category: 'Clothing', price: 80, image: 'uniqlo-black.jpg', rating: 4.2 },
    { id: 18, name: 'Under Armour Tee', category: 'Clothing', price: 28, image: 'under-armour.jpg', rating: 4.0 },
    { id: 19, name: 'GAP Jeans', category: 'Clothing', price: 55, image: 'K12401s5.jpg', rating: 4.1 },
    { id: 20, name: 'Reebok Cap', category: 'Clothing', price: 20, image: 'reebok.webp', rating: 3.7 },

    // Watches
    { id: 21, name: 'Apple Watch Series 8', category: 'Watches', price: 399, image: 'Apple-Watch-Series-8.jpg', rating: 4.7 },
    { id: 22, name: 'Casio G-Shock', category: 'Watches', price: 150, image: 'casio_g_shock.webp', rating: 4.4 },
    { id: 23, name: 'Fossil Gen 6', category: 'Watches', price: 299, image: 'Fossil-Gen-6-series.jpg', rating: 4.2 },
    { id: 24, name: 'Garmin Instinct', category: 'Watches', price: 330, image: 'o12822182.webp', rating: 4.3 },
    { id: 25, name: 'Fitbit Charge 5', category: 'Watches', price: 179, image: 'uAgSmtX6zRGmnAdqunEzwH.jpg', rating: 4.1 },
    { id: 26, name: 'Samsung Galaxy Watch 5', category: 'Watches', price: 320, image: 'Samsung-Galaxy-Watch-5-Watch-5-Pro.jpg', rating: 4.5 },
    { id: 27, name: 'Noise ColorFit Ultra', category: 'Watches', price: 60, image: '4-2.jpg', rating: 3.9 },
    { id: 28, name: 'Boat Watch Xtend', category: 'Watches', price: 55, image: 'boAt-Xtend-Review.webp', rating: 3.8 },
    { id: 29, name: 'Titan Edge', category: 'Watches', price: 220, image: 'titan.jpg', rating: 4.2 },
    { id: 30, name: 'Timex Weekender', category: 'Watches', price: 90, image: '91foOZVt6PL._UY879_.jpg', rating: 3.9 },

    // Home Appliances
    { id: 31, name: 'LG Smart Refrigerator', category: 'Home Appliances', price: 1200, image: '1044x1334_new3.avif', rating: 4.4 },
    { id: 32, name: 'IFB Washing Machine', category: 'Home Appliances', price: 699, image: '61giwByCePL._SL1386_.jpg', rating: 4.1 },
    { id: 33, name: 'Samsung Microwave Oven', category: 'Home Appliances', price: 250, image: '81f4FWRHHaL.jpg', rating: 4.2 },
    { id: 34, name: 'Dyson Vacuum Cleaner', category: 'Home Appliances', price: 499, image: 'Category_Page_Range_Hero-Barrels.jpg', rating: 4.6 },
    { id: 35, name: 'Philips Air Fryer', category: 'Home Appliances', price: 150, image: 'jkp.jpg', rating: 4.0 },
    { id: 36, name: 'Prestige Mixer Grinder', category: 'Home Appliances', price: 85, image: 'ipo.jpg', rating: 3.9 },
    { id: 37, name: 'Orient Ceiling Fan', category: 'Home Appliances', price: 60, image: 'rdbuB6Vkl3.webp', rating: 3.8 },
    { id: 38, name: 'Whirlpool AC 1.5T', category: 'Home Appliances', price: 450, image: 'air.jpg', rating: 4.1 },
    { id: 39, name: 'Panasonic Water Purifier', category: 'Home Appliances', price: 120, image: 'water.jpg', rating: 4.0 },
    { id: 40, name: 'Havells Geyser', category: 'Home Appliances', price: 160, image: 'havells-geyser-500x500.webp', rating: 3.9 }
  ];

  // ===== Init Products / Derive Brands =====
  useEffect(() => {
    const withBrands = sampleProducts.map(p => ({
      ...p,
      brand: p.brand || p.name.split(' ')[0]
    }));
    setProducts(withBrands);
  }, []); // initial mount only

  // ===== Location (best-effort) =====
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        // You can swap to your own geocoder; this is a demo call
        const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=db797275d55041a6aca960dd037b3258`);
        const data = await res.json();
        const components = data?.results?.[0]?.components || {};
        const city = components.city || components.town || components.village || components.state || 'your area';
        const postcode = components.postcode || '';
        setLocation(city);
        if (!pincode) setPincode(postcode);
      } catch {
        setLocation('your area');
      }
    }, () => setLocation('your area'));
  }, [pincode]);

  // ===== Helpers: Save/Load (supports guest via localStorage) =====
  const saveUserData = async (field, value) => {
    try {
      if (user?.uid) {
        await setDoc(doc(db, 'users', user.uid), { [field]: value }, { merge: true });
      } else {
        localStorage.setItem(`guest_${field}`, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Error saving ${field}:`, e);
    }
  };

  const loadUserData = async (field) => {
    try {
      if (user?.uid) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          return snap.data()[field] || [];
        }
      } else {
        const s = localStorage.getItem(`guest_${field}`);
        return s ? JSON.parse(s) : [];
      }
    } catch (e) {
      console.error(`Error loading ${field}:`, e);
    }
    return [];
  };

  // ===== Auth =====
  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setShowLogin(false);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setShowLogin(false);
    } catch (err) {
      alert('Google login failed: ' + err.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Keep guest data
      const guestCart = localStorage.getItem('guest_cart');
      const guestWishlist = localStorage.getItem('guest_wishlist');
      setCart(guestCart ? JSON.parse(guestCart) : []);
      setWishlist(guestWishlist ? JSON.parse(guestWishlist) : []);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // When user changes, hydrate cart/wishlist and prefs and orders
  useEffect(() => {
    (async () => {
      const loadedCart = await loadUserData('cart');
      const loadedWishlist = await loadUserData('wishlist');
      setCart(loadedCart);
      setWishlist(loadedWishlist);
      await loadPrefs(user?.uid);
      await loadOrderHistory();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ===== Orders =====
  const loadOrderHistory = async () => {
    if (!user?.uid) {
      setOrderHistory([]);
      return;
    }
    try {
      const ordersSnapshot = await getDocs(collection(db, 'users', user.uid, 'orders'));
      const history = ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrderHistory(history);
    } catch (err) {
      console.error('Error loading order history:', err);
    }
  };

  const placeOrder = async () => {
    if (!user?.uid || cart.length === 0) return alert('Please login and add items to cart.');
    if (!name.trim()) return alert('Please enter your name.');
    if (!pincode.trim()) return alert('Please enter your pin code.');
    if (!address.trim()) return alert('Please enter your delivery address.');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      items: cart,
      name,
      pincode,
      address,
      paymentMode,
      total,
      status: 'Processing',
      timestamp: Timestamp.now()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'orders'), order);
      setCart([]);
      await saveUserData('cart', []);
      alert('✅ Order placed successfully!');
      await loadOrderHistory();
    } catch (error) {
      console.error('❌ Order placement failed:', error);
      alert('Order failed. Try again.');
    }
  };

  // ===== Clarifai Image Scan -> updates search term =====
  const scanProductImage = async (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      setScannedImage(reader.result);
      try {
        const response = await fetch(
          'https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs',
          {
            method: 'POST',
            headers: {
              Authorization: `Key ${"69060d7da28e4391986f1e97df36cf03"}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: [{ data: { image: { base64 } } }],
            }),
          }
        );
        const result = await response.json();
        const concepts = result?.outputs?.[0]?.data?.concepts || [];
        if (concepts.length > 0) {
          const top = concepts[0].name;
          setSearch(top);
          alert(`🧠 Clarifai detected: ${top}`);
        } else {
          alert('No recognizable product found.');
        }
      } catch (error) {
        console.error('Image scan error:', error);
        alert('Image scan failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  // ===== AI Personalization =====
  const localKey = user?.uid ? `prefs-${user.uid}` : 'prefs-guest';

  const loadPrefs = async (uid) => {
    try {
      if (uid) {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        const loaded =
          data.prefs ||
          JSON.parse(localStorage.getItem(localKey)) ||
          { categoryCount: {}, brandCount: {} };
        setPrefs(loaded);
      } else {
        const loaded =
          JSON.parse(localStorage.getItem(localKey)) ||
          { categoryCount: {}, brandCount: {} };
        setPrefs(loaded);
      }
    } catch (e) {
      console.error('Load prefs error', e);
      setPrefs({ categoryCount: {}, brandCount: {} });
    }
  };

  const persistPrefs = async (next) => {
    setPrefs(next);
    localStorage.setItem(localKey, JSON.stringify(next));
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), { prefs: next }, { merge: true });
      } catch (e) {
        console.error('Save prefs error', e);
      }
    }
  };

  const trackPreference = (product, action = 'view') => {
    const weight = action === 'cart' ? 3 : action === 'wishlist' ? 2 : 1;
    const curr = prefs || { categoryCount: {}, brandCount: {} };
    const next = {
      categoryCount: {
        ...curr.categoryCount,
        [product.category]: (curr.categoryCount?.[product.category] || 0) + weight,
      },
      brandCount: {
        ...curr.brandCount,
        [product.brand]: (curr.brandCount?.[product.brand] || 0) + weight,
      },
    };
    persistPrefs(next);
  };

  // Initial guest prefs load
  useEffect(() => {
    loadPrefs(user?.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Cart/Wishlist actions (safe for guests & users) =====
  const addToCart = (product) => {
    const existing = cart.find((i) => i.id === product.id);
    let updated;
    if (existing) {
      updated = cart.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      updated = [...cart, { ...product, quantity: 1 }];
    }
    setCart(updated);
    saveUserData('cart', updated);
    trackPreference(product, 'cart');
  };

  const toggleWishlist = (product) => {
    let updated;
    if (wishlist.find((w) => w.id === product.id)) {
      updated = wishlist.filter((w) => w.id !== product.id);
    } else {
      updated = [...wishlist, product];
      trackPreference(product, 'wishlist');
    }
    setWishlist(updated);
    saveUserData('wishlist', updated);
  };

  // ===== Derived: Brands / Price range =====
  const allBrands = useMemo(() => {
    const setB = new Set((products || []).map((p) => p.brand));
    return Array.from(setB).sort();
  }, [products]);

  const priceRange = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    let min = Infinity, max = -Infinity;
    products.forEach((p) => {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    });
    return { min, max };
  }, [products]);

  useEffect(() => {
    setMinPrice(priceRange.min || 0);
    setMaxPrice(priceRange.max || 2000);
  }, [priceRange.min, priceRange.max]);

  // ===== Filtering + Sorting =====
  const baseFiltered = useMemo(() => {
    return (products || [])
      .filter((p) => (category === 'All' || p.category === category))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => p.price >= (Number(minPrice) || 0) && p.price <= (Number(maxPrice) || Infinity))
      .filter((p) => selectedBrands.length === 0 || selectedBrands.includes(p.brand))
      .filter((p) => (p.rating || 0) >= Number(minRating || 0));
  }, [products, category, search, minPrice, maxPrice, selectedBrands, minRating]);

  const sortedProducts = useMemo(() => {
    const arr = [...baseFiltered];
    if (sortBy === 'lowToHigh') arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'highToLow') arr.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') arr.sort((a, b) => b.id - a.id);
    else if (sortBy === 'popular') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return arr;
  }, [baseFiltered, sortBy]);

  // ===== AI Recommendations =====
  const scoredProducts = useMemo(() => {
    const cc = prefs?.categoryCount || {};
    const bc = prefs?.brandCount || {};
    return (sortedProducts || []).map((p) => ({
      product: p,
      score: (cc[p.category] || 0) * 2 + (bc[p.brand] || 0) + (p.rating || 0) * 0.2,
    }));
  }, [sortedProducts, prefs]);

  const recommended = useMemo(() => {
    const recs = [...scoredProducts]
      .sort((a, b) => b.score - a.score)
      .filter((x) => x.score > 0)
      .slice(0, 5)
      .map((x) => x.product);
    return recs;
  }, [scoredProducts]);

  const remainingAfterRecs = useMemo(() => {
    const recIds = new Set(recommended.map((r) => r.id));
    return sortedProducts.filter((p) => !recIds.has(p.id));
  }, [sortedProducts, recommended]);

  // ===== Styles =====
  const sidebarStyles = {
    container: {
      position: 'sticky',
      top: 20,
      alignSelf: 'flex-start',
      width: sidebarOpen ? 260 : 52,
      transition: 'width 260ms ease',
      backgroundColor: darkMode ? '#2c2c2c' : '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: 10,
      padding: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    toggleBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid #ccc',
      background: darkMode ? '#444' : '#fff',
      cursor: 'pointer',
      marginBottom: 10,
    },
    sectionTitle: {
      fontWeight: 700,
      margin: '10px 0 6px',
      color: darkMode ? '#eaeaea' : '#333',
    },
    input: { width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc' },
    chip: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: 999,
      border: '1px solid #ccc',
      margin: 4,
      cursor: 'pointer',
      background: '#fff',
      fontSize: 12,
    },
    brandBox: { maxHeight: 160, overflowY: 'auto', border: '1px dashed #ccc', borderRadius: 8, padding: 8 },
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: darkMode ? '#222' : 'white', color: darkMode ? 'white' : 'black', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>🛒 FastCart</h1>

      {/* Login */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {user ? (
          <div>
            <img src={user.photoURL || ''} alt={user.displayName || user.email} style={{ width: 40, borderRadius: '50%' }} />
            <p>👋 Welcome, <strong>{name || user.displayName || user.email}</strong></p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)}>Login</button>
        )}
        <LoginModal
          show={showLogin}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={setUser}
          onGoogleLogin={handleGoogleLogin}
          onEmailLogin={handleEmailLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
        />
      </div>

      {/* Location Offer */}
      <h4 style={{ textAlign: 'center', color: '#555' }}>🎁 Special offers for <strong>{location}</strong>!</h4>

      {/* Search + Upload */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <label htmlFor="image-upload" style={{ marginLeft: '10px', padding: '10px 14px', backgroundColor: '#eee', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ccc' }}>📷 Upload</label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { e.preventDefault(); if (e.target.files?.[0]) { scanProductImage(e.target.files[0]); } }}
        />
        {scannedImage && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h4>📷 Scanned Image:</h4>
            <img src={scannedImage} alt="Scanned" style={{ width: '300px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', marginTop: '10px' }} />
          </div>
        )}
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>Search with image or keywords</p>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Sidebar Filters */}
        <aside style={sidebarStyles.container}>
          <button style={sidebarStyles.toggleBtn} onClick={() => setSidebarOpen((s) => !s)}>
            {sidebarOpen ? '⬅️ Hide Filters' : '➡️'}
          </button>

          {sidebarOpen && (
            <div style={{ transition: 'opacity 240ms ease', opacity: sidebarOpen ? 1 : 0 }}>
              {/* Category */}
              <div>
                <div style={sidebarStyles.sectionTitle}>Category</div>
                {['All', 'Electronics', 'Clothing', 'Watches', 'Home Appliances'].map((cat) => (
                  <div key={cat}>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        style={{ marginRight: 6 }}
                      />
                      {cat}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div style={{ marginTop: 10 }}>
                <div style={sidebarStyles.sectionTitle}>Price</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    placeholder={`Min (${priceRange.min})`}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={sidebarStyles.input}
                  />
                  <input
                    type="number"
                    placeholder={`Max (${priceRange.max})`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={sidebarStyles.input}
                  />
                </div>
              </div>

              {/* Brand */}
              <div style={{ marginTop: 10 }}>
                <div style={sidebarStyles.sectionTitle}>Brand</div>
                <div style={sidebarStyles.brandBox}>
                  {allBrands.map((b) => (
                    <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBrands((prev) => [...prev, b]);
                          else setSelectedBrands((prev) => prev.filter((x) => x !== b));
                        }}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginTop: 10 }}>
                <div style={sidebarStyles.sectionTitle}>Minimum Rating</div>
                <div>
                  {[0, 3, 4, 4.5].map((r) => (
                    <span
                      key={r}
                      style={{ ...sidebarStyles.chip, background: Number(minRating) === r ? '#dbeafe' : '#fff' }}
                      onClick={() => setMinRating(r)}
                    >
                      {r === 0 ? 'All' : `${r}★ & up`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div style={{ marginTop: 10 }}>
                <div style={sidebarStyles.sectionTitle}>Sort By</div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...sidebarStyles.input }}>
                  <option value="default">Relevance</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Clear */}
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => {
                    setCategory('All');
                    setMinPrice(priceRange.min);
                    setMaxPrice(priceRange.max);
                    setSelectedBrands([]);
                    setMinRating(0);
                    setSortBy('default');
                    setSearch('');
                  }}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb', background: '#fff', cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main>
          {/* Cart + Wishlist Panel */}
          <div style={{
            position: 'fixed', top: 20, right: 20, width: 320,
            backgroundColor: darkMode ? '#333' : '#f9f9f9',
            padding: 15, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 999, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2>🛒 Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={{ marginBottom: 10 }}>
                    <strong>{item.name}</strong><br />₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                    <br />
                    <button onClick={() => {
                      const updated = cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                      setCart(updated);
                      saveUserData('cart', updated);
                    }}>+</button>
                    <button onClick={() => {
                      const updated = cart
                        .map((c) => (c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c))
                        .filter((c) => c.quantity > 0);
                      setCart(updated);
                      saveUserData('cart', updated);
                    }}>-</button>
                    <button onClick={() => {
                      const updated = cart.filter((c) => c.id !== item.id);
                      setCart(updated);
                      saveUserData('cart', updated);
                    }}>Remove</button>
                  </div>
                ))}
                <h3>Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</h3>
                <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                <input placeholder="Pin Code" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                <input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
                <button onClick={placeOrder}>Place Order</button>
              </>
            )}
            <hr style={{ margin: '15px 0' }} />
            <h2>💖 Wishlist</h2>
            {wishlist.length === 0 ? (
              <p>Your wishlist is empty.</p>
            ) : (
              wishlist.map((item) => (
                <div key={item.id} style={{ marginBottom: 10 }}>
                  {item.name} — ₹{item.price}
                  <br />
                  <button onClick={() => toggleWishlist(item)}>Remove</button>
                </div>
              ))
            )}
          </div>

          {/* Recommended */}
          {recommended.length > 0 && (
            <div style={{ marginTop: 10, marginRight: 360 }}>
              <h2>✨ Recommended for You</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {recommended.map((p) => (
                  <div key={p.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 6, backgroundColor: darkMode ? '#333' : '#fafafa' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: 4 }} onClick={() => trackPreference(p, 'view')} />
                    <h3>{p.name}</h3>
                    <div style={{ fontSize: 12, color: '#777' }}>{p.brand} • {p.category}</div>
                    <div>⭐ {p.rating?.toFixed(1) || '—'}</div>
                    <p>₹{p.price}</p>
                    <button onClick={() => addToCart(p)}>Add to Cart</button>
                    <button onClick={() => toggleWishlist(p)} style={{ marginLeft: 8 }}>
                      {wishlist.find((w) => w.id === p.id) ? '❤️ Remove' : '♡ Wishlist'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div style={{ marginTop: 20, marginRight: 360 }}>
            <h2>🛍️ Products</h2>
            {remainingAfterRecs.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {remainingAfterRecs.map((p) => (
                  <div key={p.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 6, backgroundColor: darkMode ? '#333' : '#fafafa' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: 4 }} onClick={() => trackPreference(p, 'view')} />
                    <h3>{p.name}</h3>
                    <div style={{ fontSize: 12, color: '#777' }}>{p.brand} • {p.category}</div>
                    <div>⭐ {p.rating?.toFixed(1) || '—'}</div>
                    <p>₹{p.price}</p>
                    <button onClick={() => addToCart(p)}>Add to Cart</button>
                    <button onClick={() => toggleWishlist(p)} style={{ marginLeft: 8 }}>
                      {wishlist.find((w) => w.id === p.id) ? '❤️ Remove from Wishlist' : '♡ Add to Wishlist'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Settings */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
        <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px 16px', borderRadius: '20px', backgroundColor: '#333', color: 'white', border: 'none' }}>
          ⚙️ Settings
        </button>
      </div>

      {showSettings && (
        <div style={{ position: 'fixed', bottom: 70, right: 20, width: 250, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <h4>⚙️ Settings</h4>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', marginBottom: 10 }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={() => setShowOrders(true)} style={{ width: '100%', marginBottom: 10 }}>
            📦 Order History
          </button>
          <button onClick={() => setShowReplacementForm(true)} style={{ width: '100%', marginBottom: 10 }}>
            🔁 Replacement
          </button>
          <button onClick={() => alert('Contact us at support@fastcart.com')} style={{ width: '100%', marginBottom: 10 }}>
            📞 Support
          </button>
          {user && <button onClick={logout} style={{ width: '100%' }}>🚪 Logout</button>}
        </div>
      )}

      {/* Orders Modal */}
      {user && showOrders && (
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)',
          backgroundColor: darkMode ? '#222' : 'white', padding: 20, borderRadius: 10,
          zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxHeight: '60vh', overflowY: 'auto', width: 420,
          color: darkMode ? 'white' : 'black'
        }}>
          <h3 style={{ marginBottom: 15 }}>📦 Your Orders</h3>
          {Array.isArray(orderHistory) && orderHistory.length === 0 ? (
            <p>No past orders yet.</p>
          ) : (
            <ul>
              {orderHistory.map((order) => (
                <li key={order.id} style={{ marginBottom: 16, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                  <strong>🆔 Order ID:</strong> {order.id}<br />
                  <strong>📅 Date:</strong> {order.timestamp?.toDate?.().toLocaleString()}<br />
                  <strong>📍 Address:</strong> {order.address}, {order.pincode}<br />
                  <strong>💰 Total:</strong> ₹{order.total}<br />
                  <strong>⚙️ Status:</strong> {order.status}<br />
                  <details>
                    <summary>🛍️ Items</summary>
                    <ul style={{ marginTop: 6 }}>
                      {(order.items || order.cart || []).map((item, idx) => (
                        <li key={idx}>{item.name} × {item.quantity} = ₹{item.price * item.quantity}</li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setShowOrders(false)} style={{ marginTop: 10 }}>Close</button>
        </div>
      )}

      {/* Replacement Form */}
      {showReplacementForm && (
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)',
          backgroundColor: 'white', padding: 20, borderRadius: 10, zIndex: 1001,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <h3>🔁 Replacement Request</h3>
          <p>Enter your order ID and reason:</p>
          <input
            placeholder="Order ID"
            value={replacementOrderId}
            onChange={(e) => setReplacementOrderId(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 6 }}
          />
          <input
            placeholder="Reason"
            value={replacementReason}
            onChange={(e) => setReplacementReason(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 6 }}
          />
          <button onClick={() => { alert('Replacement request submitted.'); setShowReplacementForm(false); }}>Submit</button>
          <button onClick={() => setShowReplacementForm(false)} style={{ marginLeft: 10 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
