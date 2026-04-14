import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, FileItem, FileMetadata, FileType, Language, AppMode, QcResult } from "../types";
// IMPORT DAFTAR DREAMSTIME DARI CONSTANTS
import { CATEGORIES, SHUTTERSTOCK_CATEGORIES, SHUTTERSTOCK_VIDEO_CATEGORIES, DREAMSTIME_CATEGORIES } from "../constants";
import { extractVideoFrames } from "../utils/helpers";

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type || 'application/octet-stream', 
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsDataURL(file);
  });
};

const convertSvgToWhiteBgJpeg = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const base64String = dataUrl.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: 'image/jpeg', 
          },
        });
      };
      img.onerror = () => reject(new Error("Failed to load SVG image"));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const compressImage = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 512;  
        const MAX_HEIGHT = 512;
        
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
        
        const base64String = dataUrl.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: 'image/jpeg', 
          },
        });
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const SUPREME_METADATA_PROTOCOL = `
### SUPREME STOCK METADATA SEO PROTOCOL (SHUTTERSTOCK STRICT MODE) ###
Anda adalah Analis SEO Microstock Elit. Ikuti protokol ketat ini tanpa pengecualian:

STEP 1: VISUAL IDENTITY LOCK (CCTV MODE - NO HALU)
- Bertindaklah seperti kamera CCTV. Deskripsikan HANYA objek fisik, warna, bentuk, dan aksi yang BENAR-BENAR TERLIHAT.
- HARAM berhalusinasi, menebak cerita, atau menebak perasaan/makna abstrak yang tidak ada wujud fisiknya.

STEP 2: RUMUS PENULISAN JUDUL & DESKRIPSI
- TITLE FORMULA: [Nama Objek Utama] + [Setting/Kondisi Visual Langsung] + [Tujuan/Konteks Komersial].
- NO COMMAS: DILARANG KERAS menggunakan tanda koma (,) di dalam kalimat Title maupun Description! Buat kalimat mengalir natural dan padu.
- DESCRIPTION FORMULA: DESCRIPTION WAJIB berupa PARAFRASE dari TITLE. Maknanya harus sama persis, TETAPI DILARANG KERAS MENYALIN KATA-KATA TITLE SECARA IDENTIK!
- KATA PERTAMA: Harus berupa nama objek literal (Subjek Utama).
- STRICT NO OPINIONS & BLACKLIST: Dilarang menggunakan kata sifat opini/pujian subjektif. Anda WAJIB mematuhi dan menghindari setiap kata yang tercantum pada "NEGATIVE METADATA (Kata Terlarang)" yang diberikan oleh user di bagian instruksi tambahan!

STEP 3: LOGIKA KATA KUNCI (STRICT 1-WORD & ZERO SPAM)
- TOTAL: Tepat [KW_COUNT] kata kunci.
- WAJIB 1 KATA TUNGGAL: Setiap kata kunci HARAM terdiri dari 2 kata atau lebih. Pisahkan setiap 1 kata tunggal dengan koma. (Contoh SALAH: "red apple". Contoh BENAR: "red, apple").
- UNIQUE / ZERO SPAM: DILARANG mengulang kata yang sama atau variasi kata dasarnya (misal: Jangan menulis "run, running, runner" secara bersamaan. Pilih SATU yang terkuat). Setiap kata harus 100% unik.
- TOP 20 SEO: 20 kata kunci pertama WAJIB yang paling relevan secara visual.

STEP 4: SHUTTERSTOCK BLACKLIST (HARAM MUTLAK)
- NO FILE TYPES/STYLES: DILARANG KERAS menulis jenis file atau gaya seni di Title, Deskripsi, maupun Keyword (HARAM: vector, illustration, photo, drawing, digital art, 3d render, clipart).
- NO TECH SPECS: DILARANG menulis spesifikasi kamera/alat (HARAM: 4k, 8k, hd, resolution, gopro, drone, 60fps, slow motion, timelapse).
- NO TRADEMARKS/BRANDS: DILARANG KERAS menyebutkan nama merk, logo, atau tokoh publik. Ganti menjadi istilah generik!

STEP 5: ASSIGN TRIPLE CATEGORY (MANDATORY STRUKTURAL)
Anda WAJIB memberikan TIGA jenis kategori untuk 3 platform yang berbeda secara bersamaan:
1. 'categoryAdobe': Pilih TEPAT 1 Kategori yang paling akurat dari DAFTAR ADOBE.
2. 'categoryShutter': Pilih TEPAT 2 Kategori (ID TEKS) yang paling akurat dari DAFTAR SHUTTERSTOCK. Pisahkan dengan koma (contoh: "Abstract, Nature"). DILARANG KOSONG!
3. 'categoryDream': Pilih TEPAT 3 Kategori (ANGKA ID) yang paling akurat dari DAFTAR DREAMSTIME. Pisahkan dengan koma (contoh: "112, 145, 105"). DILARANG KOSONG!
`;

