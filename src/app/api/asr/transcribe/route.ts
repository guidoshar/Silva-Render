import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function uuid() {
  return crypto.randomUUID();
}

function getHeader(res: Response, key: string) {
  // Headers are case-insensitive
  return res.headers.get(key) || res.headers.get(key.toLowerCase());
}

async function volcPost(url: string, headers: Record<string, string>, body: any) {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body ?? {}),
  });

  const statusCode = getHeader(resp, "X-Api-Status-Code") || "";
  const message = getHeader(resp, "X-Api-Message") || "";
  const logid = getHeader(resp, "X-Tt-Logid") || "";

  return { resp, statusCode, message, logid };
}

export async function POST(req: Request) {
  try {
    const { audioUrl, format = "webm", language, options } = await req.json();

    if (!audioUrl) {
      return NextResponse.json({ error: "audioUrl is required" }, { status: 400 });
    }

    const APP_KEY = process.env.VOLC_APP_KEY!;
    const ACCESS_KEY = process.env.VOLC_ACCESS_KEY!;
    const RESOURCE_ID = process.env.VOLC_RESOURCE_ID || "volc.seedasr.auc";
    const MODEL_NAME = process.env.VOLC_MODEL_NAME || "bigmodel";
    const MODEL_VERSION = process.env.VOLC_MODEL_VERSION; // optional

    const requestId = uuid();

    // ===== 1) SUBMIT =====
    const submitUrl = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit";

    const submitBody: any = {
      user: {
        uid: "guido-chat", // 你可换成用户id / device id
      },
      audio: {
        url: audioUrl,
        format, // raw / wav / mp3 / ogg ... 这里你录的是 webm，建议你 upload 时转成 wav/mp3，或确认火山支持 webm
      },
      request: {
        model_name: MODEL_NAME,      // bigmodel
        enable_itn: true,
        enable_punc: false,
        enable_ddc: false,
        ...(options || {}),
      },
    };

    if (language) submitBody.audio.language = language;
    if (MODEL_VERSION) submitBody.request.model_version = MODEL_VERSION;

    const commonHeaders = {
      "X-Api-App-Key": APP_KEY,
      "X-Api-Access-Key": ACCESS_KEY,
      "X-Api-Resource-Id": RESOURCE_ID,
      "X-Api-Request-Id": requestId,
      "X-Api-Sequence": "-1",
    };

    const submit = await volcPost(submitUrl, commonHeaders, submitBody);

    if (submit.statusCode !== "20000000") {
      const errText = await submit.resp.text().catch(() => "");
      return NextResponse.json(
        {
          stage: "submit",
          requestId,
          logid: submit.logid,
          volcStatusCode: submit.statusCode,
          volcMessage: submit.message,
          detail: errText,
        },
        { status: 502 }
      );
    }

    // ===== 2) QUERY LOOP =====
    const queryUrl = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/query";

    const start = Date.now();
    const timeoutMs = 45_000;      // 可按音频长度调
    const intervalMs = 900;

    while (true) {
      const elapsed = Date.now() - start;
      if (elapsed > timeoutMs) {
        return NextResponse.json(
          {
            stage: "query",
            requestId,
            error: "ASR timeout",
          },
          { status: 504 }
        );
      }

      const query = await volcPost(queryUrl, commonHeaders, {}); // body 必须是 {}

      const code = query.statusCode;

      if (code === "20000001" || code === "20000002") {
        // processing / queued
        await new Promise((r) => setTimeout(r, intervalMs));
        continue;
      }

      if (code === "20000003") {
        // silent audio
        return NextResponse.json(
          {
            stage: "query",
            requestId,
            logid: query.logid,
            volcStatusCode: code,
            volcMessage: query.message || "silent audio",
          },
          { status: 422 }
        );
      }

      if (code !== "20000000") {
        const errText = await query.resp.text().catch(() => "");
        return NextResponse.json(
          {
            stage: "query",
            requestId,
            logid: query.logid,
            volcStatusCode: code,
            volcMessage: query.message,
            detail: errText,
          },
          { status: 502 }
        );
      }

      // success
      const data = await query.resp.json();

      return NextResponse.json({
        requestId,
        logid: query.logid,
        text: data?.result?.text || "",
        utterances: data?.result?.utterances || [],
        audio_info: data?.audio_info || null,
        raw: data,
      });
    }
  } catch (err) {
    console.error("ASR transcribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
