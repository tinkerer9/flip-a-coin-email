import PostalMime from "postal-mime";
import { createMimeMessage } from "mimetext";
import { EmailMessage } from "cloudflare:email";

async function getAnswer(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);

    const firstByte = new DataView(hash).getUint8(0);
    const bit = firstByte & 0b00000001;

    return bit ? "heads" : "tails";
}

function normalize(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export default {
    async email(message): Promise<void> {
        const email = await PostalMime.parse(message.raw);

        const input = [
            normalize(message.from),
            normalize(email.subject ?? ""),
            normalize(email.text ?? "")
        ].join("\n");

        const answer = await getAnswer(input);

        console.log(`${answer.toUpperCase()}: "${email.subject}": (${message.from})\n"${(email.text ?? "").replace(/\s+/g, " ").trim()}"`);

        const reply = createMimeMessage();

        const messageId = message.headers.get("Message-ID");
        const references = message.headers.get("References");

        if (messageId) {
            reply.setHeader("In-Reply-To", messageId);

            const referenceChain = [ references, messageId ]
                .filter(Boolean)
                .join(" ");

            reply.setHeader("References", referenceChain);
        }

        reply.setSender({ name: "Flip a Coin", addr: message.to });
        reply.setRecipient(message.from);
        reply.setSubject(`Re: ${(email.subject || "(no subject)").replace(/^(Re:\s*)+/i, "")}`);
        reply.addMessage({
            contentType: "text/plain",
            data: `You flipped ${answer}.`
        });
        reply.addMessage({
            contentType: "text/html",
            data: `\
<div style="font-family: sans-serif; text-align: center;">
<div style="font-size: 64px;">🪙</div>
<p><strong>You flipped</strong></p>
<p style="font-size: 24px;">${answer.toUpperCase()}</p>
</div>`
        });

        await message.reply(
            new EmailMessage(
                message.to,
                message.from,
                reply.asRaw()
            )
        );
    }
} satisfies ExportedHandler;