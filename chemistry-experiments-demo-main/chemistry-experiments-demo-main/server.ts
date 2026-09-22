import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API Routes
  app.post('/api/grade-answer', async (req, res) => {
    try {
      const { question, answer, chapter, type } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          score: 7,
          feedback: "إجابة جيدة لكن ينقصها ذكر الحالات التي تكون فيها القيمة موجبة أو سالبة بدقة. (هذا تقييم تجريبي لعدم وجود مفتاح API)",
          correctAnswer: "الإنثالبي (ΔH) هو دالة حالة ثرموديناميكية... وتكون قيمته موجبة في التفاعلات الماصة وسالبة في التفاعلات الباعثة للحرارة."
        });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت أستاذ كيمياء عراقي للصف السادس العلمي. 
قام الطالب بإجابة السؤال التالي من الفصل: ${chapter}
السؤال (${type}): ${question}
إجابة الطالب: ${answer}
قم بتقييم الإجابة. إذا لم تكن كاملة، أعطِ الطالب درجة جزئية حسب ما كتبه.
رد بصيغة JSON فقط تحتوي على:
{ "score": number (0 to 10), "feedback": "string explaining why and what is missing in Arabic", "correctAnswer": "the ideal correct answer" }`
      });
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-mcq', async (req, res) => {
    try {
      const { chapterTitle, count } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          questions: [
            { text: "ماهو رمز عنصر الأوكسجين؟", options: ["O", "H", "C", "N"], correctOptionIndex: 0 },
            { text: "ما هي وحدة قياس الانثالبي؟", options: ["Joule", "Newton", "Pascal", "Watt"], correctOptionIndex: 0 },
            { text: "أي من التالي حمض قوي؟", options: ["HCl", "CH3COOH", "H2CO3", "H2S"], correctOptionIndex: 0 },
            { text: "ما هو عدد تأكسد الهيدروجين في مركباته عادة؟", options: ["+1", "-1", "0", "+2"], correctOptionIndex: 0 },
            { text: "أحد شروط التفاعل التلقائي", options: ["ΔG سالب", "ΔG موجب", "ΔG صفر", "لا يعتمد على ΔG"], correctOptionIndex: 0 }
          ]
        });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت أستاذ كيمياء. قم بإنشاء ${count} أسئلة اختيارات من متعدد (MCQ) للفصل: ${chapterTitle} (كيمياء السادس العلمي).
رد بصيغة JSON فقط:
{ "questions": [ { "id": "q1", "text": "Question text?", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "explanation": "Why this is correct" } ] }`
      });
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve chapter_3 static files
  app.use('/chapter_3', express.static(path.join(process.cwd(), 'public', 'chapter_3')));

  // Serve chapter_2 static files
  app.use('/chapter_2', express.static(path.join(process.cwd(), 'public', 'chapter_2')));

  // Vite middleware for dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
