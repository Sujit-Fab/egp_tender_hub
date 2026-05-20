import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Search, FileText, CheckCircle2, ChevronRight, Upload, Plus, Trash2, Download, ShoppingCart, Loader2, Database, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import defaultSorData from '../data/pwd_sor_2022_sample.json';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { findBestMatch } from 'string-similarity';
import localforage from 'localforage';
import { auth, db, collection, writeBatch, doc, serverTimestamp, getDocs, onSnapshot } from '../firebase';

interface SoRCopilotProps {
  lang: 'en' | 'bn';
  userData?: any;
}

type ZoneType = 'Dhaka_Mymensingh' | 'Chattogram_Sylhet' | 'Khulna_Barisal_Gopalgonj' | 'Rajshahi_Rangpur';

const zoneLabels: Record<ZoneType, string> = {
  Dhaka_Mymensingh: "Dhaka / Mymensingh",
  Chattogram_Sylhet: "Chattogram / Sylhet",
  Khulna_Barisal_Gopalgonj: "Khulna / Barisal / Gopalgonj",
  Rajshahi_Rangpur: "Rajshahi / Rangpur"
};

interface CartItem {
  id: string; // unique string to avoid duplicates for the same item
  item_no: string;
  description: string;
  unit: string;
  quantity: number;
  rates: Record<ZoneType, number>;
}

