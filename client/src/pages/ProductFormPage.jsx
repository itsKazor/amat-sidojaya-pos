import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProducts from '../hooks/useProducts.js';
import useCategories from '../hooks/useCategories.js';
import Button from '../components/ui/Button.jsx';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { addProduct, updateProduct, getProduct } = useProducts();
  const { categories, loading: loadingCats } = useCategories();

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vehicleType, setVehicleType] = useState('universal');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch product detail if edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        setLoading(true);
        const res = await getProduct(id);
        if (res.success) {
          const p = res.data;
          setName(p.name);
          setCategoryId(p.categoryId || '');
          setVehicleType(p.vehicleType || 'universal');
          setBrand(p.brand || '');
          setStock(p.stock);
          setMinStock(p.minStock);
          setPurchasePrice(p.purchasePrice);
          setSellingPrice(p.sellingPrice);
          setUnit(p.unit || 'pcs');
          setLocation(p.location || '');
        } else {
          setError(res.error || 'Gagal memuat detail produk');
        }
        setLoading(false);
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama produk wajib diisi');
      return;
    }
    if (!categoryId) {
      setError('Silakan pilih kategori produk');
      return;
    }
    if (purchasePrice < 0 || sellingPrice < 0) {
      setError('Harga tidak boleh bernilai negatif');
      return;
    }
    if (sellingPrice < purchasePrice) {
      setError('Harga jual disarankan tidak kurang dari harga beli');
    }

    setLoading(true);
    const productData = {
      name,
      categoryId: parseInt(categoryId),
      vehicleType,
      brand,
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      purchasePrice: parseInt(purchasePrice),
      sellingPrice: parseInt(sellingPrice),
      unit,
      location
    };

    let res;
    if (isEditMode) {
      res = await updateProduct(id, productData);
    } else {
      res = await addProduct(productData);
    }

    setLoading(false);
    if (res.success) {
      navigate('/products');
    } else {
      setError(res.error || 'Terjadi kesalahan saat menyimpan produk');
    }
  };

  return (
    <div className="product-form-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/products')} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isEditMode ? 'Ubah informasi detail produk sparepart.' : 'Tambahkan produk sparepart baru ke katalog.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          {isEditMode ? '✍️ Edit Produk' : '📦 Tambah Produk Baru'}
        </h3>

        {error && (
          <div className="error-alert" style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 'var(--spacing-lg)' }}>
          {/* Left Column */}
          <div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Nama Barang / Sparepart
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ban Luar IRC 80/90-14"
                className="modal-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Kategori
              </label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="modal-input"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Tipe Kendaraan
              </label>
              <select 
                value={vehicleType} 
                onChange={(e) => setVehicleType(e.target.value)}
                className="modal-input"
              >
                <option value="universal">Universal</option>
                <option value="motor">Motor</option>
                <option value="mobil">Mobil</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Merek Kendaraan / Pabrikan
              </label>
              <input 
                type="text" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Contoh: Honda, Yamaha, Toyota, Suzuki"
                className="modal-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Satuan Unit
              </label>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="modal-input"
              >
                <option value="pcs">pcs (Pieces)</option>
                <option value="set">set (Set)</option>
                <option value="liter">liter (Liter)</option>
                <option value="meter">meter (Meter)</option>
                <option value="box">box (Box)</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Stok Awal
              </label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="modal-input"
                disabled={isEditMode}
                style={{ opacity: isEditMode ? 0.6 : 1 }}
                required
              />
              {isEditMode && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  * Perubahan stok hanya bisa dilakukan melalui modul Opname atau Transaksi.
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Batas Minimum Stok (Alert)
              </label>
              <input 
                type="number" 
                value={minStock} 
                onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="modal-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Harga Beli (Rp)
              </label>
              <input 
                type="number" 
                value={purchasePrice} 
                onChange={(e) => setPurchasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Harga modal beli barang"
                className="modal-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Harga Jual (Rp)
              </label>
              <input 
                type="number" 
                value={sellingPrice} 
                onChange={(e) => setSellingPrice(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Harga jual ke pelanggan"
                className="modal-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Lokasi Rak / Penyimpanan
              </label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Rak A3, Lemari B"
                className="modal-input"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/products')} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
        </div>
      </form>
    </div>
  );
}
