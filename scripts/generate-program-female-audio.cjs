const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const SCENES = [
  {
    id: 1,
    en: 'You can spend four years in a traditional college, but most degrees don\'t teach the practical skills tech companies actually want.',
    te: 'మీరు సాధారణ కాలేజీలో నాలుగు ఏళ్లు చదవవచ్చు, కానీ నేటి టెక్ కంపెనీలు కోరుకునే ప్రాక్టికల్ నైపుణ్యాలు డిగ్రీలు అందించలేవు.'
  },
  {
    id: 2,
    en: 'That\'s why NxtWave built a completely different path to high-paying software jobs.',
    te: 'అందుకే అధిక జీతాలు ఇచ్చే సాఫ్ట్‌వేర్ ఉద్యోగాల కోసం నెక్స్ట్‌వేవ్ ఒక సరికొత్త మార్గాన్ని నిర్మించింది.'
  },
  {
    id: 3,
    en: 'First up: A reverse-engineered curriculum. Developers from companies like Amazon looked at what top tech teams need today and built the lessons backward. Instead of memorizing outdated theory, you learn by building real-world applications like a Zomato clone.',
    te: 'మొదటిది: రివర్స్ ఇంజనీరింగ్ కరికులం. అమెజాన్ లాంటి అగ్రశ్రేణి కంపెనీల డెవలపర్లు పరిశ్రమకు ఏమి కావాలో చూసి పాఠాలను రూపొందించారు. పాత థియరీ బట్టి పట్టకుండా, జొమాటో క్లోన్ లాంటి నిజమైన ప్రాజెక్ట్‌లను నిర్మిస్తూ నేర్చుకుంటారు.'
  },
  {
    id: 4,
    en: 'Next, your background is no longer a barrier. Whether you have a non-tech degree, a career gap, or zero coding experience, the step-by-step training takes you from absolute beginner to tech-ready in just a few months.',
    te: 'తరువాత: మీ బ్యాక్‌గ్రౌండ్ ఇకపై అడ్డంకి కాదు. నాన్-టెక్ డిగ్రీ, కెరీర్ గ్యాప్ లేదా జీరో కోడింగ్ అనుభవం ఉన్నా, దశలవారీ శిక్షణతో కొద్ది నెలల్లోనే పూర్తి టెక్-రెడీగా ఎదుగుతారు.'
  },
  {
    id: 5,
    en: 'And finally, unmatched placement support. NxtWave partnered with the government\'s NSDC to create India\'s first Industry-Ready Certification. That official certification unlocks direct interview access to a pool of over three thousand hiring companies.',
    te: 'చివరగా: తిరుగులేని ప్లేస్‌మెంట్ సపోర్ట్. నెక్స్ట్‌వేవ్ భారత ప్రభుత్వ ఎన్‌ఎస్‌డీసీ తో కలిసి భారతదేశపు మొట్టమొదటి ఇండస్ట్రీ-రెడీ సర్టిఫికేషన్‌ను రూపొందించింది. ఇది మూడు వేలకు పైగా కంపెనీల ప్రత్యక్ష ఇంటర్వ్యూలను అన్‌లాక్ చేస్తుంది.'
  },
  {
    id: 6,
    en: 'And the best part? You get unlimited interview opportunities until you actually land a job.',
    te: 'అన్నింటికంటే ముఖ్యమైన విషయం: మీరు జాబ్ సాధించే వరకు అపరిమిత ఇంటర్వ్యూ అవకాశాలు లభిస్తాయి.'
  },
  {
    id: 7,
    en: 'NxtWave isn\'t just an online coding class. It completely bypasses the outdated college system, giving you the exact skills, a proven portfolio, and the industry access you need to step directly into a high-paying tech career.',
    te: 'నెక్స్ట్‌వేవ్ కేవలం ఆన్‌లైన్ కోడింగ్ క్లాస్ మాత్రమే కాదు. ఇది పాత కాలేజీ వ్యవస్థను దాటి, అత్యధిక వేతనం గల టెక్ కెరీర్‌ను అందుకోవడానికి అవసరమైన నైపుణ్యాలు మరియు అవకాశాలను అందిస్తుంది.'
  }
];

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function synthesizeScene(text, lang) {
  // 1. Try Gemini TTS with Kore (female voice)
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // Female voice
          }
        }
      }
    });
    const base64Data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Data) {
      console.log('Synthesized with Gemini TTS (Kore female voice)!');
      const pcmBuf = Buffer.from(base64Data, 'base64');
      return { buffer: pcmToWav(pcmBuf, 24000), ext: 'wav' };
    }
  } catch (err) {
    console.log(`Gemini TTS notice (${err.message?.slice(0, 80)}...). Using Google Female TTS engine.`);
  }

  // 2. Google High Quality Female Voice engine
  const targetLang = lang === 'te' ? 'te' : 'en';
  const chunks = await googleTTS.getAllAudioBase64(text, {
    lang: targetLang,
    slow: false,
    host: 'https://translate.google.com',
    timeout: 15000,
  });
  const audioBuf = Buffer.concat(chunks.map(c => Buffer.from(c.base64, 'base64')));
  return { buffer: audioBuf, ext: 'mp3' };
}

async function run() {
  const outputDir = path.join(process.cwd(), 'public', 'audio', 'program_scenes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const scene of SCENES) {
    // English
    const enFileMp3 = path.join(outputDir, `scene_en_${scene.id}.mp3`);
    const enFileWav = path.join(outputDir, `scene_en_${scene.id}.wav`);
    if (!fs.existsSync(enFileMp3) && !fs.existsSync(enFileWav)) {
      console.log(`Generating EN audio for Scene ${scene.id}...`);
      try {
        const { buffer, ext } = await synthesizeScene(scene.en, 'en');
        const targetPath = ext === 'wav' ? enFileWav : enFileMp3;
        fs.writeFileSync(targetPath, buffer);
        console.log(`Saved ${targetPath} (${buffer.length} bytes)`);
      } catch (err) {
        console.error(`Failed EN scene ${scene.id}:`, err);
      }
    } else {
      console.log(`EN audio already exists for Scene ${scene.id}`);
    }

    // Telugu
    const teFileMp3 = path.join(outputDir, `scene_te_${scene.id}.mp3`);
    const teFileWav = path.join(outputDir, `scene_te_${scene.id}.wav`);
    if (!fs.existsSync(teFileMp3) && !fs.existsSync(teFileWav)) {
      console.log(`Generating TE audio for Scene ${scene.id}...`);
      try {
        const { buffer, ext } = await synthesizeScene(scene.te, 'te');
        const targetPath = ext === 'wav' ? teFileWav : teFileMp3;
        fs.writeFileSync(targetPath, buffer);
        console.log(`Saved ${targetPath} (${buffer.length} bytes)`);
      } catch (err) {
        console.error(`Failed TE scene ${scene.id}:`, err);
      }
    } else {
      console.log(`TE audio already exists for Scene ${scene.id}`);
    }
  }

  console.log('All program female voice narrations ready!');
}

run();
