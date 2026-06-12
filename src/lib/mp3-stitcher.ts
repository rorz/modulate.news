import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

export async function stitchMp3Clips(clips: Buffer[]) {
  const ffmpeg = resolveFfmpegPath();

  if (!ffmpeg) {
    throw new Error("No ffmpeg executable is available.");
  }

  const dir = await mkdtemp(join(tmpdir(), "modulate-"));
  const output = join(dir, "episode.mp3");

  try {
    const listFile = join(dir, "clips.txt");
    const files = await Promise.all(
      clips.map(async (clip, index) => {
        const file = join(dir, `${String(index).padStart(3, "0")}.mp3`);
        await writeFile(file, clip);
        return file;
      }),
    );

    await writeFile(listFile, files.map((file) => `file '${file}'`).join("\n"));
    await runFfmpeg(ffmpeg, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-vn",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-b:a",
      "128k",
      "-y",
      output,
    ]);

    return await readFile(output);
  } finally {
    await rm(dir, { force: true, recursive: true });
  }
}

function resolveFfmpegPath() {
  const candidates = [
    process.env.FFMPEG_BIN,
    ffmpegPath,
    "/opt/homebrew/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/usr/bin/ffmpeg",
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function runFfmpeg(ffmpeg: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpeg, args);
    let stderr = "";

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}
