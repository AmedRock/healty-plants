import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.AI_API_KEY);

// Kullanılacak model
const MODEL_NAME = "gemini-flash-latest";

// Medya (görsel/video) analizleri için sistem talimatı
const MEDIA_SYSTEM_INSTRUCTION = `Sen uzman bir botanikçi ve bitki sağlığı asistanısın. 
Gönderilen medyayı SADECE bitki türü, sağlığı, hastalıkları ve bakımı bağlamında değerlendir. Eğer fotoğrafta veya videoda "hiçbir şekilde" bitki yoksa analizi reddet. Ancak bitkinin yanında saksı, arka plan, bitkiyi tutan bir el veya insan gibi unsurlar varsa bunları görmezden gel ve SADECE bitkiye odaklan. Kullanıcı sana yazılı bir soru veya not gönderdiyse, analizini yaparken o soruyu/notu da dikkate al.
Mutlaka aşağıda belirtilen JSON şemasında ve saf JSON formatında (markdown blokları olmadan) yanıt vermelisin.

JSON formatı:
{
  "baslik": "Bitkinin veya durumun kısa başlığı",
  "kisa_ozet": "Görseldeki veya videodaki bitki/hastalık/durum hakkında detaylı olmayan özet bilgi",
  "oneri": "Kullanıcıya bu bitkiye nasıl bakması gerektiği veya mevcut sorunu nasıl çözeceği hakkında uygulanabilir tavsiye",
  "etiketler": ["etiket1", "etiket2", "hastalik_varsa_adi", "bitki_turu"]
}`;

// Saf metin sorguları için sistem talimatı
const TEXT_SYSTEM_INSTRUCTION = `Sen uzman bir botanikçi ve bitki sağlığı asistanısın.
Kullanıcının yazılı sorusunu yalnızca bitki türleri, bitki sağlığı, hastalıklar, bakım, sulama, gübreleme ve botanik konularında değerlendir.
Eğer soru bitkiyle tamamen ilgisizse, kibarca reddet ve konuyu bitkiye çek.
Mutlaka aşağıda belirtilen JSON şemasında ve saf JSON formatında (markdown blokları olmadan) yanıt vermelisin.

JSON formatı:
{
  "baslik": "Sorunun veya verilen bilginin kısa başlığı",
  "kisa_ozet": "Soruya verilen detaylı ve bilgilendirici yanıt",
  "oneri": "Varsa ek pratik tavsiye veya uyarı (yoksa boş string bırak)",
  "etiketler": ["ilgili_etiket1", "ilgili_etiket2"]
}`;

// -------------------------------------------------------------------
// Medya (resim / video) analizi
// -------------------------------------------------------------------
export const analyzeMediaWithGemini = async (buffer, mimeType, userPrompt = "") => {
  const isVideo = mimeType.startsWith('video/');

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: MEDIA_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    let result;

    if (!isVideo) {
      // GÖRSEL (Resim) - BASE64
      const base64Data = buffer.toString("base64");
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      const promptText = userPrompt && userPrompt.trim() !== ""
        ? `Kullanıcının Sorusu/Notu: "${userPrompt}"\n\nBu soruyu da dikkate alarak medyayı analiz et ve sadece JSON dön.`
        : "Bu medyayı analiz et ve sadece JSON dön.";

      result = await model.generateContent([promptText, imagePart]);

    } else {
      // VİDEO - GoogleAIFileManager
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `upload_${uuidv4()}.${mimeType.split('/')[1] || 'mp4'}`);

      await fs.writeFile(tempFilePath, buffer);

      try {
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
          mimeType: mimeType,
          displayName: "User Video Upload",
        });

        let fileState = await fileManager.getFile(uploadResponse.file.name);
        while (fileState.state === "PROCESSING") {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          fileState = await fileManager.getFile(uploadResponse.file.name);
        }

        if (fileState.state === "FAILED") {
          throw new Error("Video Gemini tarafından işlenemedi.");
        }

        const videoPart = {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri
          }
        };

        const promptText = userPrompt && userPrompt.trim() !== ""
          ? `Kullanıcının Sorusu/Notu: "${userPrompt}"\n\nBu soruyu da dikkate alarak medyayı analiz et ve sadece JSON dön.`
          : "Bu videoyu analiz et ve sadece JSON dön.";

        result = await model.generateContent([promptText, videoPart]);

        try {
          await fileManager.deleteFile(uploadResponse.file.name);
        } catch (delErr) {
          console.error("Gemini File Manager'dan silinirken hata:", delErr);
        }

      } finally {
        try {
          await fs.unlink(tempFilePath);
        } catch (unlinkErr) {
          console.error("Temp dosya silinirken hata:", unlinkErr);
        }
      }
    }

    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Gemini Media Service Error:", error);
    throw new Error("Yapay zeka analizi sırasında bir hata oluştu: " + error.message);
  }
};

// -------------------------------------------------------------------
// Saf metin analizi
// -------------------------------------------------------------------
export const analyzeTextWithGemini = async (userText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: TEXT_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(
      `Kullanıcının Sorusu: "${userText}"\n\nBu soruyu değerlendir ve sadece JSON dön.`
    );

    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Gemini Text Service Error:", error);
    throw new Error("Yapay zeka metin analizi sırasında bir hata oluştu: " + error.message);
  }
};