export const SoRCopilot: React.FC<SoRCopilotProps> = ({ lang, userData }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'estimate' | 'boq' | 'database'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [globalSorData, setGlobalSorData] = useState<any[]>([]);
  const [userSorData, setUserSorData] = useState<any[]>([]);
  const [sorData, setSorData] = useState<any[]>(defaultSorData);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  useEffect(() => {
    let unsubUser: (() => void) | undefined;
    let unsubGlobal: (() => void) | undefined;
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoadingDB(true);
        // Listen to global DB
        const globalSorRef = collection(db, 'globalSorItems');
        unsubGlobal = onSnapshot(globalSorRef, (snapshot) => {
          setGlobalSorData(snapshot.docs.map(doc => doc.data()));
        }, (err) => {
          console.error("Failed to load global DB", err);
          handleFirestoreError(err, OperationType.GET, 'globalSorItems');
        });

        try {
          const userSorRef = collection(db, 'users', user.uid, 'sorItems');
          unsubUser = onSnapshot(userSorRef, (snapshot) => {
            setUserSorData(snapshot.docs.map(doc => doc.data()));
            setIsLoadingDB(false);
          }, (err) => {
            console.error("Failed to load custom DB from Firestore", err);
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}/sorItems`);
            setIsLoadingDB(false);
          });
        } catch (err) {
          console.error("Error setting up Firestore listener", err);
          setIsLoadingDB(false);
        }
      } else {
        setGlobalSorData([]);
        setUserSorData([]);
        setIsLoadingDB(false);
        if (unsubGlobal) {
          unsubGlobal();
          unsubGlobal = undefined;
        }
        if (unsubUser) {
          unsubUser();
          unsubUser = undefined;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubGlobal) unsubGlobal();
      if (unsubUser) unsubUser();
    };
  }, []);

  useEffect(() => {
    const map = new Map<string, any>();
    // 1. Base PWD SoR
    defaultSorData.forEach(item => map.set(item.item_no, item));
    // 2. Global SoR Overrides/Additions
    globalSorData.forEach(item => map.set(item.item_no, item));
    // 3. User SoR Overrides/Additions
    userSorData.forEach(item => map.set(item.item_no, item));
    
    setSorData(Array.from(map.values()));
  }, [globalSorData, userSorData]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneType>('Dhaka_Mymensingh');
  
  // Auto-BoQ state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(sorData.map(item => item.category)))];

  // Basic search & category filter
  const filteredItems = sorData.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.item_no.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.item_no === item.item_no);
    if (!existing) {
      setCart([...cart, { 
        id: Math.random().toString(36).substr(2, 9), 
        item_no: item.item_no, 
        description: item.description, 
        unit: item.unit, 
        rates: item.rates, 
        quantity: 1 
      }]);
    } else {
      setCart(cart.map(c => c.item_no === item.item_no ? { ...c, quantity: c.quantity + 1 } : c));
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 0) return;
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const downloadCSV = () => {
    let csv = `Item No,Description,Unit,Zone,Rate (${zoneLabels[selectedZone]}),Quantity,Amount (Tk)\n`;
    csv += cart.map(item => `"${item.item_no}","${item.description.replace(/"/g, '""')}","${item.unit}","${zoneLabels[selectedZone]}",${item.rates[selectedZone]},${item.quantity},${(item.rates[selectedZone] * item.quantity).toFixed(2)}`).join('\n');
    csv += `\n,,,,,Subtotal,${subTotal.toFixed(2)}\n`;
    csv += `,,,,,Contractor Profit (10%),${cp.toFixed(2)}\n`;
    csv += `,,,,,VAT (10%),${vat.toFixed(2)}\n`;
    csv += `,,,,,Grand Total,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SoR_Estimate_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadMessage(null);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Convert with header row
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        let newItemsFound = 0;
        let finalCart = [...cart];
        
        rawData.forEach((rawRow: any) => {
            const row: any = {};
            for (const key in rawRow) {
                if (key) {
                   row[key.trim().toLowerCase()] = rawRow[key];
                }
            }

            // Check common column names in e-GP spreadsheets
            const itemNo = row['item no'] || row['item number'] || row['item'] || row['item no.'] || row['item code'];
            const itemCode = row['item code (if any)'] || row['item code'] || row['code'];
            const description = row['description of item'] || row['description'] || row['item description'];
            const quantityVal = row['quantity'] || row['qty'] || row['total quantity'];
            
            const quantity = parseFloat(quantityVal) || 0;
            
            if (quantity > 0) {
                let matchedItem = undefined;

                // 1. Try to match by item_code (from e-GP) against sorData.item_no
                if (itemCode && String(itemCode).trim() !== '' && String(itemCode).trim().toUpperCase() !== 'N/A') {
                    const formattedItemCode = String(itemCode).trim();
                    matchedItem = sorData.find(s => String(s.item_no) === formattedItemCode || s.item_code === formattedItemCode);
                }

                // 2. If no match, try to match by item_no (from e-GP) against sorData.item_no
                // We only do this if itemNo seems like a proper PWD code (contains a dot/dash) or length > 2
                // Otherwise it will falsely match serial numbers like "1", "2"
                if (!matchedItem && itemNo && String(itemNo).trim() !== '' && String(itemNo).trim().toUpperCase() !== 'N/A') {
                    const formattedItemNo = String(itemNo).trim();
                    if (/[\.\-]/.test(formattedItemNo) || formattedItemNo.length > 2) {
                        matchedItem = sorData.find(s => String(s.item_no) === formattedItemNo);
                    }
                }

                // 3. If no match, try to fuzzy match by description
                if (!matchedItem && description && String(description).trim() !== '') {
                    const formattedDesc = String(description).trim().toLowerCase();
                    matchedItem = sorData.find(s => {
                        const sDesc = String(s.description).toLowerCase();
                        return sDesc === formattedDesc || 
                            (formattedDesc.length > 20 && sDesc.includes(formattedDesc)) || 
                            (sDesc.length > 20 && formattedDesc.includes(sDesc));
                    });

                    // 4. Advanced similarity matching using Dice Coefficient (string-similarity)
                    if (!matchedItem) {
                        const descriptions = sorData.map(s => String(s.description).toLowerCase());
                        const match = findBestMatch(formattedDesc, descriptions);
                        
                        // Set a threshold (e.g., 0.25 which means a reasonable match for long e-GP descriptions)
                        if (match.bestMatch.rating > 0.25) {
                            matchedItem = sorData[match.bestMatchIndex];
                        }
                    }
                }
                
                if (matchedItem) {
                    newItemsFound++;
                    const existingIndex = finalCart.findIndex(c => c.item_no === matchedItem?.item_no);
                    if (existingIndex < 0) {
                        finalCart.push({
                            id: Math.random().toString(36).substr(2, 9),
                            item_no: matchedItem.item_no,
                            description: description ? String(description).trim() : matchedItem.description,
                            unit: matchedItem.unit,
                            rates: matchedItem.rates,
                            quantity
                        });
                    } else {
                        finalCart[existingIndex] = {
                            ...finalCart[existingIndex],
                            quantity: finalCart[existingIndex].quantity + quantity
                        };
                    }
                }
            }
        });
        
        if (newItemsFound > 0) {
            setCart(finalCart);
            setUploadMessage({ type: 'success', text: `Successfully extracted ${newItemsFound} items from the BoQ/Excel file and added them to your estimate.` });
            setTimeout(() => {
                setActiveTab('estimate');
            }, 2000);
        } else {
            setUploadMessage({ type: 'error', text: 'Could not find any matching PWD SoR 2022 items in the uploaded file. Ensure columns have "Item No" and "Quantity".' });
        }
      } catch (err) {
        setUploadMessage({ type: 'error', text: 'Error parsing file. Please upload a valid Excel or CSV file.' });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const dbInputRef = useRef<HTMLInputElement>(null);
  const globalDbInputRef = useRef<HTMLInputElement>(null);
  const [isDBProcessing, setIsDBProcessing] = useState(false);
  const [dbUploadMessage, setDbUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleDBUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGlobal: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDBProcessing(true);
    setDbUploadMessage(null);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        let validItems: any[] = [];
        
        rawData.forEach((rawRow: any) => {
            const row: any = {};
            for (const key in rawRow) {
                if (key) {
                   row[key.trim().toLowerCase()] = rawRow[key];
                }
            }

            const itemNo = row['item no'] || row['item number'] || row['item'] || row['item no.'] || row['item code'];
            const description = row['description of item'] || row['description'] || row['item description'] || row['item_description'];
            const unit = row['unit'] || row['measurement unit'] || row['measure'] || 'Nos';
            
            // Getting Rates
            const getNum = (v: any) => parseFloat(v) || 0;
            const fallbackRate = getNum(row['rate']) || getNum(row['unit price']) || getNum(row['price']) || getNum(row['unit price in figures (bdt)']) || 0;
            
            const dhaka = getNum(row['dhaka']) || getNum(row['dhaka_mymensingh']) || getNum(row['dhaka rate']) || fallbackRate;
            const chattogram = getNum(row['chattogram']) || getNum(row['chattogram_sylhet']) || getNum(row['chattogram rate']) || fallbackRate;
            const khulna = getNum(row['khulna']) || getNum(row['khulna_barisal_gopalgonj']) || getNum(row['khulna rate']) || fallbackRate;
            const rajshahi = getNum(row['rajshahi']) || getNum(row['rajshahi_rangpur']) || getNum(row['rajshahi rate']) || fallbackRate;

            if (itemNo || description) {
               validItems.push({
                   item_no: itemNo ? String(itemNo).trim() : `Custom-${Math.random().toString(36).substr(2, 5)}`,
                   chapter: isGlobal ? 'PWD Standard/Global Upload' : 'Custom User Upload',
                   category: isGlobal ? 'PWD DB' : 'User Custom DB',
                   description: description ? String(description).trim() : 'No Description',
                   unit: String(unit).trim(),
                   rates: {
                       Dhaka_Mymensingh: dhaka,
                       Chattogram_Sylhet: chattogram,
                       Khulna_Barisal_Gopalgonj: khulna,
                       Rajshahi_Rangpur: rajshahi
                   }
               });
            }
        });
        
        if (validItems.length > 0) {
            const user = auth.currentUser;
            if (user) {
              const BATCH_SIZE = 400; // Safe limit under 500
              const targetRef = isGlobal 
                ? collection(db, 'globalSorItems') 
                : collection(db, 'users', user.uid, 'sorItems');
              
              const chunks = [];
              for (let i = 0; i < validItems.length; i += BATCH_SIZE) {
                  chunks.push(validItems.slice(i, i + BATCH_SIZE));
              }

              for (const chunk of chunks) {
                  const batch = writeBatch(db);
                  for (const item of chunk) {
                      const newDocRef = doc(targetRef); // Auto-generate ID
                      batch.set(newDocRef, {
                          id: newDocRef.id,
                          item_no: item.item_no,
                          chapter: item.chapter,
                          category: item.category,
                          description: item.description,
                          unit: item.unit,
                          rates: item.rates,
                          authorUid: user.uid,
                          createdAt: serverTimestamp()
                      });
                  }
                  await batch.commit();
              }
              setDbUploadMessage({ type: 'success', text: `Successfully saved ${validItems.length} items to your cloud DB (${isGlobal ? 'Global' : 'Personal'}).` });
            } else {
              setDbUploadMessage({ type: 'error', text: 'You must be logged in to save SoR data.' });
            }
        } else {
            setDbUploadMessage({ type: 'error', text: 'No valid rows found. Ensure you have "Item No", "Description", and "Rate" columns.' });
        }
      } catch (err) {
        console.error(err);
        setDbUploadMessage({ type: 'error', text: 'Error parsing DB file. Please upload Excel or CSV.' });
      } finally {
        setIsDBProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const clearMasterDB = async () => {
    setIsDBProcessing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userSorRef = collection(db, 'users', user.uid, 'sorItems');
        const snapshot = await getDocs(userSorRef);
        
        let batch = writeBatch(db);
        let count = 0;
        
        for (const document of snapshot.docs) {
          batch.delete(document.ref);
          count++;
          if (count === 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        
        if (count > 0) {
          await batch.commit();
        }
        
        setDbUploadMessage({ type: 'success', text: 'Cleared custom SoR documents. Reverted back to default demo PWD DB.' });
      } else {
        setDbUploadMessage({ type: 'error', text: 'You must be logged in.' });
      }
    } catch (e) {
      console.error(e);
      setDbUploadMessage({ type: 'error', text: 'Failed to reset DB.' });
    } finally {
      setIsDBProcessing(false);
    }
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + (item.rates[selectedZone] * item.quantity), 0);
  const cp = subTotal * 0.10;
  const vat = (subTotal + cp) * 0.10;
  const grandTotal = subTotal + cp + vat;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          {lang === 'bn' ? 'স্মার্ট এস্টিমেট (PWD SoR 2022)' : 'Smart Estimates (PWD SoR 2022)'}
        </h1>
        <p className="text-slate-600 max-w-2xl text-lg">
          {lang === 'bn' 
            ? 'সরকারি রেট দিয়ে নিমিষেই আপনার এস্টিমেট বের করুন। PWD SoR 2022 অনুযায়ী যেকোনো আইটেমের দাম খুঁজুন।'
            : 'Instantly calculate your estimates using official government rates. Search any item from the PWD SoR 2022 (2nd Revised) Civil Works.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('search')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'search' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Search className="w-4 h-4" />
          {lang === 'bn' ? 'রেট খুঁজুন' : 'Rate Lookup'}
        </button>
        <button 
          onClick={() => setActiveTab('estimate')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'estimate' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {lang === 'bn' ? 'এস্টিমেট ক্যালকুলেটর' : 'Estimate Calculator'}
          {cart.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              {cart.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('boq')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'boq' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <FileText className="w-4 h-4" />
          {lang === 'bn' ? 'অটো-BoQ' : 'Auto-BoQ'}
        </button>
        <button 
          onClick={() => setActiveTab('database')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'database' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Database className="w-4 h-4" />
          {lang === 'bn' ? 'মাস্টার ডাটাবেস প্রস্তুত' : 'Manage Data'}
        </button>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={lang === 'bn' ? 'যেমন: Brick works, RCC 1:2:4, 04.1 ইত্যাদি লিখে খুঁজুন...' : 'e.g. Brick works, RCC 1:2:4, 04.1...'}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  selectedCategory === cat 
                    ? "bg-blue-600 text-white shadow-md border border-blue-600" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
              <span>{filteredItems.length} {lang === 'bn' ? 'টি আইটেম পাওয়া গেছে' : 'items found'} (Showing sample subset)</span>
            </div>
            
            {filteredItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                        Item {item.item_no}
                      </span>
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        {item.chapter}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-sm text-slate-500 font-medium mt-1">
                      Unit: <span className="text-slate-900 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">{item.unit}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-shrink-0 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'bn' ? 'এস্টিমেটে যোগ করুন' : 'Add to Estimate'}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Dhaka / Mymensingh</p>
                    <p className="text-lg font-bold text-slate-900">৳{item.rates.Dhaka_Mymensingh.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Chattogram / Sylhet</p>
                    <p className="text-lg font-bold text-slate-900">৳{item.rates.Chattogram_Sylhet.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Khulna / Barisal / Gopal</p>
                    <p className="text-lg font-bold text-slate-900">৳{item.rates.Khulna_Barisal_Gopalgonj.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Rajshahi / Rangpur</p>
                    <p className="text-lg font-bold text-slate-900">৳{item.rates.Rajshahi_Rangpur.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'estimate' ? (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {lang === 'bn' ? 'আপনার এস্টিমেট' : 'My Estimate'}
                </h2>
                <p className="text-slate-500">
                  {lang === 'bn' ? 'পরিমাণ যোগ করুন এবং ক্যালকুলেট করুন' : 'Add quantities to automatically calculate costs based on SoR.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  {lang === 'bn' ? 'জোন নির্বাচন করুন:' : 'Select Zone:'}
                </span>
                <select 
                  className="bg-slate-100 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2 text-sm font-bold text-slate-800"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as ZoneType)}
                >
                  {Object.entries(zoneLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {lang === 'bn' ? 'এস্টিমেট খালি' : 'Your estimate is empty'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {lang === 'bn' ? 'রেট খুঁজুন ট্যাব থেকে আইটেম যোগ করুন।' : 'Go to Rate Lookup tab and click "Add to Estimate" to start building your BoQ.'}
                </p>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                >
                  {lang === 'bn' ? 'আইটেম যোগ করুন' : 'Find Items'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="p-4 font-semibold">Item No</th>
                        <th className="p-4 font-semibold min-w-[300px]">Description</th>
                        <th className="p-4 font-semibold">Unit</th>
                        <th className="p-4 font-semibold text-right">Rate</th>
                        <th className="p-4 font-semibold w-32">Qty</th>
                        <th className="p-4 font-semibold text-right">Amount</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cart.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-900">{item.item_no}</td>
                          <td className="p-4 text-sm text-slate-600">
                            <div className="line-clamp-2" title={item.description}>{item.description}</div>
                          </td>
                          <td className="p-4 text-sm text-slate-500 font-medium">{item.unit}</td>
                          <td className="p-4 text-sm font-bold text-slate-900 text-right">
                            ৳{item.rates[selectedZone].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-1.5 text-sm font-medium outline-none"
                            />
                          </td>
                          <td className="p-4 text-sm font-bold text-blue-700 text-right">
                            ৳{(item.rates[selectedZone] * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end md:items-start gap-8">
                  <div className="w-full md:w-auto">
                    <button 
                      onClick={downloadCSV}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto justify-center"
                    >
                      <Download className="w-4 h-4" />
                      {lang === 'bn' ? 'এক্সেল / CSV ডাউনলোড' : 'Download CSV'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2 font-medium max-w-sm">
                      {lang === 'bn' ? 'এই এস্টিমেটটি e-GP এর টেন্ডারে সাবমিট করার জন্য তৈরি করা হয়েছে।' : 'Download to view in Excel and submit in e-GP BoQ format.'}
                    </p>
                  </div>

                  <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <span>Subtotal</span>
                        <span>৳{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <span>Contractor's Profit (10%)</span>
                        <span>৳{cp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-600 pb-3 border-b border-slate-200">
                        <span>VAT (10%)</span>
                        <span>৳{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-1">
                        <span>Grand Total</span>
                        <span className="text-blue-600">৳{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'boq' ? (
        <div className="bg-blue-50 bg-opacity-50 border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {lang === 'bn' ? 'অটোমেটিক BoQ এস্টিমেশন' : 'Automated BoQ Estimation (Excel/CSV)'}
          </h2>
          <p className="text-slate-600 max-w-lg mb-6 leading-relaxed">
            {lang === 'bn' 
              ? 'এখানে আপনার টেন্ডারের ফাঁকা BoQ (Excel/CSV) ফাইল আপলোড করুন। আমাদের সিস্টেম অটোমেটিকভাবে আইটেম নম্বর এবং পরিমাণ এক্সট্রেক্ট করে PWD SoR 2022 রেট অনুযায়ী একটি সম্পূর্ণ এস্টিমেট শট তৈরি করে দিবে।' 
              : 'Upload a tender BoQ Excel or CSV file. The system will automatically parse "Item No" and "Quantity" columns to cross-reference items with the PWD SoR 2022 dataset to generate a fully priced estimation sheet.'}
          </p>
          
          {uploadMessage && (
            <div className={cn(
                "mb-6 px-4 py-3 rounded-lg text-sm font-medium w-full max-w-md",
                uploadMessage.type === 'success' ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
            )}>
              {uploadMessage.text}
            </div>
          )}

          <div className="flex gap-4">
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isProcessing} 
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
             >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {lang === 'bn' ? (isProcessing ? 'প্রসেসিং হচ্ছে...' : 'এখান থেকে ফাইল আপলোড করুন') : (isProcessing ? 'Processing...' : 'Upload Excel / CSV')}
             </button>
             <button onClick={() => setActiveTab('search')} className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:border-slate-300 transition-colors">
              Return to Search
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {lang === 'bn' ? 'মাস্টার ডাটাবেস প্রস্তুত' : 'Manage Master DB (SoR)'}
                </h2>
                <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                  {lang === 'bn' 
                  ? 'আপনার কাছে সম্পূর্ণ PWD রেট শিডিউলের এক্সেল ফাইল থাকলে, সেটি এখানে আপলোড করুন। এর ফলে সার্চ এবং অটো-BoQ তে আপনার সব আইটেম পাওয়া যাবে।' 
                  : 'Upload your own comprehensive Schedule of Rates (SoR) in Excel/CSV format to train the system. The system will use your uploaded rates for all searches and BoQ estimates moving forward.'}
                </p>
              </div>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-100">
                <Database className="w-4 h-4" />
                {sorData.length} Items Loaded
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Database className="w-24 h-24 text-blue-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">Upload Custom/Global Database</h3>
                 <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
                    Excel/CSV columns must contain: <strong>Item No</strong>, <strong>Description</strong>, and <strong>Rate</strong>. (Optional: Unit, Dhaka Rate, Chattogram Rate, etc.)
                 </p>
                 
                 <input 
                    type="file" 
                    ref={dbInputRef} 
                    onChange={(e) => handleDBUpload(e, false)} 
                    accept=".xlsx, .xls, .csv" 
                    className="hidden" 
                 />
                 <input 
                    type="file" 
                    ref={globalDbInputRef} 
                    onChange={(e) => handleDBUpload(e, true)} 
                    accept=".xlsx, .xls, .csv" 
                    className="hidden" 
                 />

                 {dbUploadMessage && (
                    <div className={cn(
                        "mb-4 px-4 py-3 rounded-lg text-sm font-medium",
                        dbUploadMessage.type === 'success' ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                    )}>
                      {dbUploadMessage.text}
                    </div>
                 )}

                 <div className="space-y-3 relative z-10">
                   <button 
                     onClick={() => dbInputRef.current?.click()}
                     disabled={isDBProcessing} 
                     className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 w-full shadow-sm"
                   >
                    {isDBProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isDBProcessing ? 'Parsing File...' : 'Upload Personal DB Override'}
                   </button>
                   
                   {(userData?.role === 'admin' || auth.currentUser?.email === 'fab.sujit@gmail.com') && (
                     <button 
                       onClick={() => globalDbInputRef.current?.click()}
                       disabled={isDBProcessing} 
                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 w-full shadow-sm"
                     >
                      {isDBProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                      {isDBProcessing ? 'Parsing File...' : 'Upload Global PWD DB (Admin)'}
                     </button>
                   )}
                 </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                 <h3 className="text-lg font-bold text-slate-900 mb-2">Revert / Reset</h3>
                 <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    If you uploaded a faulty file or want to revert back to the default built-in PWD sample database, click the reset button below.
                 </p>
                 
                 <button 
                   onClick={clearMasterDB}
                   className="bg-white border-2 border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 w-full mt-auto"
                 >
                  <Trash2 className="w-4 h-4" />
                  Reset to Default DB
                 </button>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};
