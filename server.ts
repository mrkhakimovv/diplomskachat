import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8683762580:AAHprayZGQoMaUboZxWCbkvJKD6_geYoWFQ';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '7800456837';
const DB_FILE = path.join(process.cwd(), 'database.json');

// Yardımchi funksiya: JSON bazani o'qish
async function getDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Yardımchi funksiya: JSON bazaga yozish
async function saveDb(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));

  // API: Barcha diplomlarni olish
  app.get('/api/diplomas', async (req, res) => {
    const data = await getDb();
    res.json(data);
  });

  // API: Yangi diplom qo'shish
  app.post('/api/diplomas', async (req, res) => {
    try {
      const prev = await getDb();
      const diploma = req.body;
      await saveDb([diploma, ...prev]);

      // Telegramga bot orqali jo'natish
      const text = `🎉 Yangi diplom yuklandi!\n\n🎓 Talaba: ${diploma.studentName}\n📚 Yo'nalish: ${diploma.diplomaName}\n📅 Sana: ${diploma.issueDate}\n🆔 ID: ${diploma.id}`;
      
      if (diploma.fileData) {
        const matches = diploma.fileData.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const formData = new FormData();
          formData.append('chat_id', TELEGRAM_ADMIN_ID);
          formData.append('caption', text);
          
          const filename = diploma.fileName || 'hujjat.pdf';
          const blob = new Blob([buffer], { type: mimeType });
          formData.append('document', blob, filename);

          // Asinxron tarzda botga yuklash (foydalanuvchini kutttirmaydi)
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
              method: 'POST',
              body: formData as any
          }).catch(e => console.error("Telegram send error:", e));
        }
      } else {
         fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
          }).catch(e => console.error("Telegram send error:", e));
      }
      
      res.json({ success: true, id: diploma.id });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // API: Yuklab olish (Download) statistikasini yangilash
  app.post('/api/diplomas/:id/download', async (req, res) => {
     try {
       const data = await getDb();
       let found = null;
       const next = data.map((d: any) => {
          if (d.id === req.params.id) {
             found = { ...d };
             return { ...d, downloads: (d.downloads || 0) + 1 };
          }
          return d;
       });
       await saveDb(next);

       // Agar topilsa bot orqali xabar
       if (found) {
          const text = `⬇️ Diplom yuklab olindi yoki ko'rildi!\n\n🎓 Talaba: ${(found as any).studentName}\n🆔 ID: ${(found as any).id}`;
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
          }).catch(e=>e);
       }
       res.json({ success: true });
     } catch (error) {
       res.status(500).json({ error: 'Failed to update stats' });
     }
  });

  // API: Diplomni o'chirish
  app.delete('/api/diplomas/:id', async (req, res) => {
     try {
       const data = await getDb();
       const found = data.find((d: any) => d.id === req.params.id);
       const next = data.filter((d: any) => d.id !== req.params.id);
       await saveDb(next);

       // Bot orqali xabar
       if (found) {
          const text = `❌ Diplom o'chirildi!\n\n🎓 Talaba: ${(found as any).studentName}\n🆔 ID: ${(found as any).id}`;
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
          }).catch(e=>e);
       }
       res.json({ success: true });
     } catch (error) {
       res.status(500).json({ error: 'Failed to delete' });
     }
  });

  // Frontend uchun Vite middleware (Ishlab chiqish davrida)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production (ishchi holat): dist papkasini xizmat ko'rsatish
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // PORT ixtiyoriy serverda moslashuvchan bo'ladi
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Muvaffaqiyatli ishga tushdi: http://0.0.0.0:${PORT}`);
  });
}

startServer();
