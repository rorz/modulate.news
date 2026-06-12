import { put } from "@vercel/blob";

import { generateMusicBuffer, generateSpeechBuffer } from "@/lib/elevenlabs";
import { hasBlobConfig, hasElevenLabsConfig } from "@/lib/env";
import { stitchMp3Clips } from "@/lib/mp3-stitcher";

export async function composeAndStoreEpisodeAudio({
  biteCount,
  episodeId,
  musicPrompt,
  rundown,
  title,
  voiceIds,
}: {
  biteCount: number;
  episodeId: string;
  musicPrompt?: string;
  rundown: string[];
  title: string;
  voiceIds?: string[];
}) {
  if (!musicPrompt || !voiceIds?.[0] || !voiceIds[1] || !hasElevenLabsConfig() || !hasBlobConfig()) {
    return null;
  }

  try {
    const clips: Buffer[] = [];
    const music = await generateMusicBuffer(musicPrompt);

    if (music) clips.push(music);

    const spokenLines = [title, ...rundown];
    const linesPerBite = Math.ceil(spokenLines.length / biteCount);

    for (const [index, line] of spokenLines.entries()) {
      const speech = await generateSpeechBuffer({
        text: line,
        voiceId: voiceIds[index % 2] ?? voiceIds[0],
      });

      if (speech) {
        clips.push(speech);
        const finishedBite = (index + 1) % linesPerBite === 0;
        const hasNextBite = index < spokenLines.length - 1;

        if (music && biteCount > 1 && finishedBite && hasNextBite) {
          clips.push(music);
        }
      }
    }

    if (music) clips.push(music);
    if (clips.length === 0) return null;

    const episode = await stitchMp3Clips(clips);

    const blob = await put(
      `episodes/${episodeId}.mp3`,
      new Blob([episode], {
        type: "audio/mpeg",
      }),
      {
        access: "private",
        addRandomSuffix: false,
        contentType: "audio/mpeg",
      },
    );

    return blob.pathname;
  } catch (error) {
    console.error("Episode audio generation failed", error);
    return null;
  }
}