export const generateMetadataForFile = async (
  fileItem: FileItem,
  settings: AppSettings,
  providedApiKey: string, 
  mode: AppMode = 'metadata'
): Promise<{ metadata: FileMetadata; thumbnail?: string; generatedImageUrl?: string; qcResult?: QcResult; }> => {
  const isCanvasMode = settings.apiProvider === 'GEMINI CANVAS';
  const actualApiKey = isCanvasMode 
      ? (process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key') 
      : providedApiKey;

  if (!isCanvasMode && !actualApiKey) {
      throw new Error(`API Key kosong. Masukkan API Key di pengaturan untuk mode ${settings.apiProvider}.`);
  }

  let targetModel = settings.geminiModel || 'gemini-2.5-flash';
  if (isCanvasMode && targetModel === 'auto') {
      targetModel = 'gemini-2.5-flash'; 
  }
  
  try {
    let systemInstruction = "";
    let promptText = "";
    let temperature = 0.1;
    let outputSchema: any;

    if (mode === 'metadata') {
        const listAdobe = CATEGORIES.map(c => `"${c.id}" = ${c.en}`).join('\n');
        const listShutter = (fileItem.type === FileType.Video ? SHUTTERSTOCK_VIDEO_CATEGORIES : SHUTTERSTOCK_CATEGORIES).map(c => `"${c.id}" = ${c.en}`).join('\n');
        // TAMBAHKAN DAFTAR DREAMSTIME
        const listDream = DREAMSTIME_CATEGORIES.map(c => `"${c.id}" = ${c.en}`).join('\n');
        
        const minChars = settings.titleMin || 50;
        const maxChars = settings.titleMax || 150;
        const kwTotal = settings.slideKeyword || 40;
        
        // LOGIKA MASTER KEYWORD: Jika ada instruksi, paksa AI hasilkan 100 keyword sebagai stok bahan baku
        const isGroq = settings.apiProvider === 'GROQ API';
        const baseKwTarget = isGroq ? kwTotal + 15 : kwTotal;
        const kwTargetAI = settings.metadataCustomInstruction ? 100 : baseKwTarget;

        systemInstruction = `LANGUAGE: Hasilkan field 'en' dalam Bahasa Inggris dan field 'ind' dalam Bahasa Indonesia yang merupakan terjemahan profesionalnya.\n\n${SUPREME_METADATA_PROTOCOL}`
            .replace('[KW_COUNT]', kwTargetAI.toString());

        // MASUKKAN 3 DAFTAR KE OTAK AI
        systemInstruction += `\n\nDAFTAR ADOBE:\n${listAdobe}\n\nDAFTAR SHUTTERSTOCK:\n${listShutter}\n\nDAFTAR DREAMSTIME:\n${listDream}`;
        
        promptText = `ANALISIS MANDATORI: Perhatikan aset ini. JANGAN menebak. Identifikasi objek, material, dan warna yang eksak. Tulis metadata yang 100% literal dan SEO-optimized sesuai protokol Supreme.\n\n!!! CRITICAL INSTRUCTIONS (MUST OBEY) !!!\n`;

        // ATURAN DEFAULT UI
        promptText += `- TITLE LENGTH: Panjang kalimat antara ${minChars} hingga ${maxChars} karakter.\n`;
        promptText += `- DESCRIPTION RULE: Field Description WAJIB diisi. Isinya WAJIB merupakan parafrase dari Title. Panjang antara ${minChars} hingga ${maxChars} karakter.\n`;
        promptText += `- KEYWORD COUNT: WAJIB hasilkan minimal ${kwTargetAI} kata kunci tunggal (dipisah koma).\n`;
        promptText += `- KEYWORD FORMAT: WAJIB 1 KATA TUNGGAL PER KEYWORD. Dilarang keras menggunakan spasi di dalam keyword!\n`;

        // === SUNTIKAN INSTRUKSI KUSTOM DARI UI (SABDA RAJA / PELECUT FATAL) ===
        if (settings.metadataCustomInstruction) {
            promptText += `\n\n!!! PERINTAH EKSTERNAL USER (WAJIB PATUH MUTLAK) !!!\n"${settings.metadataCustomInstruction}"\nInstruksi ini adalah PELECUT dan HUKUM TERTINGGI untuk hasil akhir metadata. Jika instruksi ini meminta batas karakter (misal tidak lebih dari angka tertentu) atau batasan lainnya yang bertentangan dengan aturan default di atas, Anda WAJIB memastikan hasil akhirnya menuruti instruksi eksternal ini secara akurat tanpa bantahan. Ingat maksud dan batasan ketat dari perintah ini!`;
        }
      
        if (settings.negativeMetadata) {
            promptText += `\nNEGATIVE METADATA (Kata Terlarang): ${settings.negativeMetadata}`;
        }

        // UPDATE SCHEMA AGAR AI MENGHASILKAN categoryDream
        outputSchema = {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "description", "keywords"] },
            ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "description", "keywords"] },
            categoryAdobe: { type: Type.STRING }, 
            categoryShutter: { type: Type.STRING },
            categoryDream: { type: Type.STRING } // <--- LACI BARU MINTA KE AI
          },
          required: ["en", "ind", "categoryAdobe", "categoryShutter", "categoryDream"]
        };

    } else if (mode === 'idea') {
        temperature = 1.0; 
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_idea: { type: Type.STRING }, 
              ind_idea: { type: Type.STRING }
           },
           required: ["en_idea", "ind_idea"]
        };

        // 1. PERBAIKAN BUG CUSTOM & FILE (Memanggil Input Asli Sampeyan)
        let temaUtama = "";
        if (settings.ideaCategory === 'auto') {
            temaUtama = "SANGAT ACAK (Pilih bebas dari: Medis, Bisnis, Alam, Makanan, Gaya Hidup, Teknologi, Olahraga)";
        } else if (settings.ideaCategory === 'custom') {
            temaUtama = settings.ideaCustomInput || "Topik Bebas"; // <--- Mengambil teks ketikan sampeyan!
        } else if (settings.ideaCategory === 'file') {
            temaUtama = "ANALISA FILE VISUAL (Lihat gambar/video yang dilampirkan, lalu hasilkan ide pengembangan visual baru darinya)";
        } else {
            temaUtama = settings.ideaCategory;
        }

        const instruksiPengguna = settings.ideaCustomInstruction;

        // 2. LOGIKA LICIK ANTI-TEMPLAT (RANDOM SEMANTIC SEED)
        const bumbuAcak = ["Cyberpunk", "Cinematic", "Minimalist", "Surreal", "Macro", "Neon", "Vintage", "Drone View", "Silhouette", "Isometric", "Pop Art", "Golden Hour", "High Contrast", "Candid", "Symmetrical", "Abstract", "Gothic", "Ethereal", "Futuristic", "Pastel", "Double Exposure", "Bokeh", "Steampunk", "Low-poly", "Vibrant", "Monochrome", "Hyper-realistic", "Fantasy", "Industrial", "Microscopic", "Overhead", "Motion Blur", "Flat Lay"];
        
        // Sistem ngundi 2 gaya visual secara rahasia untuk tiap-tiap worker!
        const paksaanVisual1 = bumbuAcak[Math.floor(Math.random() * bumbuAcak.length)];
        const paksaanVisual2 = bumbuAcak[Math.floor(Math.random() * bumbuAcak.length)];

        systemInstruction = `Bertindak sebagai Senior Microstock Analyst. Berikan 1 ide konsep visual bernilai komersial tinggi.
        TEMA/OBJEK UTAMA: ${temaUtama}
        ATURAN MUTLAK:
        1. Output HANYA berupa kalimat ide yang sangat singkat (1 baris, maksimal 5 kata).
        2. JANGAN sertakan judul, deskripsi panjang, atau keyword.
        3. Hasilkan dalam field JSON 'en_idea' dan 'ind_idea'.`;

        promptText = `TUGAS ID: ${fileItem.id}
CRITICAL RULE (ANTI-KEMBAR): Untuk memastikan variasi, Anda WAJIB memadukan gaya visual ini ke dalam ide Anda: [${paksaanVisual1}] dan [${paksaanVisual2}]. 
Jangan buat ide klise seperti 'server room' atau 'electric car'. Buat objek, lokasi, dan aktivitas yang 100% segar dan super liar!

INSTRUKSI DARI PENGGUNA: 
"${instruksiPengguna ? instruksiPengguna : "Buat konsep visual serealistis mungkin. Hindari ide pasaran."}"`;
    
    } else if (mode === 'prompt') {
        temperature = 0.8;
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_prompt: { type: Type.STRING }, 
              ind_prompt: { type: Type.STRING }
           },
           required: ["en_prompt", "ind_prompt"]
        };

        let instruksiTambahan = settings.promptDescription ? `\nInstruksi Tambahan dari User: ${settings.promptDescription}` : "";
        
        // === SUNTIKAN KODE BARU UNTUK NEGATIVE PROMPT ===
        if (settings.negativePrompt && settings.negativePrompt.trim() !== '') {
            instruksiTambahan += `\n\nNEGATIVE PROMPT (HINDARI KATA-KATA INI): ${settings.negativePrompt}`;
        }
        // ===============================================
        
        if (settings.promptPlatform === 'text') {
            systemInstruction = `Bertindak sebagai AI Prompt Engineer profesional. Tugas Anda adalah mengembangkan ide pendek menjadi sebuah prompt gambar/video yang sangat detail, spesifik, dan memukau untuk AI Image Generator (seperti Midjourney atau Stable Diffusion).
            
            ATURAN:
            1. Buat prompt deskriptif yang mencakup subjek utama, pencahayaan, suasana (mood), sudut pandang kamera, dan gaya visual.
            2. Jangan menambahkan penjelasan apapun di luar prompt.
            3. Hasilkan dalam bahasa Inggris ('en_prompt') dan terjemahan akuratnya dalam bahasa Indonesia ('ind_prompt').`;
            
            promptText = `Kembangkan ide berikut menjadi sebuah prompt gambar yang sangat detail: "${settings.promptIdea}" ${instruksiTambahan}`;
        } else {
            systemInstruction = `Bertindak sebagai AI Vision Expert. Tugas Anda adalah menganalisa gambar/video ini dan mengubahnya menjadi sebuah prompt teks (reverse-prompting) yang sangat detail, agar AI Image Generator lain bisa membuat ulang gambar yang mirip.
            
            ATURAN:
            1. Deskripsikan secara detail: Subjek utama, lingkungan/latar belakang, pencahayaan, warna dominan, dan gaya estetik (apakah foto realistis, vektor, ilustrasi, dll).
            2. Jika ada instruksi tambahan dari user, gabungkan instruksi tersebut ke dalam prompt akhir.
            3. Hasilkan dalam bahasa Inggris ('en_prompt') dan terjemahan akuratnya dalam bahasa Indonesia ('ind_prompt').`;

            promptText = `Buatlah prompt detail berdasarkan gambar/video ini. ${instruksiTambahan}`;
        }
    
    } else if (mode === 'qc') {
        temperature = 0.2; 
        
        systemInstruction = `Anda adalah Kurator dan Reviewer Agensi Microstock Galak (seperti Adobe Stock atau Shutterstock). Tugas Anda adalah mengkurasi kelayakan komersial, teknis, dan legal dari aset visual yang dikirim.
        
        ATURAN PENILAIAN STRICT:
        1. score: Nilai 1-100 (Seberapa laku dan layak aset ini dijual).
        2. status: Harus salah satu dari "Pass" (Lolos tanpa masalah), "Warning" (Ada catatan kecil), atau "Fail" (Ditolak mutlak karena cacat/melanggar).
        3. technicalIssues: Array string. Sebutkan jika ada blur, noise parah, overexposed, pencahayaan buruk, atau cacat anatomi AI (jari aneh, dll). KOSONGKAN array jika kualitas teknis sempurna.
        4. ipIssues: Array string. Sebutkan JIKA ADA PELANGGARAN HAK CIPTA/TRADEMARK (logo Nike, desain Apple, botol Coca-Cola, plat nomor mobil, atau wajah orang yang butuh rilis model). KOSONGKAN array jika murni aman.
        5. commercialAdvice: 1-2 kalimat saran komersial dalam Bahasa Indonesia. Apa nilai jual gambar ini atau peringatan mengapa gambar ini akan ditolak kurator.`;

        promptText = `Analisis gambar/video ini secara mendalam seperti seorang kurator galak. Periksa cacat teknis, cacat AI, potensi pelanggaran hak cipta, dan nilai komersialnya.`;

        outputSchema = {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            technicalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            ipIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            commercialAdvice: { type: Type.STRING }
          },
          required: ["score", "status", "technicalIssues", "ipIssues", "commercialAdvice"]
        };
    }

    let parts: any[] = [];
    
    if ((mode === 'prompt' && settings.promptPlatform === 'text') || (mode === 'idea' && settings.ideaCategory !== 'file')) {
      parts = [{ text: promptText }];
    } else {
      if (fileItem.type === FileType.Video) {
        const frames = await extractVideoFrames(fileItem.file, settings.videoFrameCount || 3);
        parts = frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f } }));
        parts.push({ text: promptText });
      } else {
        const mediaPart = (fileItem.type === FileType.Vector && fileItem.file.type === 'image/svg+xml') 
          ? await convertSvgToWhiteBgJpeg(fileItem.file) 
          : await compressImage(fileItem.file);
        parts = [mediaPart, { text: promptText }];
      }
    }

    let parsed: any;

    if (settings.apiProvider === 'GROQ API') {
        const messages = [];
        
        let expectedJsonSchema = "";
        if (mode === 'metadata') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en": { "title": "string", "description": "string", "keywords": "string" },\n  "ind": { "title": "string", "description": "string", "keywords": "string" },\n  "categoryAdobe": "string",\n  "categoryShutter": "string",\n  "categoryDream": "string"\n}`;
        } else if (mode === 'idea') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en_idea": "string",\n  "ind_idea": "string"\n}`;
        } else if (mode === 'prompt') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en_prompt": "string",\n  "ind_prompt": "string"\n}`;
        } else if (mode === 'qc') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "score": number,\n  "status": "string",\n  "technicalIssues": ["string"],\n  "ipIssues": ["string"],\n  "commercialAdvice": "string"\n}`;
        }
        
        const groqSystemInstruction = systemInstruction + expectedJsonSchema + `\n\nIMPORTANT: You MUST return ONLY a valid JSON object matching the exact keys and structure above. Do NOT wrap it in markdown code blocks.`;
        
        if (systemInstruction) {
            messages.push({ role: "system", content: groqSystemInstruction });
        }
        
        let hasImage = false;
        const userContent: any[] = [];
        
        for (const part of parts) {
            if (part.text) {
                userContent.push({ type: "text", text: part.text });
            } else if (part.inlineData) {
                hasImage = true;
                userContent.push({
                    type: "image_url",
                    image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
                });
            }
        }
        
        messages.push({ role: "user", content: hasImage ? userContent : promptText });

        const payload = {
            model: targetModel,
            messages: messages,
            temperature: temperature,
            response_format: { type: "json_object" }
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${actualApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Groq Error: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const textResponse = data.choices[0].message.content;
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);

    } else {
        const ai = new GoogleGenAI({ apiKey: actualApiKey });
        const response: any = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: { systemInstruction, responseMimeType: "application/json", responseSchema: outputSchema, temperature }
        });
        
        parsed = JSON.parse(response.text);
    }

    // === PISAU CUKUR KEYWORD (SMART BYPASS) ===
    if (mode === 'metadata' && parsed) {
        const targetK = settings.slideKeyword || 40;
        
        // MATIKAN PISAU CUKUR JIKA ADA INSTRUKSI KHUSUS
        // Biarkan data mentah (Master Stock yang 100 keywords) utuh dikirim ke memori aplikasi.
        const shouldBypassSlice = !!settings.metadataCustomInstruction;
        
        const cleanAndSliceKeywords = (rawKws: string) => {
            if (!rawKws) return "";
            let sanitizedKws = rawKws.replace(/-/g, ' ');
            let arr = sanitizedKws.replace(/,/g, ' ').split(/\s+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 2);
            
            if (settings.negativeMetadata) {
                const negWords = settings.negativeMetadata.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
                arr = arr.filter(k => !negWords.some(nw => k.includes(nw)));
            }
            
            arr = [...new Set(arr)]; 
            
            // PISAU CUKUR HANYA BEKERJA JIKA TIDAK ADA INSTRUKSI EKSTERNAL USER
            if (!shouldBypassSlice && arr.length > targetK) {
                arr = arr.slice(0, targetK); 
            }
            return arr.join(', ');
        };

        if (parsed.en && parsed.en.keywords) {
            parsed.en.keywords = cleanAndSliceKeywords(parsed.en.keywords);
        }
        if (parsed.ind && parsed.ind.keywords) {
            parsed.ind.keywords = cleanAndSliceKeywords(parsed.ind.keywords);
        }
    }

    if (mode === 'idea') {
        return {
            metadata: {
                en: { title: parsed.en_idea, keywords: "" },
                ind: { title: parsed.ind_idea, keywords: "" },
                category: settings.ideaCategory === 'auto' ? 'Idea' : settings.ideaCategory
            }
        };
    } else if (mode === 'prompt') {
        return {
            metadata: {
                en: { title: parsed.en_prompt, keywords: "" },
                ind: { title: parsed.ind_prompt, keywords: "" },
                category: 'Prompt'
            }
        };
    } else if (mode === 'qc') {
        return {
            metadata: { en: { title: "", keywords: "" }, ind: { title: "", keywords: "" }, category: "" }, 
            qcResult: {
                score: parsed.score,
                status: parsed.status,
                technicalIssues: parsed.technicalIssues || [],
                ipIssues: parsed.ipIssues || [],
                commercialAdvice: parsed.commercialAdvice
            }
        };
    }

    return {
      metadata: { 
        en: { 
            title: parsed.en?.title || "", 
            description: parsed.en?.description || "", 
            keywords: parsed.en?.keywords || "" 
        }, 
        ind: { 
            title: parsed.ind?.title || "", 
            description: parsed.ind?.description || "", 
            keywords: parsed.ind?.keywords || "" 
        }, 
        category: parsed.categoryAdobe || "2", 
        categoryShutter: parsed.categoryShutter || "",
        // SIMPAN JAWABAN 3 KATEGORI DREAMSTIME DARI AI
        categoryDream: parsed.categoryDream || "112, 145, 105" // Fallback aman
      }
    };
  } catch (error: any) {
    throw error;
  }
};

export const smartFixMetadata = async (
  content: { title?: string; description?: string; keywords?: string },
  sourceLanguage: Language,
  settings: AppSettings,
  providedApiKey: string = ""
): Promise<{ en: any; ind: any }> => {
  const isCanvasMode = settings.apiProvider === 'GEMINI CANVAS';
  const actualApiKey = isCanvasMode 
      ? (process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key') 
      : providedApiKey;
      
  if (!actualApiKey) {
      throw new Error("No API Key available for Auto-Fix");
  }

  const instruction = `Tugas Anda adalah sebagai Proofreader & Translator Agensi Microstock. User baru saja mengedit metadata secara manual.
