export type UICallout = {
    kind: "callout";
    tone?: "info" | "success" | "warning" | "danger";
    title?: string;
    text: string;
};

export type UIlist ={
    kind: "list";
    title?: string;
    items: string[];
};

export type UIText = {
    kind: "text";
    text: string;
};

export type UIBlock = UICallout | UIlist | UIText;