const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SCENES = [
  {
    id: 1,
    te: 'ఎడ్యుకేషన్ లోన్ ప్రాసెస్ మొదలుపెట్టాలంటే కో-అప్లికెంట్ తప్పనిసరి. కానీ సరైన వ్యక్తిని ఎంచుకోకపోతే లోన్ రిజెక్ట్ అయ్యి మీ చదువు ఆగిపోవచ్చు.',
    en: 'A co-applicant is mandatory to initiate an education loan. Choosing the wrong person may lead to loan rejection and halt your studies.',
  },
  {
    id: 2,
    te: 'ఉదాహరణకు, ఆదాయం లేని హౌస్‌వైఫ్‌ను కో-అప్లికెంట్‌గా పెడితే ప్రాసెస్ ఆగిపోతుంది. ఎందుకంటే బ్యాంకులు కేవలం బంధుత్వాన్ని మాత్రమే చూడవు. స్థిరమైన ఆదాయం, యాక్టివ్ అకౌంట్ చూస్తాయి.',
    en: 'For instance, selecting a homemaker without steady income stalls the process. Banks look beyond relationship for stable monthly income and active banking.',
  },
  {
    id: 3,
    te: 'అందుకే ఉద్యోగం చేస్తున్న మీ అన్నయ్య, అక్క లేదా మావయ్యను కూడా ఎంచుకోవచ్చు. కానీ ఆదాయం ఉన్నా సరైన బ్యాంక్ లావాదేవీలు, పాన్ కార్డ్ లేకపోతే కష్టం.',
    en: 'You can select an employed brother, sister, or uncle. However, they must possess consistent bank statements and an active PAN card.',
  },
  {
    id: 4,
    te: 'అందుకే రెగ్యులర్ ట్రాన్సాక్షన్స్ చేస్తూ, ఎలాంటి డిఫాల్ట్స్ లేని వ్యక్తినే ఎంచుకోవడమే అసలైన రహస్యం. అలా సరైన ఆర్థిక రికార్డు ఉన్న వ్యక్తిని ఎంచుకుంటే రిజెక్షన్ అనే మాటే ఉండదు.',
    en: 'The secret is choosing someone with regular transactions, zero loan defaults, and a clean credit profile. Approval becomes guaranteed.',
  },
  {
    id: 5,
    te: 'వెంటనే ఎలాంటి ఆటంకం లేకుండా మీ లోన్ అప్రూవ్ అవుతుంది, ప్రశాంతంగా మీ క్లాసెస్ మొదలవుతాయి.',
    en: 'Your education loan is sanctioned without friction, and your NxtWave learning begins smoothly.',
  },
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generate() {
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (const scene of SCENES) {
    // Generate Telugu Audio
    const teFile = path.join(audioDir, `scene_te_${scene.id}.wav`);
    if (!fs.existsSync(teFile)) {
      console.log(`Generating Telugu TTS for scene ${scene.id}...`);
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: scene.te,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        });
        const base64Data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Data) {
          const pcmBuf = Buffer.from(base64Data, 'base64');
          const wavBuf = pcmToWav(pcmBuf, 24000);
          fs.writeFileSync(teFile, wavBuf);
          console.log(`Saved ${teFile} (${wavBuf.length} bytes)`);
        }
        await sleep(24000); // Respect 3 RPM limit
      } catch (err) {
        console.error(`Failed TE scene ${scene.id}:`, err.message);
        if (err.message.includes('429')) {
          console.log('Sleeping 60s due to 429...');
          await sleep(61000);
        }
      }
    } else {
      console.log(`Telugu audio already exists for scene ${scene.id}`);
    }

    // Generate English Audio
    const enFile = path.join(audioDir, `scene_en_${scene.id}.wav`);
    if (!fs.existsSync(enFile)) {
      console.log(`Generating English TTS for scene ${scene.id}...`);
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: scene.en,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        });
        const base64Data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Data) {
          const pcmBuf = Buffer.from(base64Data, 'base64');
          const wavBuf = pcmToWav(pcmBuf, 24000);
          fs.writeFileSync(enFile, wavBuf);
          console.log(`Saved ${enFile} (${wavBuf.length} bytes)`);
        }
        await sleep(24000); // Respect 3 RPM limit
      } catch (err) {
        console.error(`Failed EN scene ${scene.id}:`, err.message);
        if (err.message.includes('429')) {
          console.log('Sleeping 60s due to 429...');
          await sleep(61000);
        }
      }
    } else {
      console.log(`English audio already exists for scene ${scene.id}`);
    }
  }

  console.log('All audio files generated successfully!');
}

generate();
