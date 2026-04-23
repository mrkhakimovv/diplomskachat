import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8683762580:AAHprayZGQoMaUboZxWCbkvJKD6_geYoWFQ';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '7800456837';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/notify", async (req, res) => {
    try {
      const { action, diploma, fileData } = req.body;
      
      if (action === 'UPLOAD') {
         const text = `🎉 Yangi diplom yuklandi!\n\n🎓 Talaba: ${diploma.studentName}\n📚 Yo'nalish: ${diploma.diplomaName}\n📅 Sana: ${diploma.issueDate}\n🆔 ID: ${diploma.id}`;
         
         if (fileData) {
           const matches = fileData.match(/^data:(.+);base64,(.+)$/);
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

              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
                 method: 'POST',
                 body: formData as any
              });
           }
         } else {
           await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
           });
         }
      } else if (action === 'DELETE') {
         const text = `❌ Diplom o'chirildi!\n\n🎓 Talaba: ${diploma.studentName}\n🆔 ID: ${diploma.id}`;
         await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
         });
      } else if (action === 'DOWNLOAD') {
         const text = `⬇️ Diplom yuklab olindi yoki ko'rildi!\n\n🎓 Talaba: ${diploma?.studentName || 'Noma\'lum'}\n🆔 ID: ${diploma?.id || 'Noma\'lum'}`;
         await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_ID, text })
         });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error notifying telegram:", error);
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