Tugas Mutlak Anda:
1. TRANSLATION: Jika input dalam Bahasa Indonesia/campuran, terjemahkan ke Bahasa Inggris Profesional untuk field 'en'. Field 'ind' berisi Bahasa Indonesia.
2. TITLE & DESCRIPTION: WAJIB perbaiki grammar. DILARANG KERAS menggunakan tanda koma (,) di field ini!
3. KEYWORDS: Hapus tanda strip (-). Format harus kata tunggal dipisah koma.
4. BLACKLIST: HAPUS kata-kata ini jika ada: ${settings.negativeMetadata}
${settings.metadataCustomInstruction ? `5. SUPREME OVERRIDE RULE: "${settings.metadataCustomInstruction}". Instruksi ini adalah PELECUT dan HUKUM TERTINGGI untuk hasil akhir metadata. Wajib patuhi instruksi ini (misal tentang batas panjang karakter) sebagai prioritas utama di atas aturan lainnya!` : ''}

Input User (${sourceLanguage}):
Title: "${content.title || ''}"
Description: "${content.description || ''}"
Keywords: "${content.keywords || ''}"

Return ONLY valid JSON format:
{
  "en": { "title": "string", "description": "string", "keywords": "string" },
  "ind": { "title": "string", "description": "string", "keywords": "string" }
}`;

  if (settings.apiProvider === 'GROQ API') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${actualApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
              model: settings.geminiModel || 'qwen/qwen3-32b',
              messages: [{ role: "user", content: instruction }],
              temperature: 0.1,
              response_format: { type: "json_object" }
          })
      });
      if (response.ok) {
          const data = await response.json();
          const cleanJson = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanJson);
      }
      throw new Error("Groq Auto-Fix Failed");
  } else {
      const ai = new GoogleGenAI({ apiKey: actualApiKey });
      const response = await ai.models.generateContent({
        model: settings.geminiModel || 'gemini-2.5-flash', 
        contents: instruction,
        config: { 
            temperature: 0.1,
            responseMimeType: "application/json", 
            responseSchema: { 
                type: Type.OBJECT, 
                properties: { 
                    en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } } },
                    ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } } }
                } 
            } 
        }
      });
      return JSON.parse(response.text);
  }
};

export const translateText = async (text: string, targetLang: string, settings: AppSettings, providedApiKey: string = ""): Promise<string> => {
    const isCanvasMode = settings.apiProvider === 'GEMINI CANVAS';
    const actualApiKey = isCanvasMode 
        ? (process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key') 
        : providedApiKey;
        
    if (!actualApiKey) return text;

    if (settings.apiProvider === 'GROQ API') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${actualApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: settings.geminiModel || 'qwen/qwen3-32b',
                messages: [{ role: "user", content: `Translate text to ${targetLang}: ${text}` }],
                temperature: 0.1
            })
        });
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content || text;
        }
        return text;
    } else {
        const ai = new GoogleGenAI({ apiKey: actualApiKey });
        const response = await ai.models.generateContent({
          model: settings.geminiModel || 'gemini-2.5-flash',
          contents: `Translate text to ${targetLang}: ${text}`,
          config: { temperature: 0.1 }
        });
        return response.text || text;
    }
};
