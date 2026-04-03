import SourceChunks from "./SourceChunks";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const notFound = !isUser && message.content?.toLowerCase().includes("could not find that in the document");

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${isUser ? "bg-zinc-200 text-zinc-600" : "bg-zinc-800 text-white"}`}>
        {isUser ? "U" : "A"}
      </div>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-800 text-white rounded-br-sm"
            : notFound
            ? "bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-sm"
            : "bg-white border border-zinc-100 text-zinc-800 shadow-sm rounded-bl-sm"
        }`}>
          {message.content}
        </div>
        {!isUser && <SourceChunks sources={message.sources} />}
      </div>
    </div>
  );
}