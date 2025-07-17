// ... [imports remain the same]
import React, { useEffect, useState } from 'react';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoginModal from './LoginModal';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  // 🔧 Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showReplacementForm, setShowReplacementForm] = useState(false);
  

  
const sampleProducts = [
  // Electronics
  { id: 1, name: 'Samsung Galaxy S21', category: 'Electronics', price: 699, image: '/samsung.png.avif' },
  { id: 2, name: 'Sony WH-1000XM4', category: 'Electronics', price: 299, image: 'OPAC.jpg' },
  { id: 3, name: 'iPad Pro', category: 'Electronics', price: 999, image: 'OIP.webp' },
  { id: 4, name: 'MacBook Air', category: 'Electronics', price: 1299, image: 'opl.jpg' },
  { id: 5, name: 'Dell XPS 13', category: 'Electronics', price: 1099, image: 'a.jpg' },
  { id: 6, name: 'Canon EOS 1500D', category: 'Electronics', price: 549, image: 'b.webp' },
  { id: 7, name: 'Bose SoundLink', category: 'Electronics', price: 199, image: 'c.jpg' },
  { id: 8, name: 'Fitbit Versa 3', category: 'Electronics', price: 229, image: 'https://via.placeholder.com/200x150.png?text=Fitbit+Versa+3' },
  { id: 9, name: 'Logitech MX Master 3', category: 'Electronics', price: 99, image: 'https://via.placeholder.com/200x150.png?text=Logitech+MX+Master+3' },
  { id: 10, name: 'Apple AirPods Pro', category: 'Electronics', price: 249, image: 'https://via.placeholder.com/200x150.png?text=AirPods+Pro' },

  // Clothing
  { id: 11, name: "Levi's Denim Jacket", category: 'Clothing', price: 59, image: 'https://via.placeholder.com/200x150.png?text=Denim+Jacket' },
  { id: 12, name: 'Nike Running Shoes', category: 'Clothing', price: 89, image: 'https://via.placeholder.com/200x150.png?text=Nike+Shoes' },
  { id: 13, name: 'Adidas Hoodie', category: 'Clothing', price: 70, image: 'https://via.placeholder.com/200x150.png?text=Adidas+Hoodie' },
  { id: 14, name: 'Puma Track Pants', category: 'Clothing', price: 45, image: 'https://via.placeholder.com/200x150.png?text=Puma+Pants' },
  { id: 15, name: 'Zara T-Shirt', category: 'Clothing', price: 30, image: 'https://via.placeholder.com/200x150.png?text=Zara+Tee' },
  { id: 16, name: 'H&M Shorts', category: 'Clothing', price: 25, image: 'https://via.placeholder.com/200x150.png?text=H%26M+Shorts' },
  { id: 17, name: 'Uniqlo Jacket', category: 'Clothing', price: 80, image: 'https://via.placeholder.com/200x150.png?text=Uniqlo+Jacket' },
  { id: 18, name: 'Under Armour Tee', category: 'Clothing', price: 28, image: 'https://via.placeholder.com/200x150.png?text=Under+Armour' },
  { id: 19, name: 'GAP Jeans', category: 'Clothing', price: 55, image: 'https://via.placeholder.com/200x150.png?text=GAP+Jeans' },
  { id: 20, name: 'Reebok Cap', category: 'Clothing', price: 20, image: 'https://via.placeholder.com/200x150.png?text=Reebok+Cap' },

  // Watches
  { id: 21, name: 'Apple Watch Series 8', category: 'Watches', price: 399, image: 'https://via.placeholder.com/200x150.png?text=Apple+Watch+8' },
  { id: 22, name: 'Casio G-Shock', category: 'Watches', price: 150, image: 'https://via.placeholder.com/200x150.png?text=Casio+G-Shock' },
  { id: 23, name: 'Fossil Gen 6', category: 'Watches', price: 299, image: 'https://via.placeholder.com/200x150.png?text=Fossil+Gen+6' },
  { id: 24, name: 'Garmin Instinct', category: 'Watches', price: 330, image: 'https://via.placeholder.com/200x150.png?text=Garmin+Instinct' },
  { id: 25, name: 'Fitbit Charge 5', category: 'Watches', price: 179, image: 'https://via.placeholder.com/200x150.png?text=Fitbit+Charge+5' },
  { id: 26, name: 'Samsung Galaxy Watch 5', category: 'Watches', price: 320, image: 'https://via.placeholder.com/200x150.png?text=Galaxy+Watch+5' },
  { id: 27, name: 'Noise ColorFit Ultra', category: 'Watches', price: 60, image: 'https://via.placeholder.com/200x150.png?text=Noise+Ultra' },
  { id: 28, name: 'Boat Watch Xtend', category: 'Watches', price: 55, image: 'https://via.placeholder.com/200x150.png?text=Boat+Xtend' },
  { id: 29, name: 'Titan Edge', category: 'Watches', price: 220, image: 'https://via.placeholder.com/200x150.png?text=Titan+Edge' },
  { id: 30, name: 'Timex Weekender', category: 'Watches', price: 90, image: 'https://via.placeholder.com/200x150.png?text=Timex+Weekender' },

  // Home Appliances
  { id: 31, name: 'LG Smart Refrigerator', category: 'Home Appliances', price: 1200, image: 'https://via.placeholder.com/200x150.png?text=LG+Fridge' },
  { id: 32, name: 'IFB Washing Machine', category: 'Home Appliances', price: 699, image: 'https://via.placeholder.com/200x150.png?text=IFB+Washing+Machine' },
  { id: 33, name: 'Samsung Microwave Oven', category: 'Home Appliances', price: 250, image: 'https://via.placeholder.com/200x150.png?text=Samsung+Microwave' },
  { id: 34, name: 'Dyson Vacuum Cleaner', category: 'Home Appliances', price: 499, image: 'https://via.placeholder.com/200x150.png?text=Dyson+Vacuum' },
  { id: 35, name: 'Philips Air Fryer', category: 'Home Appliances', price: 150, image: 'https://via.placeholder.com/200x150.png?text=Philips+Air+Fryer' },
  { id: 36, name: 'Prestige Mixer Grinder', category: 'Home Appliances', price: 85, image: 'https://via.placeholder.com/200x150.png?text=Prestige+Mixer' },
  { id: 37, name: 'Orient Ceiling Fan', category: 'Home Appliances', price: 60, image: 'https://via.placeholder.com/200x150.png?text=Orient+Fan' },
  { id: 38, name: 'Whirlpool AC 1.5T', category: 'Home Appliances', price: 450, image: 'https://via.placeholder.com/200x150.png?text=Whirlpool+AC' },
  { id: 39, name: 'Panasonic Water Purifier', category: 'Home Appliances', price: 120, image: 'https://via.placeholder.com/200x150.png?text=Panasonic+Purifier' },
  { id: 40, name: 'Havells Geyser', category: 'Home Appliances', price: 160, image: 'https://via.placeholder.com/200x150.png?text=Havells+Geyser' }
];


  useEffect(() => {
    setProducts(sampleProducts);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=db797275d55041a6aca960dd037b3258`);
          const data = await res.json();
          const components = data.results[0].components;
          const city = components.city || components.town || components.village || components.state || '';
          const postcode = components.postcode || '';
          setLocation(city);
          setPincode(postcode);
        } catch {
          setLocation('your area');
        }
      }, () => setLocation('your area'));
    }
  }, []);

  const logout = () => {
    signOut(auth).then(() => setUser(null)).catch(console.error);
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setShowLogin(false);
      await fetchUserData(result.user.uid);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setShowLogin(false);
      await fetchUserData(result.user.uid);
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  };

  const fetchUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.cart) setCart(data.cart);
      if (data.wishlist) setWishlist(data.wishlist);
      if (data.name) setName(data.name);
      if (data.pincode) setPincode(data.pincode);
    }
  };

  const saveUserData = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
  };

  const placeOrder = () => {
    if (!user || cart.length === 0) return alert("Please login and add items to cart.");
    if (!name.trim()) return alert("Please enter your name.");
    if (!pincode.trim()) return alert("Please enter your pin code.");
    if (!address.trim()) return alert("Please enter your delivery address.");

    alert(`✅ Order placed successfully!\n\nName: ${name}\nPin Code: ${pincode}\nAddress: ${address}\nPayment Mode: ${paymentMode}`);
    setCart([]);
    saveUserData(user.uid, { cart: [], name, pincode });
  };

  const scanProductImage = async (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const response = await fetch('https://api.clarifai.com/v2/models/general-image-recognition/outputs', {
          method: 'POST',
          headers: {
            'Authorization': 'Key 53c0ff029e4841578fa5ce3e5f03f08e',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: [{ data: { image: { base64 } } }] }),
        });
        const result = await response.json();
        const concept = result.outputs?.[0]?.data?.concepts?.[0]?.name;
        if (concept) {
          setSearch(concept);
          alert(`🧠 Detected: ${concept}`);
        } else {
          alert('No product detected.');
        }
      } catch (error) {
        console.error('Scan Error:', error);
        alert('Image scan failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const addToCart = (product) => {
    if (!user) return alert("Please login to add items to your cart.");
    const existing = cart.find(item => item.id === product.id);
    let updatedCart;
    if (existing) {
      updatedCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(updatedCart);
    saveUserData(user.uid, { cart: updatedCart });
  };

  const toggleWishlist = (product) => {
    if (!user) return alert("Please login to use wishlist.");
    let updated;
    if (wishlist.find(item => item.id === product.id)) {
      updated = wishlist.filter(item => item.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    saveUserData(user.uid, { wishlist: updated });
  };

  const filteredProducts = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px', width: '300px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <label htmlFor="image-upload" style={{ marginLeft: '10px', padding: '10px 14px', backgroundColor: '#eee', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ccc' }}>📷 Upload</label>
        <input type="file" id="image-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && scanProductImage(e.target.files[0])} />
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>Search with image or keywords</p>
      </div>

      {/* Categories */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {['All', 'Electronics', 'Clothing', 'Watches', 'Home Appliances'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ margin: '0 6px', padding: '6px 12px', border: 'none', borderRadius: '4px', backgroundColor: category === cat ? '#007bff' : '#ddd', color: category === cat ? 'white' : 'black', cursor: 'pointer' }}>{cat}</button>
        ))}
      </div>

      {/* Product & Cart Section */}
      <div style={{ position: 'relative' }}>
  {/* 🛒 Cart and 💖 Wishlist in fixed top-right corner */}
<div style={{
  position: 'fixed',
  top: 20,
  right: 20,
  width: '320px',
  backgroundColor: darkMode ? '#333' : '#f9f9f9',
  padding: '15px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  zIndex: 999,
  maxHeight: '90vh',
  overflowY: 'auto'
}}>
  <h2>🛒 Cart</h2>
  {cart.length === 0 ? <p>Your cart is empty.</p> : (
    <>
      {cart.map(item => (
        <div key={item.id} style={{ marginBottom: '10px' }}>
          <strong>{item.name}</strong><br />
          ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}<br />
          <button onClick={() => addToCart(item)}>+</button>
          <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0))}>-</button>
          <button onClick={() => setCart(cart.filter(c => c.id !== item.id))}>Remove</button>
        </div>
      ))}
      <h3>Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</h3>
      <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
      <input placeholder="Pin Code" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
      <input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
      <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ width: '100%', marginBottom: '8px' }}>
        <option value="UPI">UPI</option>
        <option value="Card">Card</option>
        <option value="Cash on Delivery">Cash on Delivery</option>
      </select>
      <button onClick={placeOrder}>Place Order</button>
    </>
  )}

  <hr style={{ margin: '15px 0' }} />
  <h2>💖 Wishlist</h2>
  {wishlist.length === 0 ? <p>Your wishlist is empty.</p> : wishlist.map(item => (
    <div key={item.id} style={{ marginBottom: '10px' }}>
      {item.name} — ₹{item.price}<br />
      <button onClick={() => toggleWishlist(item)}>Remove</button>
    </div>
  ))}
</div>


  {/* 🛍️ Products */}
  <div style={{ marginTop: '20px' }}>
    <h2>🛍️ Products</h2>
    {filteredProducts.length === 0 ? (
      <p>No products found.</p>
    ) : (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.map(p => (
          <div key={p.id} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            borderRadius: '6px', 
            backgroundColor: darkMode ? '#333' : '#fafafa' 
          }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: '4px' }} />
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
            <button onClick={() => toggleWishlist(p)}>
              {wishlist.find(w => w.id === p.id) ? '❤️ Remove from Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


      {/* ⚙️ Settings Button */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
        <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px 16px', borderRadius: '20px', backgroundColor: '#333', color: 'white', border: 'none' }}>
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{ position: 'fixed', bottom: 70, right: 20, width: '250px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <h4>⚙️ Settings</h4>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', marginBottom: '10px' }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={() => setShowOrders(true)} style={{ width: '100%', marginBottom: '10px' }}>
            📦 Order History
          </button>
          <button onClick={() => setShowReplacementForm(true)} style={{ width: '100%', marginBottom: '10px' }}>
            🔁 Replacement
          </button>
          <button onClick={() => alert("Contact us at support@fastcart.com")} style={{ width: '100%', marginBottom: '10px' }}>
            📞 Support
          </button>
          {user && <button onClick={logout} style={{ width: '100%' }}>🚪 Logout</button>}
        </div>
      )}

      {/* Order Modal */}
      {showOrders && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', backgroundColor: 'white', padding: '20px', borderRadius: '10px', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <h3>📦 Your Orders</h3>
          <p>(This is a mock list. Integrate Firestore later.)</p>
          <ul>
            <li>Order #12345 – Delivered</li>
            <li>Order #12346 – In Transit</li>
          </ul>
          <button onClick={() => setShowOrders(false)}>Close</button>
        </div>
      )}

      {/* Replacement Form */}
      {showReplacementForm && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', backgroundColor: 'white', padding: '20px', borderRadius: '10px', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <h3>🔁 Replacement Request</h3>
          <p>Enter your order ID and reason:</p>
          <input placeholder="Order ID" style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
          <input placeholder="Reason" style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
          <button onClick={() => { alert('Replacement request submitted.'); setShowReplacementForm(false); }}>Submit</button>
          <button onClick={() => setShowReplacementForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;