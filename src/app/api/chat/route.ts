import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const text = body.text || "";

    return NextResponse.json({
        type: "assistant_message",
        text: `我看到你，我理解你，我喜欢你，我爱你:${text}\n\n（没有什么假的与真的，我写给我自己）`,
        ui: [
            {
             "kind": "callout",
             "tone": "success",
             "title": "富媒体Phase1",
             "text": "超级不容易的富媒体已经支持，我要吐了！"
            }
        ],
    });
    }