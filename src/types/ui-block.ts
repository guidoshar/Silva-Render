// --- 1.Callout ---
export type UICallout = {
    kind: "callout";
    tone?: "info" | "success" | "warning" | "danger";
    title?: string;
    text: string;
};

// --- 2.Text ---
export type UIText = {
    kind: "text";
    text: string;
};

// --- 3.List ---
export type UIlist ={
    kind: "list";
    title?: string;
    items: string[];
};

// --- 4.Audio ---
export type UIAudio ={
    kind: "audio";
    caption?: string; //介绍语
    url: string | null; //音频链接，null表示生成失败
}
export type UIBlock = UICallout | UIlist | UIText | UIAudio;